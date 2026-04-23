"""
gen_wbs_gsheet.py — WBS Google Sheet 생성기 (템플릿 복사 방식)

wbs_template(ID: 17j4iteImNMV9s5x1GEk_lJQ9AjkKlBUINTbUPFXYBkY)을 복사하여
프로젝트별 WBS Sheet를 생성하고, 설정 탭을 프로젝트 정보로 업데이트한다.
설정 탭의 값만 바꾸면 대시보드·WBS 일정·주간보고 탭이 자동 반영된다.

Usage:
  python gen_wbs_gsheet.py \\
    --project "프로젝트명" \\
    --start 2026-05-04 \\
    --end 2026-11-15 \\
    --pm "김철수" \\
    --folder-id "GOOGLE_DRIVE_FOLDER_ID"

출력 (stdout):
  SHEET_ID=<new_sheet_id>
  SHEET_URL=https://docs.google.com/spreadsheets/d/<id>/edit

Apps Script:
  scripts/apps_script/wbs_weekly_report.js 내용을 자동으로 바인딩한다.
  Apps Script API가 비활성화된 경우 경고를 출력하고 계속 진행한다.
"""
import argparse
import sys
import yaml
from datetime import datetime
from pathlib import Path

try:
    import gspread
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
except ImportError:
    print("[ERROR] 필요 패키지: pip install gspread google-auth google-api-python-client")
    sys.exit(1)

# ── 상수 ───────────────────────────────────────────────────────────────────────
TEMPLATE_ID = "17j4iteImNMV9s5x1GEk_lJQ9AjkKlBUINTbUPFXYBkY"
CONFIG_PATH = Path(".status/report-config.yaml")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.projects",
]

APPS_SCRIPT_PATH = Path(__file__).parent.parent / "apps_script" / "wbs_weekly_report.js"

# 설정 탭에서 업데이트할 항목명 → 인자 매핑
SETTINGS_KEYS = {
    "프로젝트명": "project",
    "프로젝트 시작일": "start",
    "프로젝트 종료일": "end",
    "프로젝트 PM": "pm",
}


# ── 인증 ───────────────────────────────────────────────────────────────────────
def get_creds():
    """서비스 계정 우선, 없으면 OAuth."""
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}
        cred_path = config.get("service_account_path", "")
        if cred_path and Path(cred_path).exists():
            return Credentials.from_service_account_file(cred_path, scopes=SCOPES)
    return gspread.oauth(scopes=SCOPES).auth


# ── 템플릿 복사 ────────────────────────────────────────────────────────────────
def copy_template(drive_svc, project_name: str, folder_id: str) -> str:
    """wbs_template을 지정 폴더에 복사하고 새 파일 ID를 반환한다."""
    today = datetime.today().strftime("%Y%m%d")
    file_name = f"WBS_{project_name}_{today}"

    body = {"name": file_name}
    if folder_id:
        body["parents"] = [folder_id]

    copied = drive_svc.files().copy(fileId=TEMPLATE_ID, body=body).execute()
    file_id = copied["id"]
    print(f"[gen_wbs_gsheet] 복사 완료: {file_name} (ID: {file_id})")
    return file_id


# ── 설정 탭 업데이트 ───────────────────────────────────────────────────────────
def update_settings(gc, sheet_id: str, args) -> None:
    """설정 탭의 '값 입력' 열(B열)을 프로젝트 정보로 업데이트한다."""
    sh = gc.open_by_key(sheet_id)
    ws = sh.worksheet("설정")
    all_values = ws.get_all_values()

    # 전체 기간(일) 계산 → 타임라인 길이 자동 업데이트
    try:
        start_dt = datetime.strptime(args.start, "%Y-%m-%d").date()
        end_dt = datetime.strptime(args.end, "%Y-%m-%d").date()
        timeline_days = (end_dt - start_dt).days + 1
    except ValueError:
        timeline_days = None

    values_map = {
        "프로젝트명": args.project,
        "프로젝트 시작일": args.start,
        "프로젝트 종료일": args.end,
        "프로젝트 PM": args.pm,
    }
    if timeline_days:
        values_map["타임라인 길이(일)"] = str(timeline_days)

    batch = []
    for i, row in enumerate(all_values, 1):
        if not row:
            continue
        key = row[0].strip()
        if key in values_map:
            batch.append({
                "range": f"B{i}",
                "values": [[values_map[key]]],
            })

    if batch:
        ws.batch_update(batch)
    print(f"[gen_wbs_gsheet] 설정 업데이트 완료 ({len(batch)}개 항목)")


# ── Apps Script 바인딩 ────────────────────────────────────────────────────────
def bind_apps_script(creds, sheet_id: str) -> None:
    """wbs_weekly_report.js를 복사된 Sheet에 컨테이너 바인딩 Apps Script로 배포한다."""
    if not APPS_SCRIPT_PATH.exists():
        print(f"[gen_wbs_gsheet] 경고: Apps Script 파일 없음 ({APPS_SCRIPT_PATH}), 건너뜀")
        return

    js_source = APPS_SCRIPT_PATH.read_text(encoding="utf-8")

    try:
        script_svc = build("script", "v1", credentials=creds)

        # 컨테이너 바인딩 프로젝트 생성 (parentId = spreadsheet ID)
        project = script_svc.projects().create(body={
            "title": "WBS 주간보고",
            "parentId": sheet_id,
        }).execute()
        script_id = project["scriptId"]

        # 스크립트 내용 업데이트
        script_svc.projects().updateContent(
            scriptId=script_id,
            body={
                "files": [
                    {
                        "name": "Code",
                        "type": "SERVER_JS",
                        "source": js_source,
                    },
                    {
                        "name": "appsscript",
                        "type": "JSON",
                        "source": '{"timeZone":"Asia/Seoul","exceptionLogging":"STACKDRIVER","runtimeVersion":"V8"}',
                    },
                ]
            },
        ).execute()
        print(f"[gen_wbs_gsheet] Apps Script 바인딩 완료 (scriptId: {script_id})")

    except Exception as e:
        print(f"[gen_wbs_gsheet] 경고: Apps Script 바인딩 실패 — {e}")
        print("[gen_wbs_gsheet] Apps Script API 활성화 여부를 확인하세요: "
              "https://console.cloud.google.com/apis/library/script.googleapis.com")


# ── 메인 ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="WBS Google Sheet 생성기 (템플릿 복사)")
    parser.add_argument("--project",   required=True, help="프로젝트명")
    parser.add_argument("--start",     required=True, help="프로젝트 시작일 YYYY-MM-DD")
    parser.add_argument("--end",       required=True, help="프로젝트 종료일 YYYY-MM-DD")
    parser.add_argument("--pm",        default="PM",  help="프로젝트 PM 이름")
    parser.add_argument("--folder-id", default="",    help="저장할 Google Drive 폴더 ID")
    args = parser.parse_args()

    creds = get_creds()
    gc = gspread.authorize(creds)
    drive_svc = build("drive", "v3", credentials=creds)

    # 1. 템플릿 복사
    new_id = copy_template(drive_svc, args.project, args.folder_id)

    # 2. 설정 탭 업데이트
    update_settings(gc, new_id, args)

    # 3. Apps Script 바인딩
    bind_apps_script(creds, new_id)

    url = f"https://docs.google.com/spreadsheets/d/{new_id}/edit"
    print(f"[gen_wbs_gsheet] WBS 생성 완료")
    print(f"SHEET_ID={new_id}")
    print(f"SHEET_URL={url}")


if __name__ == "__main__":
    main()
