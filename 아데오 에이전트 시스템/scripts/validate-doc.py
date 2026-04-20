#!/usr/bin/env python3
"""
아데오 에이전트 시스템 — 산출물 구조 검증 스크립트
사용법: python scripts/validate-doc.py <파일경로>
예시:  python scripts/validate-doc.py output/구축 파트/테스트프로젝트/PM/kickoff-테스트프로젝트.md
"""

import sys
import re
from pathlib import Path


# ──────────────────────────────────────────────
# 문서 코드별 검증 규칙
# ──────────────────────────────────────────────

RULES = {
    # PM-03 WBS / 착수보고서 패키지
    "kickoff": {
        "doc_code": "PM-01~03",
        "required_sections": [
            r"## ?(1|2|3)\.",                 # 섹션 1·2·3 존재
            r"PM.*착수",                       # PM 단계
            r"AY.*분석",                       # AY 단계
            r"DE.*설계",                       # DE 단계
            r"IM.*구현",                       # IM 단계
            r"TE.*테스트",                     # TE 단계
            r"OP.*오픈",                       # OP 단계
            r"PM-0[123]",                     # PM 산출물 코드
            r"\d{4}-\d{2}-\d{2}",             # 날짜 존재
        ],
        "min_lines": 40,
        "description": "WBS + 사업수행계획서 패키지 (PM-01~03)",
    },

    # DE-02 IA 설계서
    "ia-": {
        "doc_code": "DE-02",
        "required_sections": [
            r"FO.*(IA|설계|구조)",             # FO IA 섹션
            r"BO.*(IA|설계|구조)",             # BO IA 섹션
            r"FO-\d-\d{2}",                   # FO IA_ID 코드
            r"BO-\d-\d{2}",                   # BO IA_ID 코드
            r"(Page|Layer Popup|Popup)",       # Type 분류
            r"집계|합계",                      # 화면 수 집계표
            r"(URL|/[a-z])",                  # URL 설계
        ],
        "min_lines": 30,
        "description": "IA 설계서 (DE-02)",
    },

    # DE-03 화면설계서
    "화면설계서": {
        "doc_code": "DE-03",
        "required_sections": [
            r"(FO_|BO_)\d{3}",                # 화면ID
            r"(화면 ?헤더|화면ID)",            # 화면 헤더 블록
            r"(\+--|┌─|```)",                 # ASCII 레이아웃
            r"(기능 ?설명|기능설명)",          # 기능 설명 테이블
            r"(화면 ?조건|로그인|반응형)",     # 화면 조건
            r"(공통 ?컴포넌트|GNB|Footer)",   # 공통 컴포넌트 섹션
        ],
        "min_lines": 50,
        "description": "화면설계서 (DE-03)",
    },

    # AY-01 요구사항정의서
    "요구사항정의서": {
        "doc_code": "AY-01",
        "required_sections": [
            r"(현황|현황 ?분석)",              # 현황 분석
            r"(기능 ?요구사항|## ?\d+.*기능)",  # 기능 요구사항 섹션
            r"(비기능 ?요구사항|## ?\d+.*비기능)", # 비기능 요구사항 섹션
            r"(제약|보안|성능|운영)",           # 비기능 항목 존재
            r"(필수|선택|Must|Should|우선순위)", # 우선순위 표기
        ],
        "min_lines": 30,
        "description": "요구사항정의서 (AY-01)",
    },
}

# 파일명으로 규칙 자동 선택
def detect_rule(filepath: str) -> tuple[str, dict] | None:
    name = Path(filepath).name.lower()
    for key, rule in RULES.items():
        if key.lower() in name:
            return key, rule
    return None


def validate(filepath: str, content: str | None = None, doc_type: str | None = None) -> bool:
    """
    filepath : 로컬 파일 경로 (content가 None일 때 파일을 직접 읽음)
    content  : 검증할 텍스트 (Drive MCP로 읽은 내용을 직접 전달할 때 사용)
    doc_type : 문서 유형 키워드 강제 지정 (예: "요구사항정의서"). None이면 filepath에서 자동 감지
    """
    if content is None:
        path = Path(filepath)
        if not path.exists():
            print(f"[FAIL] 파일을 찾을 수 없습니다: {filepath}")
            return False
        content = path.read_text(encoding="utf-8")

    lines = content.splitlines()

    # 규칙 감지 — doc_type 강제 지정 우선
    if doc_type:
        # 부분 일치 허용
        matched = None
        for key in RULES:
            if key.lower() in doc_type.lower() or doc_type.lower() in key.lower():
                matched = (key, RULES[key])
                break
        result = matched
    else:
        result = detect_rule(filepath)

    if result is None:
        print(f"[SKIP] 알 수 없는 문서 유형입니다. 파일명에 문서 유형 키워드가 없습니다.")
        print(f"       지원 유형: {', '.join(RULES.keys())}")
        return True  # 알 수 없는 유형은 통과 처리

    rule_key, rule = result
    doc_code = rule["doc_code"]
    description = rule["description"]
    errors = []

    print(f"\n문서 유형: {description}")
    print(f"파일 경로: {filepath}")
    print(f"총 줄 수: {len(lines)}")
    print("─" * 50)

    # 최소 줄 수 검사
    if len(lines) < rule["min_lines"]:
        errors.append(f"내용 부족: 최소 {rule['min_lines']}줄 필요 (현재 {len(lines)}줄)")

    # 필수 패턴 검사
    for pattern in rule["required_sections"]:
        if not re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
            errors.append(f"[X] 필수 항목 누락: 패턴 `{pattern}` 없음")

    # 결과 출력
    if errors:
        print("[FAIL] 검증 실패")
        for err in errors:
            print(f"  {err}")
        return False
    else:
        print("[PASS] 검증 통과")
        print(f"  OK 필수 섹션 {len(rule['required_sections'])}개 모두 확인")
        print(f"  OK 최소 줄 수 ({rule['min_lines']}줄) 충족")
        return True


def main():
    import argparse as _argparse
    parser = _argparse.ArgumentParser(
        description="아데오 산출물 구조 검증 스크립트",
        epilog=(
            "사용법 1 (로컬 파일): python scripts/validate-doc.py path/to/file.md\n"
            "사용법 2 (stdin 파이프): echo '<내용>' | python scripts/validate-doc.py --stdin --doc-type 요구사항정의서\n"
            "사용법 3 (Drive MCP 내용): python scripts/validate-doc.py --content '<텍스트>' --doc-type kickoff"
        ),
    )
    parser.add_argument("filepath", nargs="?", default="", help="로컬 파일 경로 (선택)")
    parser.add_argument("--doc-type", default="", help="문서 유형 강제 지정 (예: 요구사항정의서, kickoff, ia-)")
    parser.add_argument("--content", default="", help="검증할 텍스트 직접 전달 (Drive MCP 내용 등)")
    parser.add_argument("--stdin", action="store_true", help="stdin에서 내용 읽기")
    args = parser.parse_args()

    content = None
    filepath = args.filepath or "<stdin>"

    if args.stdin:
        content = sys.stdin.read()
    elif args.content:
        content = args.content
    elif not args.filepath:
        parser.print_help()
        sys.exit(1)

    doc_type = args.doc_type or None
    success = validate(filepath, content=content, doc_type=doc_type)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
