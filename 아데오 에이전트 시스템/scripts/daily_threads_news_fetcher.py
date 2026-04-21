"""
daily_threads_news_fetcher.py
매일 09:00 실행 — Threads에서 AI 관련 최신 게시글을 수집하여
Google Drive의 AI 뉴스 다이제스트 시트(연구소 탭)를 업데이트한다.

Usage:
  python scripts/daily_threads_news_fetcher.py

인증:
  THREADS_ACCESS_TOKEN  Threads API 사용자 액세스 토큰 (필수)
  .status/report-config.yaml 의 service_account_path 참조 (Google Sheet용).

필요 환경변수:
  THREADS_ACCESS_TOKEN  Threads API 액세스 토큰 (필수)
  THREADS_USER_ID       Threads 사용자 ID (기본: "me")
"""

import os
import sys
import yaml
import requests
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

try:
    import gspread
except ImportError:
    print("[ERROR] gspread 패키지가 필요합니다: pip install gspread google-auth")
    sys.exit(1)

# ── 상수 ──────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(".status/report-config.yaml")
SHEET_ID    = "1hiZ-Bs-cqTDHAoJ66q9sO55VAjez_TU-7P_jw2KrZ34"  # 업무이력DB

THREADS_BASE = "https://graph.threads.net/v1.0"

AI_KEYWORDS = [
    "AI", "인공지능", "ChatGPT", "GPT", "LLM", "Claude", "Gemini",
    "머신러닝", "딥러닝", "생성형AI", "AGI", "Anthropic", "OpenAI",
    "Mistral", "Llama", "RAG", "프롬프트", "파인튜닝",
]

# 팔로우할 AI 관련 주요 Threads 계정 (검색 API 미지원 시 폴백)
AI_ACCOUNTS = [
    "samaltman",
    "yannlecun",
    "andrewyng",
    "karpathy",
    "emollick",
]

SHEET_HEADERS = [
    "번호", "계정", "게시글 내용", "작성일시", "링크", "수집키워드", "수집일"
]

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

KST = timezone(timedelta(hours=9))


# ── 인증 ──────────────────────────────────────────────────────────────────────
def load_config() -> dict:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}


def get_gc(config: dict):
    cred_path = config.get("service_account_path", "")
    if cred_path and Path(cred_path).exists():
        from google.oauth2.service_account import Credentials
        creds = Credentials.from_service_account_file(cred_path, scopes=SCOPES)
        return gspread.authorize(creds)
    return gspread.oauth()


# ── Threads API ───────────────────────────────────────────────────────────────
def threads_search(access_token: str, keyword: str, limit: int = 20) -> list[dict]:
    """키워드로 Threads 게시글 검색 (Threads Search API)."""
    url = f"{THREADS_BASE}/threads/search"
    params = {
        "q": keyword,
        "fields": "id,text,timestamp,permalink,username",
        "limit": limit,
        "access_token": access_token,
    }
    try:
        resp = requests.get(url, params=params, timeout=20)
        resp.raise_for_status()
        return resp.json().get("data", [])
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 400:
            # 검색 API 미지원 시 빈 목록 반환 (폴백으로 전환)
            return []
        print(f"[WARN] Threads Search 오류 ({keyword}): {e}")
        return []
    except Exception as e:
        print(f"[WARN] Threads Search 실패 ({keyword}): {e}")
        return []


def threads_user_media(access_token: str, username: str, limit: int = 10) -> list[dict]:
    """특정 계정의 최신 게시글 조회 (username → user-id 조회 후 미디어 목록)."""
    # 1) username → user-id
    lookup_url = f"{THREADS_BASE}/{username}"
    try:
        resp = requests.get(
            lookup_url,
            params={"fields": "id,username", "access_token": access_token},
            timeout=20,
        )
        resp.raise_for_status()
        user_id = resp.json().get("id")
    except Exception as e:
        print(f"[WARN] {username} 사용자 조회 실패: {e}")
        return []

    if not user_id:
        return []

    # 2) 해당 user의 스레드 조회
    media_url = f"{THREADS_BASE}/{user_id}/threads"
    try:
        resp = requests.get(
            media_url,
            params={
                "fields": "id,text,timestamp,permalink,username",
                "limit": limit,
                "access_token": access_token,
            },
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json().get("data", [])
    except Exception as e:
        print(f"[WARN] {username} 미디어 조회 실패: {e}")
        return []


def is_ai_related(text: str) -> str | None:
    """게시글 텍스트가 AI 관련이면 매칭 키워드 반환, 아니면 None."""
    text_lower = text.lower()
    for kw in AI_KEYWORDS:
        if kw.lower() in text_lower:
            return kw
    return None


def collect_news(access_token: str) -> list[dict]:
    """Threads에서 AI 관련 게시글 수집. 검색 API → 계정 팔로우 순서로 시도."""
    seen_ids: set[str] = set()
    posts: list[dict] = []

    yesterday = (datetime.now(KST) - timedelta(days=1)).isoformat()

    # ① 키워드 검색 (Search API)
    print("  [1/2] 키워드 검색 시도 중...")
    search_success = False
    for kw in AI_KEYWORDS[:5]:  # 주요 키워드만 검색 (API 호출 절약)
        items = threads_search(access_token, kw, limit=10)
        if items:
            search_success = True
        for item in items:
            pid = item.get("id", "")
            if pid in seen_ids:
                continue
            seen_ids.add(pid)
            text = item.get("text", "") or ""
            matched_kw = is_ai_related(text) or kw
            posts.append({
                "계정":     item.get("username", ""),
                "게시글 내용": text[:300],
                "작성일시":  item.get("timestamp", ""),
                "링크":     item.get("permalink", ""),
                "수집키워드": matched_kw,
            })

    # ② AI 계정 팔로우 (검색 API 미지원 또는 결과 부족 시 폴백)
    if not search_success or len(posts) < 10:
        print("  [2/2] AI 주요 계정 직접 조회 중...")
        for username in AI_ACCOUNTS:
            items = threads_user_media(access_token, username, limit=5)
            for item in items:
                pid = item.get("id", "")
                if pid in seen_ids:
                    continue
                seen_ids.add(pid)
                text = item.get("text", "") or ""
                matched_kw = is_ai_related(text)
                if matched_kw is None:
                    continue  # AI 관련 아니면 제외
                posts.append({
                    "계정":     item.get("username", username),
                    "게시글 내용": text[:300],
                    "작성일시":  item.get("timestamp", ""),
                    "링크":     item.get("permalink", ""),
                    "수집키워드": matched_kw,
                })
    else:
        print("  [2/2] 검색 API 결과 충분 — 계정 직접 조회 생략")

    # 작성일시 기준 최신 순 정렬
    posts.sort(key=lambda x: x.get("작성일시", ""), reverse=True)
    return posts


# ── Google Sheet 업데이트 ─────────────────────────────────────────────────────
def get_or_create_ws(sh: gspread.Spreadsheet, title: str, cols: int) -> gspread.Worksheet:
    try:
        return sh.worksheet(title)
    except gspread.WorksheetNotFound:
        return sh.add_worksheet(title=title, rows=5000, cols=cols)


def ensure_header(ws: gspread.Worksheet, headers: list[str]):
    if ws.row_values(1) != headers:
        ws.clear()
        ws.append_row(headers, value_input_option="USER_ENTERED")


def update_ai_news_sheet(sh: gspread.Spreadsheet, posts: list[dict]) -> int:
    ws = get_or_create_ws(sh, "AI 뉴스 (Threads)", cols=len(SHEET_HEADERS))
    ensure_header(ws, SHEET_HEADERS)

    existing_links = {row[3] for row in ws.get_all_values()[1:] if len(row) > 3 and row[3]}
    today = date.today().isoformat()

    existing_count = len(ws.get_all_values()) - 1  # 헤더 제외

    new_rows = []
    for i, p in enumerate(posts, start=1):
        if p["링크"] and p["링크"] in existing_links:
            continue
        new_rows.append([
            existing_count + len(new_rows) + 1,
            p["계정"],
            p["게시글 내용"],
            p["작성일시"],
            p["링크"],
            p["수집키워드"],
            today,
        ])

    if new_rows:
        ws.append_rows(new_rows, value_input_option="USER_ENTERED")
    return len(new_rows)


# ── 메인 ──────────────────────────────────────────────────────────────────────
def main():
    access_token = os.environ.get("THREADS_ACCESS_TOKEN", "")
    if not access_token:
        print("[ERROR] THREADS_ACCESS_TOKEN 환경변수 없음 — Threads 조회 불가")
        print("  발급 방법: https://developers.facebook.com/docs/threads/get-started")
        sys.exit(1)

    now = datetime.now(KST).strftime("%Y-%m-%d %H:%M")
    print(f"[{now}] AI 뉴스 수집 시작 (Threads)")

    posts = collect_news(access_token)
    print(f"  수집된 게시글: {len(posts)}건")

    if not posts:
        print("[WARN] 수집된 게시글 없음 — 시트 업데이트 생략")
        return

    config = load_config()
    gc = get_gc(config)
    sh = gc.open_by_key(SHEET_ID)

    added = update_ai_news_sheet(sh, posts)
    print(f"  신규 추가: {added}건")
    print(f"\n✓ AI 뉴스 업데이트 완료 [{now}]")
    print(f"  시트: https://docs.google.com/spreadsheets/d/{SHEET_ID}")


if __name__ == "__main__":
    main()
