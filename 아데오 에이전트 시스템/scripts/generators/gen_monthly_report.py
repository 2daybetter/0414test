"""
gen_monthly_report.py
업무이력DB Google Sheet에서 직전 달 데이터를 집계하여 월간보고 Sheet에 새 탭을 추가한다.

Usage:
  # DB 읽기
  python gen_monthly_report.py --mode read --month 2026-04

  # 탭 쓰기
  python gen_monthly_report.py --mode write --month 2026-04 --data '{"completed": [...]}'

  # 읽기 + 쓰기 통합 실행
  python gen_monthly_report.py --mode all --month 2026-04
"""

import argparse
import calendar
import json
import sys
import yaml
from datetime import date, datetime
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

# KRDS 색상
COLOR_HEADER  = {"red": 0.161, "green": 0.161, "blue": 0.165}  # #29292A
COLOR_SECTION = {"red": 0.145, "green": 0.431, "blue": 0.957}  # #256EF4
COLOR_WHITE   = {"red": 1.0,   "green": 1.0,   "blue": 1.0}
COLOR_OK      = {"red": 0.106, "green": 0.498, "blue": 0.243}  # #1B7F3E
COLOR_WARN    = {"red": 0.996, "green": 0.953, "blue": 0.780}  # #FEF3C7
COLOR_WARN_F  = {"red": 0.769, "green": 0.314, "blue": 0.0}    # #C45000
COLOR_ERR     = {"red": 0.996, "green": 0.886, "blue": 0.886}  # #FEE2E2
COLOR_ERR_F   = {"red": 0.769, "green": 0.039, "blue": 0.039}  # #C40A0A


# ── 설정 로드 ─────────────────────────────────────────────────────────────────
def load_config() -> dict:
    if not CONFIG_PATH.exists():
        print(f"[ERROR] {CONFIG_PATH} 파일이 없습니다. monthly-report 스킬의 Step 0을 먼저 실행하세요.")
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
    return gspread.oauth()


# ── 날짜 계산 ─────────────────────────────────────────────────────────────────
def get_month_range(month_str: str) -> tuple[date, date]:
    """YYYY-MM 형식에서 해당 월의 첫날·마지막날 반환."""
    y, m = map(int, month_str.split("-"))
    first = date(y, m, 1)
    last = date(y, m, calendar.monthrange(y, m)[1])
    return first, last


def parse_date(s: str) -> date | None:
    try:
        return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except Exception:
        return None


def prev_month(month_str: str) -> str:
    y, m = map(int, month_str.split("-"))
    if m == 1:
        return f"{y-1}-12"
    return f"{y}-{m-1:02d}"


# ── DB 읽기 ───────────────────────────────────────────────────────────────────
def read_db(gc, db_sheet_id: str, month_str: str) -> dict:
    """업무이력DB에서 집계 월 데이터를 읽어 분류한다."""
    sh = gc.open_by_key(db_sheet_id)
    first, last = get_month_range(month_str)
    today = date.today()

    result = {
        "month": month_str,
        "completed": [],
        "in_progress": [],
        "new_start": [],
        "delayed": [],
        "comms": [],
        "projects": [],   # 구축파트 프로젝트 (SKB-YYYY-NNN 형식)
        "proposals": [],  # 제안파트 제안 건
        "kpi": {},
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
            note = str(row.get("비고", ""))

            # 완료 업무
            if status == "완료" and end_date and first <= end_date <= last:
                result["completed"].append(row)

            # 진행 중
            if status == "진행중" and start_date and start_date <= last:
                result["in_progress"].append(row)

            # 신규 착수
            if start_date and first <= start_date <= last:
                result["new_start"].append(row)

            # 지연
            if end_date and end_date < last and status not in ("완료", "취소", "보류"):
                result["delayed"].append(row)

            # 구축파트 프로젝트
            name = str(row.get("업무명", ""))
            if part == "구축파트" and ("SKB-" in name or "프로젝트" in name):
                days_left = (end_date - today).days if end_date else None
                prj_status = "정상"
                if days_left is not None:
                    if days_left < 7:
                        prj_status = "지연"
                    elif days_left < 14:
                        prj_status = "지연위험"
                result["projects"].append({**row, "납기여유": days_left, "프로젝트상태": prj_status})

            # 제안파트 활동
            if part == "제안파트" and "제안" in name:
                won = "수주" in note
                amount = ""
                for token in note.split():
                    if "수주금액:" in token:
                        amount = token.replace("수주금액:", "")
                result["proposals"].append({
                    "업무명": name, "담당자": row.get("담당자", ""),
                    "상태": status, "수주여부": "수주" if won else "-", "수주금액": amount,
                })

            # 커뮤니케이션 이력
            comm_raw = str(row.get("커뮤니케이션이력", "")).strip()
            for line in comm_raw.split("\n"):
                line = line.strip()
                if not line:
                    continue
                comm_date = parse_date(line[:10])
                if comm_date and first <= comm_date <= last:
                    result["comms"].append({
                        "파트": part, "업무명": name,
                        "날짜": line[:10], "내용": line[10:].strip(),
                    })

    # KPI 산출
    total = len(result["completed"]) + len(result["in_progress"])
    complete_rate = round(len(result["completed"]) / total * 100) if total else 0
    delay_rate = round(len(result["delayed"]) / total * 100) if total else 0
    result["kpi"] = {
        "완료업무수": len(result["completed"]),
        "진행중업무수": len(result["in_progress"]),
        "신규착수수": len(result["new_start"]),
        "지연건수": len(result["delayed"]),
        "완료율": complete_rate,
        "지연율": delay_rate,
        "커뮤니케이션건수": len(result["comms"]),
    }

    return result


# ── 탭 쓰기 ───────────────────────────────────────────────────────────────────
def write_tab(gc, monthly_sheet_id: str, month_str: str, data: dict):
    """월간보고 Sheet에 새 탭을 추가하고 KRDS 스타일을 적용한다."""
    sh = gc.open_by_key(monthly_sheet_id)
    tab_name = f"{month_str} 월간"

    existing = [ws.title for ws in sh.worksheets()]
    if tab_name in existing:
        tab_name = f"{tab_name}(수정)"

    ws = sh.add_worksheet(title=tab_name, rows=300, cols=12)
    ws_id = ws.id
    requests = []

    kpi = data.get("kpi", {})
    rows_data = []

    # ── 헤더 ──
    rows_data.append([f"아데오 그룹 비서실 월간보고 — {month_str}"])
    rows_data.append(["보고 월", month_str, "작성일", str(date.today())])
    rows_data.append(["보고 대상", "비서실 / 그룹 대표", "", ""])
    rows_data.append([])

    # ── 1. 핵심 요약 ──
    rows_data.append(["1. 이달의 핵심 요약 (Executive Summary)"])
    rows_data.append(["구분", "내용"])
    rows_data.append(["완료 업무", f"총 {kpi.get('완료업무수', 0)}건 완료, 완료율 {kpi.get('완료율', 0)}%"])
    rows_data.append(["지연 현황", f"지연 {kpi.get('지연건수', 0)}건 발생 (지연율 {kpi.get('지연율', 0)}%)"])
    rows_data.append(["신규 착수", f"신규 착수 {kpi.get('신규착수수', 0)}건"])
    rows_data.append([])

    # ── 2. KPI 달성 현황 ──
    rows_data.append(["2. KPI 달성 현황"])
    rows_data.append(["KPI", "목표", "실적", "달성률", "상태"])

    def kpi_status(val: float, target: float, reverse: bool = False) -> str:
        ratio = val / target * 100 if target else 0
        if reverse:
            if val <= target:
                return "✅"
            elif val <= target * 2:
                return "⚠️"
            return "❌"
        if ratio >= 100:
            return "✅"
        elif ratio >= 80:
            return "⚠️"
        return "❌"

    complete_rate = kpi.get("완료율", 0)
    delay_rate = kpi.get("지연율", 0)
    rows_data.append(["업무 완료율", "70% 이상", f"{complete_rate}%",
                       f"{round(complete_rate/70*100)}%", kpi_status(complete_rate, 70)])
    rows_data.append(["지연 발생률", "10% 이하", f"{delay_rate}%",
                       "-", kpi_status(delay_rate, 10, reverse=True)])
    rows_data.append(["커뮤니케이션 건수", "-", f"{kpi.get('커뮤니케이션건수', 0)}건", "-",
                       "✅" if kpi.get("커뮤니케이션건수", 0) > 0 else "⚠️"])
    rows_data.append([])

    # ── 3. 파트별 업무 실적 ──
    rows_data.append(["3. 파트별 업무 실적"])
    rows_data.append(["파트", "완료", "진행중", "신규착수", "주요 완료 업무"])
    for part in PARTS:
        done = [r for r in data["completed"] if r.get("파트") == part]
        prog = [r for r in data["in_progress"] if r.get("파트") == part]
        new  = [r for r in data["new_start"] if r.get("파트") == part]
        top_done = ", ".join([r["업무명"] for r in done[:3]])
        rows_data.append([part, len(done), len(prog), len(new), top_done or "없음"])
    rows_data.append([])

    # ── 4. 커뮤니케이션 이력 요약 ──
    rows_data.append(["4. 커뮤니케이션 이력 요약"])
    rows_data.append(["날짜", "파트", "업무명", "내용"])
    for c in sorted(data["comms"], key=lambda x: x["날짜"])[:30]:
        rows_data.append([c["날짜"], c["파트"], c["업무명"], c["내용"]])
    if not data["comms"]:
        rows_data.append(["", "", "", "이달 커뮤니케이션 이력 없음"])
    rows_data.append([])

    # ── 5. 구축파트 프로젝트 현황 ──
    rows_data.append(["5. 구축파트 프로젝트 현황"])
    rows_data.append(["프로젝트명", "담당자", "진행률", "납기", "납기여유(일)", "상태"])
    for p in data["projects"]:
        rows_data.append([
            p.get("업무명", ""), p.get("담당자", ""),
            f"{p.get('진행률', 0)}%", str(p.get("완료예정일", "")),
            p.get("납기여유", "-"), p.get("프로젝트상태", "-"),
        ])
    if not data["projects"]:
        rows_data.append(["", "", "", "", "", "진행 중인 구축 프로젝트 없음"])
    rows_data.append([])

    # ── 6. 제안파트 활동 현황 ──
    rows_data.append(["6. 제안파트 활동 현황"])
    rows_data.append(["업무명", "담당자", "상태", "수주여부", "수주금액"])
    for p in data["proposals"]:
        rows_data.append([p["업무명"], p["담당자"], p["상태"], p["수주여부"], p["수주금액"]])
    if not data["proposals"]:
        rows_data.append(["", "", "", "", "이달 제안 활동 없음"])
    rows_data.append([])

    # ── 7. 이슈 및 리스크 ──
    rows_data.append(["7. 이슈 및 리스크 (지연 항목)"])
    rows_data.append(["파트", "업무명", "담당자", "완료예정일", "진행률", "비고"])
    for row in data["delayed"]:
        rows_data.append([
            row.get("파트", ""), row.get("업무명", ""), row.get("담당자", ""),
            str(row.get("완료예정일", "")), f"{row.get('진행률', 0)}%", row.get("비고", ""),
        ])
    if not data["delayed"]:
        rows_data.append(["", "이달 지연 항목 없음", "", "", "", ""])
    rows_data.append([])

    # ── 8. 다음 달 계획 ──
    rows_data.append(["8. 다음 달 계획"])
    rows_data.append(["파트", "업무명", "담당자", "시작예정일", "완료예정일"])
    # 상태=예정인 항목
    next_items = [r for r in data.get("in_progress", []) if r.get("상태") == "예정"]
    for row in next_items[:10]:
        rows_data.append([
            row.get("파트", ""), row.get("업무명", ""), row.get("담당자", ""),
            str(row.get("시작일", "")), str(row.get("완료예정일", "")),
        ])
    if not next_items:
        rows_data.append(["", "다음 달 계획 업무 없음", "", "", ""])
    rows_data.append([])

    # ── 9. 건의/요청 사항 ──
    rows_data.append(["9. 건의 / 요청 사항"])
    rows_data.append(["내용"])
    rows_data.append(["이번 달 특별 건의사항 없음"])

    # 데이터 일괄 업데이트
    ws.update(values=rows_data, range_name="A1")

    # ── KRDS 스타일 적용 ──
    section_titles = [
        "1. 이달의 핵심 요약 (Executive Summary)", "2. KPI 달성 현황",
        "3. 파트별 업무 실적", "4. 커뮤니케이션 이력 요약",
        "5. 구축파트 프로젝트 현황", "6. 제안파트 활동 현황",
        "7. 이슈 및 리스크 (지연 항목)", "8. 다음 달 계획", "9. 건의 / 요청 사항",
    ]

    def cell_range(row: int, col_start: int = 1, col_end: int = 8) -> dict:
        return {
            "sheetId": ws_id,
            "startRowIndex": row - 1, "endRowIndex": row,
            "startColumnIndex": col_start - 1, "endColumnIndex": col_end,
        }

    def bg_request(row: int, color: dict, col_end: int = 8) -> dict:
        return {"repeatCell": {
            "range": cell_range(row, 1, col_end),
            "cell": {"userEnteredFormat": {"backgroundColor": color}},
            "fields": "userEnteredFormat.backgroundColor",
        }}

    def font_request(row: int, color: dict, bold: bool = False, col_end: int = 8) -> dict:
        return {"repeatCell": {
            "range": cell_range(row, 1, col_end),
            "cell": {"userEnteredFormat": {"textFormat": {"foregroundColor": color, "bold": bold}}},
            "fields": "userEnteredFormat.textFormat",
        }}

    requests.append(bg_request(1, COLOR_HEADER))
    requests.append(font_request(1, COLOR_WHITE, bold=True))

    for i, row in enumerate(rows_data, start=1):
        if row and row[0] in section_titles:
            requests.append(bg_request(i, COLOR_SECTION))
            requests.append(font_request(i, COLOR_WHITE, bold=True))
        elif row and row[0] in ["구분", "KPI", "파트", "날짜", "업무명", "내용", "프로젝트명"]:
            requests.append(bg_request(i, COLOR_HEADER))
            requests.append(font_request(i, COLOR_WHITE, bold=True))

    if requests:
        sh.batch_update({"requests": requests})

    return tab_name, f"https://docs.google.com/spreadsheets/d/{monthly_sheet_id}"


# ── 메인 ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="월간보고 생성기")
    parser.add_argument("--mode", choices=["read", "write", "all"], default="all")
    parser.add_argument("--month", default=None,
                        help="집계 대상 월 YYYY-MM (기본: 직전 달)")
    parser.add_argument("--data", default=None, help="write 모드 시 JSON 데이터")
    args = parser.parse_args()

    config = load_config()
    gc = get_gc(config)

    if args.month:
        month_str = args.month
    else:
        today = date.today()
        m = today.month - 1 or 12
        y = today.year if today.month > 1 else today.year - 1
        month_str = f"{y}-{m:02d}"

    if args.mode in ("read", "all"):
        data = read_db(gc, config["db_sheet_id"], month_str)
        print(json.dumps(data, ensure_ascii=False, indent=2, default=str))

    if args.mode == "write":
        data = json.loads(args.data) if args.data else {}
        tab_name, url = write_tab(gc, config["monthly_sheet_id"], month_str, data)
        print(f"✅ 탭 추가 완료: {tab_name}\n📎 시트 URL: {url}")

    if args.mode == "all":
        data = read_db(gc, config["db_sheet_id"], month_str)
        tab_name, url = write_tab(gc, config["monthly_sheet_id"], month_str, data)
        kpi = data["kpi"]
        print(f"\n✅ 월간보고 탭 '{tab_name}' 추가 완료")
        print(f"📎 시트 URL: {url}")
        print(f"📊 집계: 완료 {kpi['완료업무수']}건 / 진행중 {kpi['진행중업무수']}건 / "
              f"지연 {kpi['지연건수']}건 / 완료율 {kpi['완료율']}%")


if __name__ == "__main__":
    main()
