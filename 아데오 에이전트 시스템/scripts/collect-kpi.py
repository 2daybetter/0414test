"""
collect-kpi.py
Google Drive 아데오 프로젝트 폴더를 스캔하여 KPI 지표를 수집하고 JSON으로 출력한다.
kpi-reporter 스킬의 Step 2에서 호출된다.

Usage:
  python -X utf8 scripts/collect-kpi.py
  python -X utf8 scripts/collect-kpi.py --date 2026-04-20
"""

import argparse
import io
import json
import sys
import yaml
from datetime import date, datetime
from pathlib import Path

try:
    import gspread
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
except ImportError:
    print("[ERROR] 필수 패키지: pip install gspread google-auth google-api-python-client")
    sys.exit(1)

# ── 상수 ──────────────────────────────────────────────────────────────────────
ROOT_FOLDER_ID = "1XHWdKpQmsoyiScj-NicRrHuYzDZsyBDM"
CONFIG_PATH = Path(".status/report-config.yaml")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# kpi-rules.md 기준: 단계별 지연 임계일
DELAY_THRESHOLDS = {
    "PM": 7, "AY": 14, "DE": 21, "IM": 45, "TE": 14, "OP": 7,
}

# 구축 파트 단계 코드
BUILD_STEP_CODES = {"PM", "AY", "DE", "IM", "TE", "OP"}


# ── 인증 ──────────────────────────────────────────────────────────────────────
def load_config() -> dict:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}


def get_gc(config: dict):
    """gen_weekly_report.py와 동일한 인증 흐름."""
    cred_path = config.get("service_account_path", "")
    if cred_path and Path(cred_path).exists():
        from google.oauth2.service_account import Credentials
        creds = Credentials.from_service_account_file(cred_path, scopes=SCOPES)
        return gspread.authorize(creds)
    return gspread.oauth()


def get_drive_service(gc):
    """gspread Client의 인증 객체로 Drive v3 서비스 빌드."""
    return build("drive", "v3", credentials=gc.auth)


# ── Drive 탐색 ────────────────────────────────────────────────────────────────
def list_subfolders(service, parent_id: str) -> list:
    """parent_id 바로 아래 폴더 목록 반환."""
    results = []
    page_token = None
    while True:
        resp = service.files().list(
            q=(
                f"'{parent_id}' in parents"
                " and mimeType='application/vnd.google-apps.folder'"
                " and trashed=false"
            ),
            fields="nextPageToken, files(id, name)",
            pageToken=page_token,
        ).execute()
        results.extend(resp.get("files", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return results


def find_status_file_id(service, project_folder_id: str) -> str:
    """{project}/.status/.status 파일 ID 반환. 없으면 빈 문자열."""
    # .status 폴더
    res = service.files().list(
        q=(
            f"'{project_folder_id}' in parents"
            " and name='.status'"
            " and mimeType='application/vnd.google-apps.folder'"
            " and trashed=false"
        ),
        fields="files(id)",
    ).execute()
    folders = res.get("files", [])
    if not folders:
        return ""
    status_folder_id = folders[0]["id"]

    # .status 파일
    res2 = service.files().list(
        q=(
            f"'{status_folder_id}' in parents"
            " and name='.status'"
            " and trashed=false"
        ),
        fields="files(id, mimeType)",
    ).execute()
    files = res2.get("files", [])
    return files[0]["id"] if files else ""


def read_file_text(service, file_id: str) -> str:
    """Drive 파일 텍스트 내용 읽기. Google Docs면 export, 일반 파일이면 get_media."""
    meta = service.files().get(fileId=file_id, fields="mimeType").execute()
    mime = meta.get("mimeType", "")

    if "google-apps" in mime:
        content = service.files().export(fileId=file_id, mimeType="text/plain").execute()
        return content.decode("utf-8") if isinstance(content, bytes) else str(content)

    buf = io.BytesIO()
    request = service.files().get_media(fileId=file_id)
    downloader = MediaIoBaseDownload(buf, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    return buf.getvalue().decode("utf-8", errors="replace")


# ── .status 파싱 ──────────────────────────────────────────────────────────────
def parse_status(content: str) -> dict:
    """
    YAML 또는 key: value 형식 .status 파일 파싱.

    기본 형식:
      project: 프로젝트명
      current_step: Step PM
      locked_by: PM팀
      locked_at: 2026-04-01T09:00:00
      outputs:
        wbs: https://...
        kickoff: https://...
    """
    try:
        data = yaml.safe_load(content)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    # fallback: 줄 단위 key: value
    result: dict = {}
    for line in content.splitlines():
        if ": " in line:
            k, _, v = line.partition(": ")
            result[k.strip()] = v.strip()
    return result


def count_output_urls(status: dict) -> int:
    outputs = status.get("outputs", {})
    if not isinstance(outputs, dict):
        return 0
    return sum(1 for v in outputs.values() if v and str(v).startswith("http"))


def is_delayed(status: dict, today: date) -> bool:
    """locked_at 기준 단계별 임계일 초과 여부."""
    raw = str(status.get("locked_at", "")).strip()
    if not raw:
        return False
    try:
        locked_at = datetime.fromisoformat(raw).date()
    except ValueError:
        return False

    step = str(status.get("current_step", "")).upper()
    for code, threshold in DELAY_THRESHOLDS.items():
        if code in step:
            return (today - locked_at).days > threshold
    return (today - locked_at).days > 14  # 기본값


def step_code(current_step: str) -> str:
    """'Step PM' → 'PM', 'Step 3 (AY)' → 'AY' 등 코드 추출."""
    upper = current_step.upper()
    for code in BUILD_STEP_CODES:
        if code in upper:
            return code
    return current_step or "미확인"


def is_build_project(status: dict) -> bool:
    step = str(status.get("current_step", "")).upper()
    return any(code in step for code in BUILD_STEP_CODES)


# ── KPI 수집 ──────────────────────────────────────────────────────────────────
def collect(service, today: date) -> dict:
    root_folders = list_subfolders(service, ROOT_FOLDER_ID)

    projects = []
    opportunities = []
    skipped = []

    for folder in root_folders:
        name = folder["name"]
        fid = folder["id"]

        # 비서실 폴더는 프로젝트/기회가 아님
        if name in ("비서실", ".status"):
            continue

        status_file_id = find_status_file_id(service, fid)
        if not status_file_id:
            skipped.append(name)
            continue

        try:
            content = read_file_text(service, status_file_id)
            status = parse_status(content)
        except Exception as e:
            print(f"[WARN] {name} .status 읽기 실패: {e}", file=sys.stderr)
            skipped.append(name)
            continue

        outputs = status.get("outputs", {}) or {}
        output_count = count_output_urls(status)
        current_step = str(status.get("current_step", ""))

        if is_build_project(status):
            projects.append({
                "name": name,
                "current_step": current_step,
                "step_code": step_code(current_step),
                "locked_by": str(status.get("locked_by", "")),
                "locked_at": str(status.get("locked_at", "")),
                "output_count": output_count,
                "delayed": is_delayed(status, today),
            })
        else:
            # 제안 파트 기회
            opportunities.append({
                "name": name,
                "current_step": current_step,
                "locked_by": str(status.get("locked_by", "")),
                "output_count": output_count,
                "has_proposal": bool(outputs.get("proposal", "")),
                "has_policy_fund": bool(outputs.get("policy-fund", "")),
            })

    # ── 구축 파트 KPI 집계 ──────────────────────────────────────────────────
    active_projects = len(projects)
    total_outputs = sum(p["output_count"] for p in projects)
    delayed_list = [p["name"] for p in projects if p["delayed"]]

    step_dist: dict = {}
    for p in projects:
        sc = p["step_code"]
        step_dist[sc] = step_dist.get(sc, 0) + 1

    # 주간 산출물: locked_at이 오늘 기준 7일 이내인 프로젝트의 output_count 합
    weekly_cutoff = today.toordinal() - 7
    weekly_outputs = sum(
        p["output_count"]
        for p in projects
        if p["locked_at"] and _days_since(p["locked_at"], today) <= 7
    )

    # ── 제안 파트 KPI 집계 ──────────────────────────────────────────────────
    active_opps = len(opportunities)
    proposal_count = sum(1 for o in opportunities if o["has_proposal"])
    policy_fund_count = sum(1 for o in opportunities if o["has_policy_fund"])
    conversion_rate = round(proposal_count / active_opps * 100, 1) if active_opps else 0

    return {
        "collected_at": str(today),
        "구축파트": {
            "active_projects": active_projects,
            "total_outputs": total_outputs,
            "weekly_outputs": weekly_outputs,
            "step_distribution": step_dist,
            "delayed_projects": delayed_list,
            "projects": projects,
        },
        "제안파트": {
            "active_opportunities": active_opps,
            "proposal_count": proposal_count,
            "policy_fund_count": policy_fund_count,
            "conversion_rate_pct": conversion_rate,
            "opportunities": opportunities,
        },
        "skipped_folders": skipped,
    }


def _days_since(locked_at_str: str, today: date) -> int:
    try:
        return (today - datetime.fromisoformat(locked_at_str).date()).days
    except Exception:
        return 9999


# ── 메인 ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="KPI 수집기 — Google Drive 아데오 프로젝트 폴더 스캔")
    parser.add_argument("--date", default=str(date.today()), help="기준 날짜 YYYY-MM-DD (기본: 오늘)")
    args = parser.parse_args()

    try:
        today = datetime.strptime(args.date, "%Y-%m-%d").date()
    except ValueError:
        today = date.today()

    config = load_config()
    gc = get_gc(config)
    service = get_drive_service(gc)

    result = collect(service, today)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    # stderr 요약 (kpi-reporter가 파싱하지 않는 부분)
    bp = result["구축파트"]
    pp = result["제안파트"]
    print(
        f"\n[collect-kpi] 완료 — "
        f"구축 {bp['active_projects']}건 / 제안 {pp['active_opportunities']}건 / "
        f"지연 {len(bp['delayed_projects'])}건 / 제안 전환율 {pp['conversion_rate_pct']}%",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
