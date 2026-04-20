"""
gen_weekly_report.py
업무이력DB Google Sheet에서 데이터를 읽어 주간보고 Sheet에 새 탭을 추가한다.

Usage:
  # DB 읽기
  python gen_weekly_report.py --mode read --date 2026-04-20

  # 탭 쓰기
  python gen_weekly_report.py --mode write --date 2026-04-20 --data '{"rows": [...]}'

  # 읽기 + 쓰기 통합 실행
  python gen_weekly_report.py --mode all --date 2026-04-20
"""

import argparse
import json
import sys
import yaml
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    import gspread
except ImportError:
    print("[ERROR] gspread 패키지가 필요합니다: pip install gspread google-auth")
    sys.exit(1)

# ── 상수 ──────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(".status/report-config.yaml")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
PARTS = ["비서실", "제안파트", "구축파트", "운영파트", "연구소"]
DB_COLUMNS = [
    "번호", "파트", "업무명", "담당자", "시작일", "완료예정일",
    "진행률", "상태", "주요내용", "커뮤니케이션이력", "비고",
]

# KRDS 색상
COLOR_HEADER = {"red": 0.161, "green": 0.161, "blue": 0.165}   # #29292A
COLOR_SECTION = {"red": 0.145, "green": 0.431, "blue": 0.957}  # #256EF4
COLOR_WHITE   = {"red": 1.0,   "green": 1.0,   "blue": 1.0}
COLOR_DELAY   = {"red": 0.996, "green": 0.953, "blue": 0.780}  # #FEF3C7
COLOR_DELAY_FONT = {"red": 0.769, "green": 0.314, "blue": 0.0} # #C45000


# ── 설정 로드 ─────────────────────────────────────────────────────────────────
def load_config() -> dict:
    if not CONFIG_PATH.exists():
        print(f"[ERROR] {CONFIG_PATH} 파일이 없습니다. weekly-report 스킬의 Step 0을 먼저 실행하세요.")
        sys.exit(1)
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_gc(config: dict):
    """OAuth 우선 인증. 서비스 계정 경로가 있으면 service account 사용."""
    cred_path = config.get("service_account_path", "")
    if cred_path and Path(cred_path).exists():
        from google.oauth2.service_account import Credentials
        creds = Credentials.from_service_account_file(cred_path, scopes=SCOPES)
        return gspread.authorize(creds)
    # 기존 Google 계정 OAuth (최초 실행 시 브라우저 인증, 이후 토큰 캐시)
    return gspread.oauth()


# ── 날짜 계산 ─────────────────────────────────────────────────────────────────
def get_week_range(base_date: date) -> tuple[date, date, date, date]:
    """base_date(월요일) 기준 금주·전주 범위 반환."""
    this_mon = base_date - timedelta(days=base_date.weekday())
    this_fri = this_mon + timedelta(days=4)
    prev_mon = this_mon - timedelta(days=7)
    return this_mon, this_fri, prev_mon


def parse_date(s: str) -> date | None:
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except Exception:
        return None


# ── DB 읽기 ───────────────────────────────────────────────────────────────────
def read_db(gc, db_sheet_id: str, base_date: date) -> dict:
    """업무이력DB에서 파트별 데이터를 읽어 분류한다."""
    sh = gc.open_by_key(db_sheet_id)
    this_mon, this_fri, prev_mon = get_week_range(base_date)
    today = base_date

    result = {
        "completed": [],   # 금주 완료
        "in_progress": [], # 금주 진행
        "next_week": [],   # 차주 예정
        "delayed": [],     # 지연/이슈
        "comms": [],       # 커뮤니케이션 이력 (금주)
        "meta": {
            "base_date": str(base_date),
            "this_mon": str(this_mon),
            "this_fri": str(this_fri),
        }
    }

    for part in PARTS:
        try:
            ws = sh.worksheet(part)
        except gspread.WorksheetNotFound:
            continue

        rows = ws.get_all_records(head=1)
        for row in rows:
            if not row.get("업무명"):
                continue

            row["파트"] = part
            end_date = parse_date(str(row.get("완료예정일", "")))
            start_date = parse_date(str(row.get("시작일", "")))
            status = str(row.get("상태", "")).strip()

            # 분류
            if status == "완료" and end_date and end_date >= prev_mon:
                result["completed"].append(row)
            elif status == "진행중":
                result["in_progress"].append(row)
                if end_date and end_date < today:
                    result["delayed"].append(row)
            elif status == "예정" and start_date and start_date <= this_fri + timedelta(days=7):
                result["next_week"].append(row)

            # 커뮤니케이션 이력 파싱
            comm_raw = str(row.get("커뮤니케이션이력", "")).strip()
            for line in comm_raw.split("\n"):
                line = line.strip()
                if not line:
                    continue
                comm_date = parse_date(line[:10])
                if comm_date and this_mon <= comm_date <= this_fri:
                    result["comms"].append({
                        "파트": part,
                        "업무명": row["업무명"],
                        "날짜": line[:10],
                        "내용": line[10:].strip(),
                    })

    # 진행중 → 완료 임박 순 정렬
    result["in_progress"].sort(key=lambda r: int(r.get("진행률", 0)), reverse=True)
    return result


# ── 탭 쓰기 ───────────────────────────────────────────────────────────────────
def write_tab(gc, weekly_sheet_id: str, base_date: date, data: dict):
    """주간보고 Sheet에 새 탭을 추가하고 KRDS 스타일을 적용한다."""
    sh = gc.open_by_key(weekly_sheet_id)
    tab_name = f"{base_date.strftime('%Y-%m-%d')} 주간"

    # 동일 탭 이름 처리
    existing = [ws.title for ws in sh.worksheets()]
    if tab_name in existing:
        tab_name = f"{tab_name}(수정)"

    ws = sh.add_worksheet(title=tab_name, rows=200, cols=12)
    requests = []
    ws_id = ws.id
    rows_data = []

    # ── 헤더 정보 ──
    this_mon, this_fri, _, _ = get_week_range(base_date)
    rows_data.append([f"아데오 그룹 비서실 주간업무 보고"])
    rows_data.append(["보고 기간", f"{this_mon} (월) ~ {this_fri} (금)"])
    rows_data.append(["작성일", str(base_date), "보고 주차", f"{base_date.isocalendar()[1]}주차"])
    rows_data.append([])

    # ── 1. 파트별 금주 진행현황 ──
    rows_data.append(["1. 파트별 금주 진행현황"])
    rows_data.append(["파트", "업무명", "담당자", "진행률", "완료예정일", "상태", "비고"])
    for row in data["in_progress"]:
        rows_data.append([
            row.get("파트", ""), row.get("업무명", ""), row.get("담당자", ""),
            f"{row.get('진행률', 0)}%", str(row.get("완료예정일", "")),
            row.get("상태", ""), row.get("비고", ""),
        ])
    if not data["in_progress"]:
        rows_data.append(["", "진행중 업무 없음", "", "", "", "", ""])
    rows_data.append([])

    # ── 2. 금주 완료 업무 ──
    rows_data.append(["2. 금주 완료 업무"])
    rows_data.append(["파트", "업무명", "담당자", "완료일", "비고"])
    for row in data["completed"]:
        rows_data.append([
            row.get("파트", ""), row.get("업무명", ""), row.get("담당자", ""),
            str(row.get("완료예정일", "")), row.get("비고", ""),
        ])
    if not data["completed"]:
        rows_data.append(["", "완료 업무 없음", "", "", ""])
    rows_data.append([])

    # ── 3. 차주 예정 업무 ──
    rows_data.append(["3. 차주 예정 업무"])
    rows_data.append(["파트", "업무명", "담당자", "시작예정일", "완료예정일", "비고"])
    for row in data["next_week"]:
        rows_data.append([
            row.get("파트", ""), row.get("업무명", ""), row.get("담당자", ""),
            str(row.get("시작일", "")), str(row.get("완료예정일", "")), row.get("비고", ""),
        ])
    if not data["next_week"]:
        rows_data.append(["", "차주 예정 업무 없음", "", "", "", ""])
    rows_data.append([])

    # ── 4. 커뮤니케이션 이력 ──
    rows_data.append(["4. 이번 주 커뮤니케이션 이력"])
    rows_data.append(["날짜", "파트", "업무명", "내용"])
    for c in data["comms"]:
        rows_data.append([c["날짜"], c["파트"], c["업무명"], c["내용"]])
    if not data["comms"]:
        rows_data.append(["", "", "", "이번 주 커뮤니케이션 이력 없음"])
    rows_data.append([])

    # ── 5. 지연/이슈 항목 ──
    rows_data.append(["5. 지연 / 이슈 항목"])
    rows_data.append(["파트", "업무명", "담당자", "완료예정일", "진행률", "비고"])
    for row in data["delayed"]:
        rows_data.append([
            row.get("파트", ""), row.get("업무명", ""), row.get("담당자", ""),
            str(row.get("완료예정일", "")), f"{row.get('진행률', 0)}%", row.get("비고", ""),
        ])
    if not data["delayed"]:
        rows_data.append(["", "현재 지연 항목 없음", "", "", "", ""])

    # 데이터 일괄 업데이트
    ws.update(values=rows_data, range_name="A1")

    # ── KRDS 스타일 적용 ──
    section_rows = []  # 섹션 구분 행 번호 (1-indexed)
    col_rows = {}      # 컬럼 헤더 행 번호

    section_titles = [
        "1. 파트별 금주 진행현황", "2. 금주 완료 업무",
        "3. 차주 예정 업무", "4. 이번 주 커뮤니케이션 이력", "5. 지연 / 이슈 항목",
    ]
    for i, row in enumerate(rows_data, start=1):
        if row and row[0] in section_titles:
            section_rows.append(i)
        if row and row[0] in ["파트", "날짜", "보고 기간"]:
            col_rows[i] = True

    def cell_range(row: int, col_start: int = 1, col_end: int = 8) -> dict:
        return {
            "sheetId": ws_id,
            "startRowIndex": row - 1,
            "endRowIndex": row,
            "startColumnIndex": col_start - 1,
            "endColumnIndex": col_end,
        }

    def bg_request(row: int, color: dict, col_end: int = 8) -> dict:
        return {
            "repeatCell": {
                "range": cell_range(row, 1, col_end),
                "cell": {"userEnteredFormat": {"backgroundColor": color}},
                "fields": "userEnteredFormat.backgroundColor",
            }
        }

    def font_request(row: int, color: dict, bold: bool = False, col_end: int = 8) -> dict:
        return {
            "repeatCell": {
                "range": cell_range(row, 1, col_end),
                "cell": {"userEnteredFormat": {
                    "textFormat": {"foregroundColor": color, "bold": bold}
                }},
                "fields": "userEnteredFormat.textFormat",
            }
        }

    # 제목 행 (1행)
    requests.append(bg_request(1, COLOR_HEADER))
    requests.append(font_request(1, COLOR_WHITE, bold=True))

    # 섹션 구분 행
    for r in section_rows:
        requests.append(bg_request(r, COLOR_SECTION))
        requests.append(font_request(r, COLOR_WHITE, bold=True))

    # 컬럼 헤더 행
    for r in col_rows:
        requests.append(bg_request(r, COLOR_HEADER))
        requests.append(font_request(r, COLOR_WHITE, bold=True))

    if requests:
        sh.batch_update({"requests": requests})

    return tab_name, f"https://docs.google.com/spreadsheets/d/{weekly_sheet_id}"


# ── 메인 ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="주간보고 생성기")
    parser.add_argument("--mode", choices=["read", "write", "all"], default="all")
    parser.add_argument("--date", default=str(date.today()), help="기준 날짜 YYYY-MM-DD")
    parser.add_argument("--data", default=None, help="write 모드 시 JSON 데이터")
    args = parser.parse_args()

    config = load_config()
    gc = get_gc(config)
    base_date = parse_date(args.date) or date.today()

    if args.mode in ("read", "all"):
        data = read_db(gc, config["db_sheet_id"], base_date)
        print(json.dumps(data, ensure_ascii=False, indent=2, default=str))

    if args.mode == "write":
        data = json.loads(args.data) if args.data else {}
        tab_name, url = write_tab(gc, config["weekly_sheet_id"], base_date, data)
        print(f"✅ 탭 추가 완료: {tab_name}")
        print(f"📎 시트 URL: {url}")

    if args.mode == "all":
        data = read_db(gc, config["db_sheet_id"], base_date)
        tab_name, url = write_tab(gc, config["weekly_sheet_id"], base_date, data)
        n_prog = len(data["in_progress"])
        n_done = len(data["completed"])
        n_next = len(data["next_week"])
        n_delay = len(data["delayed"])
        print(f"\n✅ 주간보고 탭 '{tab_name}' 추가 완료")
        print(f"📎 시트 URL: {url}")
        print(f"📋 집계: 금주 진행 {n_prog}건 / 완료 {n_done}건 / 차주 예정 {n_next}건 / 이슈 {n_delay}건")


if __name__ == "__main__":
    main()
