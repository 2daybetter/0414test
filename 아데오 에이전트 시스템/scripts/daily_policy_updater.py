"""
daily_policy_updater.py
매일 09:00 실행 — 나라장터 입찰공고 + 정책자금 공고를 조회하여
수주정보 스프레드시트 탭을 업데이트한다.

Usage:
  python scripts/daily_policy_updater.py

인증:
  .status/report-config.yaml 의 service_account_path 참조.
  파일 없으면 gspread.oauth() 폴백 (브라우저 인증).

필요 환경변수 (선택):
  G2B_API_KEY        공공데이터포털 나라장터 입찰공고 API 인증키
  KSTARTUP_API_KEY   K-Startup 공고 API 인증키 (없으면 정책자금 조회 생략)
"""

import os
import sys
import yaml
import requests
from datetime import date, datetime
from pathlib import Path

try:
    import gspread
except ImportError:
    print("[ERROR] gspread 패키지가 필요합니다: pip install gspread google-auth")
    sys.exit(1)

# ── 상수 ──────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(".status/report-config.yaml")
SHEET_ID = "1hiZ-Bs-cqTDHAoJ66q9sO55VAjez_TU-7P_jw2KrZ34"

G2B_API_URL = (
    "https://apis.data.go.kr/1230000/BidPublicInfoService04"
    "/getBidPblancListInfoServc01"
)
KSTARTUP_API_URL = (
    "https://www.k-startup.go.kr/openapi/service/rest"
    "/OpenAPIService/getAnnouncementList"
)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

G2B_HEADERS   = ["공고번호", "공고명", "발주처", "공고일", "입찰마감일", "투찰방법", "추정가격", "링크", "수집일"]
FUND_HEADERS  = ["사업명", "지원기관", "지원내용", "신청기간", "지원금액", "링크", "수집일"]


# ── 인증 ──────────────────────────────────────────────────────────────────────
def load_config() -> dict:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}


def get_gc(config: dict):
    """인증 우선순위: 환경변수 JSON → 서비스 계정 파일 → OAuth 폴백."""
    import json as _json
    env_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    if env_json:
        return gspread.service_account_from_dict(_json.loads(env_json))
    cred_path = config.get("service_account_path", "")
    if cred_path and Path(cred_path).exists():
        from google.oauth2.service_account import Credentials
        creds = Credentials.from_service_account_file(cred_path, scopes=SCOPES)
        return gspread.authorize(creds)
    return gspread.oauth()


# ── 나라장터 입찰공고 조회 ─────────────────────────────────────────────────────
def fetch_g2b_bids(api_key: str, keyword: str = "홈페이지") -> list[dict]:
    params = {
        "serviceKey": api_key,
        "numOfRows": 100,
        "pageNo": 1,
        "inqryDiv": 1,
        "bidNtceNm": keyword,
        "type": "json",
    }
    try:
        resp = requests.get(G2B_API_URL, params=params, timeout=30)
        resp.raise_for_status()
        body = resp.json().get("response", {}).get("body", {})
        items = body.get("items", []) or []
    except Exception as e:
        print(f"[ERROR] 나라장터 조회 실패: {e}")
        return []

    results = []
    for item in items:
        bid_no = item.get("bidNtceNo", "")
        results.append({
            "공고번호":   bid_no,
            "공고명":     item.get("bidNtceNm", ""),
            "발주처":     item.get("ntceInsttNm", ""),
            "공고일":     (item.get("bidNtceDt", "") or "")[:10],
            "입찰마감일": (item.get("bidClseDt", "") or "")[:10],
            "투찰방법":   item.get("bidMethdNm", ""),
            "추정가격":   item.get("presmptPrce", ""),
            "링크": (
                f"https://www.g2b.go.kr:8101/ep/invitation/publish/"
                f"bidInfoDtl.do?bidno={bid_no}"
            ),
        })
    return results


# ── 정책자금 공고 조회 ────────────────────────────────────────────────────────
def fetch_policy_funds(api_key: str) -> list[dict]:
    if not api_key:
        print("[WARN] KSTARTUP_API_KEY 없음 — 정책자금 조회 생략")
        return []

    params = {
        "serviceKey": api_key,
        "numOfRows": 100,
        "pageNo": 1,
        "type": "json",
    }
    try:
        resp = requests.get(KSTARTUP_API_URL, params=params, timeout=30)
        resp.raise_for_status()
        items = (
            resp.json().get("response", {}).get("body", {}).get("items", []) or []
        )
    except Exception as e:
        print(f"[ERROR] 정책자금 조회 실패: {e}")
        return []

    results = []
    for item in items:
        results.append({
            "사업명":   item.get("pbanNm", ""),
            "지원기관": item.get("supInstNm", ""),
            "지원내용": (item.get("pbanCn", "") or "")[:100],
            "신청기간": f"{item.get('rcptSdt', '')} ~ {item.get('rcptEdt', '')}",
            "지원금액": item.get("supAmt", ""),
            "링크":     item.get("detailUrl", ""),
        })
    return results


# ── 시트 공통 유틸 ────────────────────────────────────────────────────────────
def get_or_create_ws(sh: gspread.Spreadsheet, title: str, cols: int) -> gspread.Worksheet:
    try:
        return sh.worksheet(title)
    except gspread.WorksheetNotFound:
        return sh.add_worksheet(title=title, rows=5000, cols=cols)


def ensure_header(ws: gspread.Worksheet, headers: list[str]):
    if ws.row_values(1) != headers:
        ws.clear()
        ws.append_row(headers, value_input_option="USER_ENTERED")


# ── 수정정보 목록 탭 업데이트 ─────────────────────────────────────────────────
def update_g2b_sheet(sh: gspread.Spreadsheet, bids: list[dict]) -> int:
    ws = get_or_create_ws(sh, "수정정보 목록", cols=len(G2B_HEADERS))
    ensure_header(ws, G2B_HEADERS)

    existing_nos = {row[0] for row in ws.get_all_values()[1:] if row and row[0]}
    today = date.today().isoformat()

    new_rows = [
        [b["공고번호"], b["공고명"], b["발주처"], b["공고일"],
         b["입찰마감일"], b["투찰방법"], b["추정가격"], b["링크"], today]
        for b in bids if b["공고번호"] not in existing_nos
    ]
    if new_rows:
        ws.append_rows(new_rows, value_input_option="USER_ENTERED")
    return len(new_rows)


# ── 정책자금 목록 탭 업데이트 ─────────────────────────────────────────────────
def update_fund_sheet(sh: gspread.Spreadsheet, funds: list[dict]) -> int:
    ws = get_or_create_ws(sh, "정책자금 목록", cols=len(FUND_HEADERS))
    ensure_header(ws, FUND_HEADERS)

    existing_names = {row[0] for row in ws.get_all_values()[1:] if row and row[0]}
    today = date.today().isoformat()

    new_rows = [
        [f["사업명"], f["지원기관"], f["지원내용"],
         f["신청기간"], f["지원금액"], f["링크"], today]
        for f in funds if f["사업명"] not in existing_names
    ]
    if new_rows:
        ws.append_rows(new_rows, value_input_option="USER_ENTERED")
    return len(new_rows)


# ── 메인 ──────────────────────────────────────────────────────────────────────
def main():
    g2b_api_key      = os.environ.get("G2B_API_KEY", "")
    kstartup_api_key = os.environ.get("KSTARTUP_API_KEY", "")

    if not g2b_api_key:
        print("[ERROR] G2B_API_KEY 환경변수 없음 — 나라장터 조회 불가")
        sys.exit(1)

    config = load_config()
    gc = get_gc(config)
    sh = gc.open_by_key(SHEET_ID)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 수정정보 목록 (나라장터 "홈페이지" 키워드)
    print(f"[{now}] 나라장터 입찰공고 조회 중...")
    bids = fetch_g2b_bids(g2b_api_key, keyword="홈페이지")
    g2b_added = update_g2b_sheet(sh, bids)
    print(f"  수정정보 목록: 조회 {len(bids)}건 / 신규 추가 {g2b_added}건")

    # 정책자금 목록 (K-Startup)
    print(f"[{now}] 정책자금 공고 조회 중...")
    funds = fetch_policy_funds(kstartup_api_key)
    fund_added = update_fund_sheet(sh, funds)
    print(f"  정책자금 목록: 조회 {len(funds)}건 / 신규 추가 {fund_added}건")

    print(f"\n✓ 일일 업데이트 완료 [{now}]")
    print(f"  수주정보 시트: https://docs.google.com/spreadsheets/d/{SHEET_ID}")


if __name__ == "__main__":
    main()
