"""
copy_template.py -신규 프로젝트 폴더에 아데오 표준 템플릿을 복사한다.

아데오 프로젝트 > template 폴더의 하위 폴더 3개 + 파일 4개를
지정된 프로젝트 폴더로 복사하고, 파일명을 실제 프로젝트명으로 변환한다.

rfp-analyzer Phase 3-3에서 호출된다.

Usage:
  python copy_template.py \\
    --project-folder-id "GOOGLE_DRIVE_FOLDER_ID" \\
    --project-name "더케이예다함-홈페이지개편"

  # 인증 없이 복사 대상 목록만 확인:
  python copy_template.py \\
    --project-folder-id "DUMMY" \\
    --project-name "테스트" \\
    --dry-run

출력 (stdout):
  WBS_FILE_ID=<copied_wbs_sheet_id>
  WBS_FILE_URL=https://docs.google.com/spreadsheets/d/<id>/edit
"""
import argparse
import sys
import yaml
from pathlib import Path

try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    import gspread
except ImportError:
    print("[ERROR] 필요 패키지: pip install gspread google-auth google-api-python-client")
    sys.exit(1)

# ── 상수 ────────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(".status/report-config.yaml")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# 복사 대상 하위 폴더 (이름, 소스 ID)
TEMPLATE_FOLDERS = [
    ("10.WBS",     "1mboMQsZBZIN4u165r7omWKVXClaD3XNl"),
    ("11.주간보고", "12qn96j3T4FiaYashK2UJsC28eTUg3Bv8"),
    ("12.월간보고", "1wvDKJR4-yAQS2nI-o7QK8olkvsIFBe-O"),
]

# 복사 대상 파일 (파일명 패턴, 소스 ID)
# '프로젝트명(템플릿)' 부분이 실제 프로젝트명으로 치환된다
TEMPLATE_FILES = [
    ("PM-03_WBS_프로젝트명(템플릿)",            "17j4iteImNMV9s5x1GEk_lJQ9AjkKlBUINTbUPFXYBkY"),
    ("AY-01_요구사항정의서_프로젝트명(템플릿)", "1EamAWmOOg596BlKREsYvJ8fHwuStM-73"),
    ("제안서_목차_프로젝트명(템플릿)",          "1NuekQ_5IjArhoypuAR8_Wu9BPEpdQ_BN"),
    ("DE-02_IA설계서_프로젝트명(템플릿)",       "15-_nHuibTR-q4IdgTujsaIdEw8TfSjN7"),
]

# WBS 파일 ID (복사 후 ID를 별도 출력하기 위해 추적)
WBS_TEMPLATE_ID = "17j4iteImNMV9s5x1GEk_lJQ9AjkKlBUINTbUPFXYBkY"


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


# ── 유틸 ────────────────────────────────────────────────────────────────────────
def resolve_name(template_name: str, project_name: str) -> str:
    """'프로젝트명(템플릿)' 패턴을 실제 프로젝트명으로 치환한다."""
    return template_name.replace("프로젝트명(템플릿)", project_name)


# ── Drive 헬퍼 ──────────────────────────────────────────────────────────────────
def create_folder(drive_svc, name: str, parent_id: str) -> str:
    body = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    result = drive_svc.files().create(body=body, fields="id").execute()
    return result["id"]


def copy_file(drive_svc, file_id: str, new_name: str, parent_id: str) -> str:
    body = {"name": new_name, "parents": [parent_id]}
    result = drive_svc.files().copy(fileId=file_id, body=body, fields="id").execute()
    return result["id"]


def copy_folder_contents(drive_svc, src_id: str, dst_id: str, project_name: str, depth: int = 0) -> None:
    """소스 폴더의 모든 파일·서브폴더를 대상 폴더에 재귀 복사한다."""
    indent = "  " * (depth + 2)
    results = drive_svc.files().list(
        q=f"'{src_id}' in parents and trashed=false",
        fields="files(id, name, mimeType)",
        pageSize=100,
    ).execute()
    items = results.get("files", [])

    for item in items:
        name = resolve_name(item["name"], project_name)
        if item["mimeType"] == "application/vnd.google-apps.folder":
            new_sub_id = create_folder(drive_svc, name, dst_id)
            print(f"{indent}[폴더] {name}")
            copy_folder_contents(drive_svc, item["id"], new_sub_id, project_name, depth + 1)
        else:
            copy_file(drive_svc, item["id"], name, dst_id)
            print(f"{indent}[파일] {name}")


# ── dry-run 출력 ────────────────────────────────────────────────────────────────
def print_dry_run(project_name: str) -> None:
    print("\n[dry-run] 실제 Drive API 호출 없이 복사 대상 목록을 출력합니다.\n")
    print("── 하위 폴더 (3개) ─────────────────────────────────────────")
    for name, src_id in TEMPLATE_FOLDERS:
        print(f"  폴더: {name}  (소스 ID: {src_id})")
    print("\n── 루트 파일 (4개) ─────────────────────────────────────────")
    for template_name, src_id in TEMPLATE_FILES:
        new_name = resolve_name(template_name, project_name)
        print(f"  {template_name}")
        print(f"    → 복사 후 이름: {new_name}")
        print(f"    → 소스 ID: {src_id}")
    print("\n[dry-run] 검증 완료 -위 목록이 실제 복사됩니다.\n")


# ── 메인 ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="아데오 프로젝트 템플릿 복사기 (rfp-analyzer Phase 3-3)"
    )
    parser.add_argument("--project-folder-id", required=True, help="신규 프로젝트 Google Drive 폴더 ID")
    parser.add_argument("--project-name",       required=True, help="실제 프로젝트명 (파일명에 반영됨)")
    parser.add_argument("--dry-run",            action="store_true",
                        help="인증 없이 복사 대상 목록만 출력 (테스트용)")
    args = parser.parse_args()

    if args.dry_run:
        print_dry_run(args.project_name)
        return

    creds = get_creds()
    drive_svc = build("drive", "v3", credentials=creds)

    project_folder_id = args.project_folder_id
    project_name = args.project_name

    print(f"[copy_template] 템플릿 복사 시작 -프로젝트: {project_name}")
    print(f"[copy_template] 대상 폴더 ID: {project_folder_id}\n")

    # 1. 하위 폴더 3개 생성 + 내용 재귀 복사
    print("── 하위 폴더 복사 (1/2) ────────────────────────────────────")
    for folder_name, src_id in TEMPLATE_FOLDERS:
        new_folder_id = create_folder(drive_svc, folder_name, project_folder_id)
        print(f"  [폴더] {folder_name} → ID: {new_folder_id}")
        copy_folder_contents(drive_svc, src_id, new_folder_id, project_name)

    # 2. 루트 파일 4개 복사 + 파일명 변환
    print("\n── 파일 복사 (2/2) ─────────────────────────────────────────")
    wbs_file_id = None
    for template_name, src_id in TEMPLATE_FILES:
        new_name = resolve_name(template_name, project_name)
        new_id = copy_file(drive_svc, src_id, new_name, project_folder_id)
        print(f"  [파일] {new_name}")
        print(f"         소스: {src_id} → 복사본: {new_id}")
        if src_id == WBS_TEMPLATE_ID:
            wbs_file_id = new_id

    print(f"\n[copy_template] 복사 완료 -폴더 {len(TEMPLATE_FOLDERS)}개 + 파일 {len(TEMPLATE_FILES)}개")

    if wbs_file_id:
        wbs_url = f"https://docs.google.com/spreadsheets/d/{wbs_file_id}/edit"
        print(f"WBS_FILE_ID={wbs_file_id}")
        print(f"WBS_FILE_URL={wbs_url}")
    else:
        print("[copy_template] 경고: WBS 파일 ID를 확인할 수 없습니다.")
        sys.exit(1)


if __name__ == "__main__":
    main()
