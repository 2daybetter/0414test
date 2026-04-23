"""
gen_weekly_report_wbs.py — WBS 기반 주간보고 자동 생성기

wbs_template의 'WBS 일정' 탭에서 금주/차주 작업을 읽어
'주간보고_template' 탭의 팀별 섹션에 자동으로 채운다.

Usage:
  python gen_weekly_report_wbs.py --sheet-id SHEET_ID [--date YYYY-MM-DD]

  --sheet-id : WBS Google Sheet ID (필수)
  --date     : 기준 날짜 (기본값: 오늘, 해당 주의 월요일로 자동 정렬)

팀별 분류:
  사업관리  ← PM, 전원, 단일일정(마일스톤), 공휴일
  기획      ← 기획팀, 기획/TFT
  디자인    ← 디자인팀
  퍼블리싱  ← 대분류에 '퍼블리싱' 포함
  개발      ← 개발팀, QA, QA/개발, 보안담당, 보안/개발, PM/개발
"""
import argparse
import sys
import yaml
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    import gspread
    from google.oauth2.service_account import Credentials
except ImportError:
    print("[ERROR] 필요 패키지: pip install gspread google-auth")
    sys.exit(1)

# ── 상수 ──────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(".status/report-config.yaml")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
]

# 담당팀 → 보고서 팀명 매핑
TEAM_MAP = {
    "사업관리": ["PM", "전원"],
    "기획":     ["기획팀", "기획/TFT", "기획"],
    "디자인":   ["디자인팀", "디자인"],
    "개발":     ["개발팀", "QA", "QA/개발", "보안담당", "보안/개발", "PM/개발"],
}
# 퍼블리싱은 대분류 기준이라 별도 처리

# 주간보고_template 탭에서 찾을 팀 헤더 텍스트
REPORT_TEAMS = ["사업관리", "기획", "디자인", "퍼블리싱", "개발"]


# ── 인증 ──────────────────────────────────────────────────────────────────────
def get_creds():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}
        cred_path = config.get("service_account_path", "")
        if cred_path and Path(cred_path).exists():
            return Credentials.from_service_account_file(cred_path, scopes=SCOPES)
    return gspread.oauth(scopes=SCOPES).auth


# ── 날짜 유틸 ─────────────────────────────────────────────────────────────────
def get_week_range(ref_date: date):
    """ref_date가 속한 주의 월요일~일요일을 반환."""
    monday = ref_date - timedelta(days=ref_date.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


def parse_mmdd(mmdd: str, year: int) -> date | None:
    """'MM-DD' 또는 'M-D' 형식 → date. 실패 시 None."""
    mmdd = str(mmdd).strip()
    if not mmdd:
        return None
    try:
        return datetime.strptime(f"{year}-{mmdd}", "%Y-%m-%d").date()
    except ValueError:
        return None


# ── 설정 탭 읽기 ──────────────────────────────────────────────────────────────
def read_settings_and_holidays(sh) -> tuple[dict, list[tuple[date, str]]]:
    """
    설정 탭을 읽어 (프로젝트 설정 dict, 공휴일 리스트) 반환.

    설정 탭 구조:
      - 상단: 항목 | 값 입력 | 설명  (프로젝트 설정)
      - 하단: 공휴일명 | 날짜(YYYY-MM-DD)  (공휴일 테이블)

    공휴일 날짜는 YYYY-MM-DD 형식으로 저장됨.
    """
    ws = sh.worksheet("설정")
    rows = ws.get_all_values()

    settings = {}
    holidays = []
    in_holiday_section = False

    for row in rows:
        if not row or not row[0].strip():
            continue
        key = row[0].strip()
        val = row[1].strip() if len(row) > 1 else ""

        # 공휴일 테이블 헤더 감지
        if key == "공휴일명":
            in_holiday_section = True
            continue

        if in_holiday_section:
            # 날짜: YYYY-MM-DD 형식
            if val:
                try:
                    d = datetime.strptime(val, "%Y-%m-%d").date()
                    holidays.append((d, key))
                except ValueError:
                    pass
        else:
            settings[key] = val

    return settings, holidays


# ── WBS 일정 탭 읽기 ──────────────────────────────────────────────────────────
def read_wbs_tasks(sh, year: int) -> list[dict]:
    """
    'WBS 일정' 탭에서 모든 작업 행을 읽어 dict 리스트로 반환.
    컬럼: WBS | 대분류 | 작업명 | 담당자 | 담당팀 | 시작일 | 종료일 | 기간 |
          계획% | 실제% | 편차 | 상태 | 산출물/비고 | (이후 Gantt 열)
    """
    ws = sh.worksheet("WBS 일정")
    rows = ws.get_all_values()
    if not rows:
        return []

    # 헤더 행 찾기 (WBS 컬럼이 있는 첫 행)
    header_idx = 0
    for i, row in enumerate(rows):
        if row and row[0].strip().upper() in ("WBS", "WBS#", "#"):
            header_idx = i
            break

    headers = [h.strip() for h in rows[header_idx]]

    def col(name):
        aliases = {
            "WBS": ["WBS", "WBS#", "#"],
            "대분류": ["대분류"],
            "작업명": ["작업명", "작업"],
            "담당자": ["담당자"],
            "담당팀": ["담당팀", "팀"],
            "시작일": ["시작일", "시작"],
            "종료일": ["종료일", "종료"],
            "기간": ["기간", "기간(일)"],
            "계획%": ["계획%", "계획 진행률", "계획"],
            "실제%": ["실제%", "실제 진행률", "실제"],
            "상태": ["상태"],
        }
        for candidate in aliases.get(name, [name]):
            if candidate in headers:
                return headers.index(candidate)
        return -1

    idx = {k: col(k) for k in ["WBS", "대분류", "작업명", "담당자", "담당팀",
                                 "시작일", "종료일", "기간", "계획%", "실제%", "상태"]}

    tasks = []
    for row in rows[header_idx + 1:]:
        if not row or not any(row):
            continue
        wbs_num = row[idx["WBS"]].strip() if idx["WBS"] >= 0 else ""
        task_name = row[idx["작업명"]].strip() if idx["작업명"] >= 0 else ""
        if not task_name:
            continue

        division = row[idx["대분류"]].strip() if idx["대분류"] >= 0 else ""
        team = row[idx["담당팀"]].strip() if idx["담당팀"] >= 0 else ""
        start_str = row[idx["시작일"]].strip() if idx["시작일"] >= 0 else ""
        end_str = row[idx["종료일"]].strip() if idx["종료일"] >= 0 else ""
        duration_str = row[idx["기간"]].strip() if idx["기간"] >= 0 else ""
        actual_pct = row[idx["실제%"]].strip() if idx["실제%"] >= 0 else ""
        status = row[idx["상태"]].strip() if idx["상태"] >= 0 else ""

        start_dt = parse_mmdd(start_str, year)
        end_dt = parse_mmdd(end_str, year)
        try:
            duration = int(duration_str)
        except (ValueError, TypeError):
            duration = (end_dt - start_dt).days + 1 if start_dt and end_dt else 0

        if not start_dt or not end_dt:
            continue

        tasks.append({
            "wbs": wbs_num,
            "division": division,
            "name": task_name,
            "team": team,
            "start": start_dt,
            "end": end_dt,
            "duration": duration,
            "actual_pct": actual_pct,
            "status": status,
        })
    return tasks


# ── 팀 분류 ───────────────────────────────────────────────────────────────────
def classify_team(task: dict) -> str:
    """작업을 보고서 팀명으로 분류."""
    team_val = task["team"]
    division_val = task["division"]

    # 퍼블리싱: 대분류 기준
    if "퍼블리싱" in division_val:
        return "퍼블리싱"

    for report_team, raw_teams in TEAM_MAP.items():
        if team_val in raw_teams:
            return report_team

    # 기본: 사업관리
    return "사업관리"


# ── 포맷 ──────────────────────────────────────────────────────────────────────
def fmt_task(task: dict) -> str:
    """일반 작업 포맷: • 작업명 (~YYYY. M. D) / 실제% / 상태"""
    end = task["end"]
    end_str = f"{end.year}. {end.month}. {end.day}"
    pct = task["actual_pct"] if task["actual_pct"] else "0%"
    if not pct.endswith("%"):
        pct += "%"
    status = task["status"] if task["status"] else "진행중"
    return f"• {task['name']} (~{end_str}) / {pct} / {status}"


def fmt_milestone(task: dict) -> str:
    """단일일정(마일스톤) 포맷: • 작업명 (날짜)"""
    d = task["start"]
    return f"• {task['name']} ({d.strftime('%Y-%m-%d')})"


def fmt_holiday(d: date, name: str) -> str:
    return f"• {name} ({d.strftime('%Y-%m-%d')})"


# ── 주간 작업 필터 ────────────────────────────────────────────────────────────
def filter_tasks(tasks: list[dict], week_start: date, week_end: date) -> list[dict]:
    """해당 주와 겹치는 작업만 반환."""
    return [t for t in tasks if t["start"] <= week_end and t["end"] >= week_start]


def filter_holidays(holidays: list[tuple[date, str]], week_start: date, week_end: date):
    return [(d, name) for d, name in holidays if week_start <= d <= week_end]


# ── 팀별 라인 생성 ────────────────────────────────────────────────────────────
def build_team_lines(tasks: list[dict], holidays: list[tuple[date, str]]) -> dict[str, list[str]]:
    """팀별 포맷된 라인 리스트 반환."""
    lines: dict[str, list[str]] = {t: [] for t in REPORT_TEAMS}

    # 공휴일 → 사업관리 맨 앞
    for d, name in sorted(holidays):
        lines["사업관리"].insert(0, fmt_holiday(d, name))

    for task in tasks:
        team = classify_team(task)
        if task["duration"] == 1:
            # 마일스톤 → 사업관리
            lines["사업관리"].append(fmt_milestone(task))
        else:
            lines[team].append(fmt_task(task))

    return lines


def _col_to_letter(col_1indexed: int) -> str:
    """1-indexed 열 번호 → Excel 컬럼 문자 (A, B, ..., Z, AA, ...)"""
    result = ""
    c = col_1indexed
    while c > 0:
        result = chr((c - 1) % 26 + ord('A')) + result
        c = (c - 1) // 26
    return result


# ── 주간보고_template 탭 업데이트 (행 기반) ───────────────────────────────────
def update_report_tab_v2(sh, this_week_lines: dict, next_week_lines: dict) -> None:
    """
    주간보고_template 탭에서 팀명 셀을 찾아 바로 오른쪽 셀에 내용을 기록.
    팀명이 같은 셀이 여러 개일 경우: 행 번호 순으로 정렬 → 1번째=금주, 2번째=차주
    """
    ws = sh.worksheet("주간보고_template")
    all_values = ws.get_all_values()

    batch = []

    for team in REPORT_TEAMS:
        occurrences = []
        for r_idx, row in enumerate(all_values):
            for c_idx, cell in enumerate(row):
                if cell.strip() == team:
                    occurrences.append((r_idx, c_idx))

        occurrences.sort(key=lambda x: (x[0], x[1]))

        if not occurrences:
            print(f"[WARN] '{team}' 셀을 찾을 수 없음")
            continue

        def make_entry(r, c, lines):
            content = "\n".join(lines) if lines else ""
            target_col = _col_to_letter(c + 2)  # 팀명 셀 오른쪽
            return {"range": f"{target_col}{r + 1}", "values": [[content]]}

        if len(occurrences) >= 1:
            r, c = occurrences[0]
            batch.append(make_entry(r, c, this_week_lines[team]))

        if len(occurrences) >= 2:
            r, c = occurrences[1]
            batch.append(make_entry(r, c, next_week_lines[team]))

    if batch:
        ws.batch_update(batch)
    print(f"[gen_weekly_report_wbs] 주간보고_template 업데이트 완료 ({len(batch)}개 셀)")


# ── 메인 ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="WBS 기반 주간보고 자동 생성")
    parser.add_argument("--sheet-id", required=True, help="WBS Google Sheet ID")
    parser.add_argument("--date", default=None,
                        help="기준 날짜 YYYY-MM-DD (기본값: 오늘)")
    args = parser.parse_args()

    ref_date = date.today()
    if args.date:
        try:
            ref_date = datetime.strptime(args.date, "%Y-%m-%d").date()
        except ValueError:
            print(f"[ERROR] 날짜 형식 오류: {args.date} (YYYY-MM-DD 형식으로 입력)")
            sys.exit(1)

    this_mon, this_sun = get_week_range(ref_date)
    next_mon = this_mon + timedelta(weeks=1)
    next_sun = this_sun + timedelta(weeks=1)

    print(f"[gen_weekly_report_wbs] 금주: {this_mon} ~ {this_sun}")
    print(f"[gen_weekly_report_wbs] 차주: {next_mon} ~ {next_sun}")

    creds = get_creds()
    gc = gspread.authorize(creds)
    sh = gc.open_by_key(args.sheet_id)

    # 설정 탭 + 공휴일
    settings, holidays = read_settings_and_holidays(sh)
    project_name = settings.get("프로젝트명", "프로젝트")
    start_str = settings.get("프로젝트 시작일", "")
    try:
        project_year = datetime.strptime(start_str, "%Y-%m-%d").year
    except (ValueError, TypeError):
        project_year = ref_date.year
    print(f"[gen_weekly_report_wbs] 프로젝트: {project_name} (기준연도: {project_year})")

    # WBS 작업
    tasks = read_wbs_tasks(sh, project_year)
    print(f"[gen_weekly_report_wbs] WBS 작업 {len(tasks)}건 로드 완료")

    # 필터링
    this_tasks = filter_tasks(tasks, this_mon, this_sun)
    next_tasks = filter_tasks(tasks, next_mon, next_sun)
    this_holidays = filter_holidays(holidays, this_mon, this_sun)
    next_holidays = filter_holidays(holidays, next_mon, next_sun)

    print(f"[gen_weekly_report_wbs] 금주 작업: {len(this_tasks)}건, 공휴일: {len(this_holidays)}건")
    print(f"[gen_weekly_report_wbs] 차주 작업: {len(next_tasks)}건, 공휴일: {len(next_holidays)}건")

    # 팀별 라인 생성
    this_lines = build_team_lines(this_tasks, this_holidays)
    next_lines = build_team_lines(next_tasks, next_holidays)

    # 주간보고_template 탭 업데이트
    update_report_tab_v2(sh, this_lines, next_lines)

    print(f"[gen_weekly_report_wbs] 완료 — 프로젝트: {project_name}")
    print(f"SHEET_URL=https://docs.google.com/spreadsheets/d/{args.sheet_id}/edit")


if __name__ == "__main__":
    main()
