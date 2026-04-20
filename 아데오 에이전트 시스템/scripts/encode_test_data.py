#!/usr/bin/env python3
"""임시 스크립트: 테스트 데이터 base64 인코딩"""
import base64
import json

docs = {}

docs['proposal_strategy'] = """# 제안 전략 문서 — 더케이예다함 홈페이지 구축사업
## Step B 산출물 | 작성: 전략팀 L3 | 작성일: 2026-04-02

## 1. RFP 적합성 분석

| 요구사항 | 적합성 |
|---------|--------|
| 모바일 반응형 개발 | 완전 충족 |
| 온라인 예약 시스템 | 충족 (신규 기능) |
| CMS 연동 | 충족 |
| 웹접근성 WCAG 2.1 AA | 충족 |

종합 판단: 제안 진행 가능

## 2. 제안 전략

### 전략 1: 모바일 퍼스트 + 예약 UX 혁신
- 기존 사이트의 모바일 취약점을 공략
- 예약 플로우를 3단계로 단순화: 날짜 → 홀 → 패키지 선택

### 전략 2: 프리미엄 감성 디자인
- 고객사 브랜드 컬러(금색 #C9A96E) 기반 감성적 디자인 시스템
- 비주얼 스토리텔링: 결혼식 당일의 스토리를 홈 화면에 구현

### 전략 3: 운영 자립형 CMS
- Sanity.io Headless CMS 도입으로 담당자 직접 운영
- 패키지 가격, 공지, 갤러리 모두 비개발자가 관리 가능

## 3. 핵심 제안 메시지
"더케이예다함의 프리미엄 브랜드를 디지털에서도 완성합니다."

## 4. 산출물 정보
- 문서 코드: Step B 제안전략서
- 버전: v1.0
- 작성일: 2026-04-02
- 상태: 완료 — Step C 제안서 작성 위임 준비
"""

docs['kickoff_wbs'] = """# 사업수행계획서 (WBS) — 더케이예다함 홈페이지 구축사업
## PM-03 | 작성: PM L3 | 작성일: 2026-04-05 | v1.0

## 프로젝트 개요
- 프로젝트명: 더케이예다함 홈페이지 구축사업
- 고객사: (주)더케이예다함
- 사업기간: 2026-01-13 ~ 2026-04-30 (15주)
- 예산: 84,000,000원

## WBS 단계별 일정

| 단계 | 코드 | 기간 | 담당 |
|------|------|------|------|
| 착수 | PM | 1주 (W1) | PM |
| 분석 | AY | 2주 (W2~W3) | 웹기획팀 |
| 설계 | DE | 4주 (W4~W7) | 웹기획팀+디자인팀 |
| 구현 | IM | 6주 (W8~W13) | 개발팀 |
| 테스트 | TE | 1주 (W14) | PM+웹기획팀 |
| 오픈/운영 | OP | 1주 (W15) | PM |

## 주요 마일스톤

| 마일스톤 | 목표일 |
|---------|--------|
| 킥오프 미팅 | 2026-01-13 |
| 설계 완료 검수 | 2026-02-17 |
| 개발 완료 | 2026-04-14 |
| 최종 검수 및 오픈 | 2026-04-30 |

## 리스크 관리

| 리스크 | 대응 방안 |
|--------|---------|
| 예약 시스템 복잡도 초과 | 기능 스코프 조정 옵션 사전 협의 |
| 디자인 시안 수정 장기화 | 시안 피드백 라운드 최대 3회 제한 |
"""

docs['requirements'] = """# 요구사항정의서 — 더케이예다함 홈페이지 구축사업
## AY-01 | 작성: 웹기획팀 L3 | 작성일: 2026-01-20 | v1.0

## 1. 현황 분석

### 현행 사이트 진단
| 항목 | 현황 | 개선 필요 |
|------|------|---------|
| 모바일 대응 | 미흡 (비반응형) | 필수 |
| 예약 시스템 | 전화/이메일만 | 온라인 예약 구축 |
| CMS | 직접 코드 수정 | CMS 도입 필요 |
| 로딩 속도 | 6~8초 | 3초 이내 개선 |

## 2. 기능 요구사항

| 기능구분 | 요구사항 | 우선순위 |
|---------|---------|---------|
| 공통 | 반응형 레이아웃 (Breakpoint: 320/768/1280px) | 필수 |
| 메인 | 비주얼 슬라이더 + 주요 메뉴 바로가기 | 필수 |
| 웨딩홀 소개 | 홀별 상세 페이지 (사진, 수용인원, 시설) | 필수 |
| 패키지 안내 | 시즌별 패키지 목록 + 가격 안내 | 필수 |
| 예약 시스템 | 온라인 예약 (날짜-홀-패키지 순) + 예약 확인/취소 | 필수 |
| 갤러리 | 포토 + 영상 아카이브 | 필수 |
| 공지사항 | 목록/상세 + 관리자 등록 | 필수 |
| 오시는 길 | 카카오맵 연동 + 교통 안내 | 필수 |
| 인스타그램 | 피드 자동 연동 (최신 9개) | 선택 |
| 상담 신청 | 플래너 상담 신청 폼 | 선택 |

## 3. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 성능 | LCP 2.5초 이내, FCP 1.5초 이내 |
| 접근성 | WCAG 2.1 AA 준수 |
| 보안 | HTTPS, XSS/CSRF/SQL Injection 방어 |
| 운영 | CMS 통한 비기술 담당자 자체 운영 |
| 브라우저 지원 | Chrome, Safari, Firefox 최신 2버전 |
"""

docs['status_file'] = """project: 더케이예다함
current_step: Step 9 (DE-1 IA 설계)
locked_by: 웹기획팀
locked_at: 2026-04-20T09:00:00
last_output: ia
outputs:
  rfp-context: https://docs.google.com/document/d/17BzO_fQAXG6wEI_NRiZ-zrEGCQ4vWFlwX_IXqWWfHBA/edit
  opportunity-analysis: https://docs.google.com/document/d/1b3ALhFd2dhpS46TmhEgrJV08ZOBYQl4CEztlKl7j7-o/edit
  proposal-strategy: (없음)
  proposal: (없음)
  policy-fund: (없음)
  policy-fund-proposal: (없음)
  kickoff: (없음)
  wbs: (없음)
  requirements: (없음)
  ia: https://docs.google.com/spreadsheets/d/1UTyIVcUOmvFqvZeDFaSYf-9J3dJCg8JjasUGww3Fyg4/edit
  wireframe: (없음)
  design-system: (없음)
  tech-spec: (없음)
  test-scenario: (없음)
"""

for key, content in docs.items():
    encoded = base64.b64encode(content.encode('utf-8')).decode('ascii')
    print(f"=== {key} ===")
    print(encoded)
    print()
