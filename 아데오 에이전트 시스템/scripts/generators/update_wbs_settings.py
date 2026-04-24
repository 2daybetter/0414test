"""
update_wbs_settings.py -복사된 WBS Google Sheet의 설정 탭을 업데이트한다.

project-kickoff 스킬에서 rfp-analyzer가 복사해 둔 WBS 파일을 찾아
설정 탭의 프로젝트 정보를 실제 값으로 업데이트한다.
새 파일을 생성하지 않는다 -반드시 이미 복사된 파일에만 사용한다.

Usage:
  python update_wbs_settings.py \\
    --sheet-id "SPREADSHEET_ID" \\
    --project "프로젝트명" \\
    --start 2026-05-04 \\
    --end 2026-11-15 \\
    --pm "김철수"

  # 인증 없이 업데이트 항목 목록만 확인:
  python update_wbs_settings.py \\
    --sheet-id "DUMMY" \\
    --project "테스트" --start 2026-05-04 --end 2026-11-15 \\
    --dry-run

출력 (stdout):
  SHEET_ID=<sheet_id>
  SHEET_URL=https://docs.google.com/spreadsheets/d/<id>/edit
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

# ── 상수 ────────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(".status/report-config.yaml")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.projects",
]
APPS_SCRIPT_PATH = Path(__file__).parent.parent / "apps_script" / "wbs_weekly_report.js"

# 설정 탭에서 업데이트할 키 목록
SETTINGS_KEYS = ["프로젝트명", "프로젝트 시작일", "프로젝트 종료일", "프로젝트 PM", "타임라인 길이(일)"]


# ── 인증 ────────────────────────────────────────────────────────────────────────
def get_creds():
    """서비스 계정 우선, 없으면 OAuth 브라우저 인증."""
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}
        cred_path = config.get("service_account_path", "")
        if cred_path and Path(cred_path).exists():
            return Credentials.from_service_account_file(cred_path, scopes=SCOPES)
    return gspread.oauth(scopes=SCOPES).auth


# ── 설정 탭 업데이트 ──────────────────────────────────────────────────────────────
def build_values_map(args) -> dict:
    """인자로부터 설정 탭에 쓸 값 딕셔너리를 만든다."""
    try:
        start_dt = datetime.strptime(args.start, "%Y-%m-%d").date()
        end_dt   = datetime.strptime(args.end,   "%Y-%m-%d").date()
        timeline_days = str((end_dt - start_dt).days + 1)
    except ValueError as e:
        print(f"[ERROR] 날짜 형식 오류: {e}")
        sys.exit(1)

    return {
        "프로젝트명":        args.project,
        "프로젝트 시작일":   args.start,
        "프로젝트 종료일":   args.end,
        "프로젝트 PM":       args.pm,
        "타임라인 길이(일)": timeline_days,
    }


def update_settings(gc, sheet_id: str, values_map: dict) -> int:
    """설정 탭 B열을 values_map으로 업데이트한다. 업데이트된 항목 수를 반환."""
    sh = gc.open_by_key(sheet_id)

    try:
        ws = sh.worksheet("설정")
    except gspread.WorksheetNotFound:
        print(f"[ERROR] '설정' 탭을 찾을 수 없습니다. 시트 ID: {sheet_id}")
        sys.exit(1)

    all_values = ws.get_all_values()
    batch = []
    for i, row in enumerate(all_values, 1):
        if not row:
            continue
        key = row[0].strip()
        if key in values_map:
            batch.append({"range": f"B{i}", "values": [[values_map[key]]]})

    if batch:
        ws.batch_update(batch)

    return len(batch)


# ── Apps Script 바인딩 ────────────────────────────────────────────────────────
def bind_apps_script(creds, sheet_id: str) -> None:
    """wbs_weekly_report.js를 Sheet에 컨테이너 바인딩 Apps Script로 배포한다."""
    if not APPS_SCRIPT_PATH.exists():
        print(f"[update_wbs_settings] 경고: Apps Script 파일 없음 ({APPS_SCRIPT_PATH}), 건너뜀")
        return

    js_source = APPS_SCRIPT_PATH.read_text(encoding="utf-8")
    try:
        script_svc = build("script", "v1", credentials=creds)
        project = script_svc.projects().create(body={
            "title": "WBS 주간보고",
            "parentId": sheet_id,
        }).execute()
        script_id = project["scriptId"]
        script_svc.projects().updateContent(
            scriptId=script_id,
            body={"files": [
                {"name": "Code",       "type": "SERVER_JS", "source": js_source},
                {"name": "appsscript", "type": "JSON",
                 "source": '{"timeZone":"Asia/Seoul","exceptionLogging":"STACKDRIVER","runtimeVersion":"V8"}'},
            ]},
        ).execute()
        print(f"[update_wbs_settings] Apps Script 바인딩 완료 (scriptId: {script_id})")
    except Exception as e:
        print(f"[update_wbs_settings] 경고: Apps Script 바인딩 실패 -{e}")
        print("[update_wbs_settings] Apps Script API 활성화 여부 확인: "
              "https://console.cloud.google.com/apis/library/script.googleapis.com")


# ── dry-run 출력 ────────────────────────────────────────────────────────────────
def print_dry_run(values_map: dict) -> None:
    print("\n[dry-run] 실제 Drive API 호출 없이 업데이트 항목을 출력합니다.\n")
    print("── 설정 탭 업데이트 항목 ────────────────────────────────────")
    for key, val in values_map.items():
        print(f"  {key:20s} → {val}")
    print("\n[dry-run] 검증 완료 -위 항목이 설정 탭 B열에 기록됩니다.\n")


# ── 메인 ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="WBS 설정 탭 업데이트 (복사된 템플릿 전용 - project-kickoff Step 3)"
    )
    parser.add_argument("--sheet-id", required=True, help="복사된 WBS Google Spreadsheet ID")
    parser.add_argument("--project",  required=True, help="프로젝트명")
    parser.add_argument("--start",    required=True, help="프로젝트 시작일 YYYY-MM-DD")
    parser.add_argument("--end",      required=True, help="프로젝트 종료일 YYYY-MM-DD")
    parser.add_argument("--pm",       default="PM",  help="프로젝트 PM 이름 (기본: PM)")
    parser.add_argument("--dry-run",  action="store_true",
                        help="인증 없이 업데이트 항목 목록만 출력 (테스트용)")
    args = parser.parse_args()

    values_map = build_values_map(args)

    if args.dry_run:
        print_dry_run(values_map)
        return

    creds = get_creds()
    gc = gspread.authorize(creds)

    print(f"[update_wbs_settings] 설정 탭 업데이트 시작 -시트 ID: {args.sheet_id}")
    count = update_settings(gc, args.sheet_id, values_map)
    print(f"[update_wbs_settings] 설정 업데이트 완료 ({count}개 항목)")

    bind_apps_script(creds, args.sheet_id)

    url = f"https://docs.google.com/spreadsheets/d/{args.sheet_id}/edit"
    print(f"SHEET_ID={args.sheet_id}")
    print(f"SHEET_URL={url}")


if __name__ == "__main__":
    main()
