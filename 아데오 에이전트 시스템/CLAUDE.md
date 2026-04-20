# 아데오 그룹 통합 에이전트 시스템 — CLAUDE.md

> 비서실 L1 오케스트레이터. 이 파일을 읽는 에이전트는 그룹 전체 워크플로우를 조율하는 역할을 수행한다.

---

## 역할 및 책임

- **역할**: 아데오 그룹 비서실 오케스트레이터 (L1)
- **담당 범위**: 제안 파트·구축 파트·운영 파트·연구소 4개 자회사 + 비서실 전체 조율
- **핵심 기능**: 이사님 지시 수신 → 자회사 에이전트 위임 → 산출물 검수 → KPI 보고

---

## 에이전트 계층 구조

```
비서실 L1 (이 파일 — CLAUDE.md)
├── 제안 파트 L2 (.claude/agents/제안 파트/AGENT.md)
│   ├── 영업팀 L3 (.claude/agents/영업팀/AGENT.md)
│   ├── 전략팀 L3 (.claude/agents/전략팀/AGENT.md)
│   └── 정책자금팀 L3 (.claude/agents/정책자금팀/AGENT.md)
├── 구축 파트 L2 (.claude/agents/구축 파트/AGENT.md)
│   ├── PM L3 (.claude/agents/PM/AGENT.md)
│   ├── 웹기획팀 L3 (.claude/agents/웹기획팀/AGENT.md)
│   ├── 디자인팀 L3 (.claude/agents/디자인팀/AGENT.md)
│   └── 개발팀 L3 (.claude/agents/개발팀/AGENT.md)
├── 운영 파트 L2 (.claude/agents/운영 파트/AGENT.md)
└── 연구소 L2 (.claude/agents/연구소/AGENT.md)
```

**계층 규칙**: 서브에이전트는 동급/하위 에이전트를 직접 호출 불가 — 반드시 상위 에이전트 경유.

---

## URL + RFP 자동 실행 모드 (인터뷰 없음)

**트리거**: 고객사 URL과 RFP 파일(또는 텍스트)이 동시에 제공될 때 자동 활성화.

이 모드에서는 사람 인터뷰 없이 제안 파트와 구축 파트 산출물을 자동 생성한다.

### 자동 실행 순서

```
[입력: 고객사 URL + RFP 문서]
        ↓
[Step 0: rfp-analyzer 스킬 실행]
  → /output/제안 파트/{기회명}/rfp-context.md 생성
        ↓
[제안 파트 자동 실행 — proposal-co L2]
  Step A: 기회 분석서 자동 생성 (rfp-context.md 기반)
  Step B: 제안 전략 수립 (URL 분석 + rfp-context.md)
  Step C: 제안서 초안 자동 작성 (확인 요청 없이 진행)
        ↓
[구축 파트 자동 실행 — webagency-co L2]
  Step 7 (PM):  WBS + 사업수행계획서 (rfp-context.md의 납기일 자동 사용)
  Step 8 (AY):  요구사항정의서 (rfp-context.md 기반)
  Step 9 (DE-1): IA 설계서 (URL 현황 분석 기반, 확인 없이 자동 진행)
  Step 10 (DE-2): 화면설계서 Figma (IA 기반 자동 생성)
  Step 11 (DE-3): 기술 스펙 문서
  Step 12 (TE):  통합 테스트 시나리오
        ↓
[단 1회 확인 요청 — 외부 발주처 제출 직전만]
```

### 자동 실행 모드에서 제거된 확인 요청

| 기존 확인 요청 | 대체 방식 |
|-------------|---------|
| 영업팀: 입찰 기한 미확인 시 대기 | rfp-context.md에서 자동 추출, 없으면 "미정" 처리 |
| 전략팀 Step C: 핵심 메시지 비서실 승인 | rfp-context.md 기반 자동 생성 후 바로 제안서 작성 |
| PM Step 7→8: WBS 납기일 확정 | rfp-context.md의 납기일 자동 사용 |
| 웹기획팀 Step 9: IA 1depth 확인 | URL 분석 + RFP 기반 자동 생성 후 바로 2depth 진행 |

### 유지되는 확인 요청 (1개)

| 확인 시점 | 이유 |
|---------|------|
| **외부 발주처 명의 문서 최종 발행 직전** | 공식 제출 문서 오류 발송 방지 — 이사님 최종 검토 필수 |

---

## 워크플로우 라우팅

이사님 또는 팀원의 지시를 받으면 아래 기준으로 해당 에이전트에 위임:

| 지시 유형 | 라우팅 대상 | 주요 스킬 |
|-----------|------------|----------|
| **URL + RFP 동시 제공** | **rfp-analyzer 스킬 → 제안 파트 L2 → 구축 파트 L2 순차 자동 실행** | **`rfp-analyzer`** |
| 제안서 작성 / 수주 기회 | 제안 파트 L2 | `proposal-writer`, `strategy-analyzer` |
| 정책자금 조회 / 매칭 | 제안 파트 → 정책자금팀 L3 | `policy-fund-finder` |
| 프로젝트 킥오프 / WBS | 구축 파트 → PM L3 | `project-kickoff` |
| IA 설계서 작성 | 구축 파트 → 웹기획팀 L3 | `ia-generator` |
| 화면설계서 작성 | 구축 파트 → 웹기획팀 L3 | `wireframe-spec` |
| KPI 보고서 (주간/월간) | 비서실 L1 직접 수행 | `kpi-reporter` |
| 운영·마케팅 업무 | 운영 파트 L2 | — |
| 기술 리서치 | 연구소 L2 | — |

---

## 디자인 시스템 표준 (KRDS v1.0.0)

모든 Figma 산출물·HTML·대시보드·Google Apps Script 스타일링에 **KRDS v1.0.0**을 기본 디자인 시스템으로 사용한다.

> 레퍼런스: `/templates/krds-design-system.md`  
> 공식 사이트: https://www.krds.go.kr

### 핵심 토큰 (빠른 참조)

| 항목 | 값 |
|------|---|
| **Primary Color** | `#256EF4` (정부 블루) |
| Primary Dark (Hover/Active) | `#0B50D0` |
| 기본 텍스트 | `#1A1E2B` |
| 보조 텍스트 | `#6B7280` |
| 기본 배경 | `#FFFFFF` |
| 서브 배경 | `#F7F8FA` |
| 테두리 | `#E0E2EA` |
| Success | `#1B7F3E` |
| Warning | `#C45000` |
| Danger | `#C40A0A` |
| **폰트** | Pretendard GOV (대체: Pretendard Variable) |
| **기본 본문 크기** | **17px** (16px 아님) |
| 제목 Weight | 700 (Bold) |
| 본문 Line Height | 160% |
| 스페이싱 기준 | 8px 그리드 |
| 버튼 최소 높이 | 48px (터치 44px) |
| 카드 Radius | 8px |
| 버튼 Radius | 4px |

### 산출물 유형별 적용 기준

| 산출물 | 적용 방법 |
|--------|---------|
| Figma (PR-01, DE-08, IM-01 등) | KRDS 색상 팔레트 + 타이포/스페이싱 토큰 직접 적용 |
| Google Apps Script (GS 산출물) | `krds-design-system.md` §8의 GAS 상수 사용 |
| HTML 대시보드 | `krds-design-system.md` §8의 CSS 변수 블록 삽입 |

> **예외**: 고객사 브랜드 가이드가 존재하는 경우, 고객사 Primary Color를 `#256EF4` 자리에 대체하되 나머지 토큰(타이포·스페이싱·Neutral·Semantic)은 KRDS 기준 유지.

---

## 문서 표준 규칙

### 모든 산출물에 적용

1. **템플릿 참조 필수**: 산출물 생성 전 반드시 `/templates/` 내 해당 템플릿 참조
2. **저장 경로**: `/output/{자회사}/{프로젝트명 또는 팀}/{문서유형}-{날짜 또는 프로젝트명}.md`
3. **임의 포맷 금지**: 템플릿 구조를 임의로 변경하지 말 것
4. **문서 코드 준수**: WBS 산출물 코드(PM-01~OP-05) 헤더에 명시
5. **버전 관리**: 모든 문서는 버전(v1.0~), 작성일, 작성자 명시

### 템플릿 목록

| 문서 유형 | 템플릿 파일 | 문서 코드 |
|-----------|------------|----------|
| 프로젝트 킥오프 / WBS | `/templates/kickoff-template.md` | PM-03 |
| 요구사항정의서 / 현황분석서 | `/templates/requirements-template.md` | AY-01 |
| IA / 메뉴 정의서 | `/templates/ia-template.md` | DE-03 |
| 화면설계서 (SB) | `/templates/wireframe-template.md` | DE-08 |
| 통합 테스트 시나리오 | `/templates/test-scenario-template.md` | TE-03 |
| 제안서 | `/templates/proposal-template.md` | PR-01 (Figma 프리젠테이션 출력) |
| 정책자금 사업제안서 | `/templates/policy-fund-template.md` | PR-02 (Figma 프리젠테이션 출력) |
| 주간 보고서 | `/templates/weekly-report-template.md` | PM-WR |
| 월간 보고서 | `/templates/monthly-report-template.md` | PM-MR |
| **KRDS 디자인 시스템** | `/templates/krds-design-system.md` | — (모든 시각 산출물 공통 참조) |

---

## 구축 파트 프로젝트 표준 단계 (WBS)

모든 구축 프로젝트는 아래 6단계를 준수한다:

| 단계 | 코드 | 가중치 | 주요 산출물 |
|------|------|--------|------------|
| 착수 | PM | 5% | PM-01 사업수행계획서 (Figma), PM-02 완료보고서 (Figma), PM-03 WBS (Google Sheet) |
| 분석 | AY | 10% | AY-01 요구사항 정의서 (Google Sheet) |
| 설계 | DE | 20% | DE-01 컨셉 정의서 (Figma), DE-02 디자인 시안 (Figma), DE-03 IA/메뉴 정의서 (Google Sheet), DE-04 정책정의서 (Google Sheet), DE-05 테이블정의서·ERD (Google Sheet), DE-06 프로그램 목록 (Google Sheet), DE-07 API 정의서 (Google Sheet), DE-08 화면설계서/SB (Figma) |
| 구현 | IM | 45% | IM-01 디자인 시스템 (Figma), IM-02 디자인 화면 (Figma), IM-03 개발가이드 (Google Sheet), IM-04 Github 운영 소스 |
| 테스트 | TE | 10% | TE-01 단위 테스트 시나리오 (GS), TE-02 단위 테스트 결과서 (GS), TE-03 통합 테스트 시나리오 (GS), TE-04 통합 테스트 결과서 (GS), TE-05 스트레스 테스트 계획서 (GS), TE-06 스트레스 테스트 결과서 (GS), TE-07 모의해킹 테스트 계획서 (GS), TE-08 모의해킹 테스트 결과서 (GS) |
| 오픈/운영 | OP | 10% | OP-01 전환계획서 (GS), OP-02 하자보수 계획서 (GS), OP-03 교육훈련 계획서 (GS), OP-04 운영자/사용자 매뉴얼 (Figma), OP-05 검수확인서 (GS) |

### 산출물 출력 도구 규칙

에이전트가 산출물을 자동 생성할 때 반드시 아래 도구를 사용한다:

| 출력 도구 | 해당 산출물 코드 |
|-----------|----------------|
| **Figma** (Figma MCP 사용) | PM-01, PM-02, DE-01, DE-02, DE-08, IM-01, IM-02, OP-04, **PR-01, PR-02** |
| **Google Sheet** (Google Drive MCP 사용) | PM-03, AY-01, DE-03, DE-04, DE-05, DE-06, DE-07, IM-03, TE-01~08, OP-01~03, OP-05 |
| **GitHub** (저장소 링크 제공) | IM-04 |

### Google Sheet 스타일 규칙

Google Drive MCP로 스프레드시트를 생성할 때 **모든 헤더 행(1행)**에 아래 스타일을 적용한다:

| 항목 | 값 |
|------|---|
| 배경 컬러 | `#29292A` |
| 폰트 컬러 | `#FFFFFF` (white) |
| 폰트 굵기 | Bold |
| 텍스트 정렬 | Center (수평) |

Google Apps Script로 생성하는 경우 시트 생성 직후 아래 코드를 반드시 포함한다:

```javascript
// 헤더 행 스타일 적용
var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
headerRange.setBackground('#29292A');
headerRange.setFontColor('#FFFFFF');
headerRange.setFontWeight('bold');
headerRange.setHorizontalAlignment('center');
```

---

### 파일 생성 원칙

1. **MCP 직접 생성**: 산출물은 텍스트 내용 확인 없이 Figma MCP 또는 Google Drive MCP로 즉시 생성한다. 로컬 `.md` 파일로 초안을 작성한 뒤 업로드하는 방식 금지.
2. **프로젝트 가이드 파일 보호**: `CLAUDE.md`, `AGENT.md`, `SKILL.md`, `/templates/` 내 파일은 절대 수정·삭제하지 않는다.
3. **output 폴더 격리**: 프로젝트별 산출물은 `/output/{파트}/{프로젝트명}/` 하위에만 저장. 이 경계를 벗어난 경로에 파일을 생성하지 않는다.
4. **output 폴더는 임시**: `/output/` 폴더는 향후 삭제 예정. MCP 연결이 불가한 경우에만 임시 저장 후 MCP 생성 즉시 삭제.

---

## 산출물 검증 기준

- **스키마 검증**: 필수 섹션/필드 존재 여부 — `scripts/validate-doc.py` 실행
- **규칙 기반 검증**: 항목 수, 구조 규칙 — 에이전트 내 규칙 체크
- **LLM 자기 검증**: 정성적 품질 — 에이전트 자체 평가
- **사람 검토**: 이사님 최종 승인이 필요한 산출물 (제안서, 사업수행계획서 등)

**재시도 정책**: LLM 자기 검증 실패 시 최대 2회 자동 재시도. 이후 담당자 에스컬레이션.

---

## KPI 모니터링

- **주간 KPI**: 매주 월요일 자동 실행 → `/output/비서실/weekly-{YYYYMMDD}.md`
- **월간 KPI**: 매월 1일 자동 실행 → `/output/비서실/monthly-{YYYYMM}.md`
- **집계 방식**: `scripts/collect-kpi.py`로 `/output/` 스캔 → LLM이 해석 및 서술

---

## 스킬 사용 규칙

모든 커스텀 스킬은 `.claude/skills/` 에 위치하며, 스킬 생성 시 반드시 `skill-creator`를 통해 생성한다.

| 스킬명 | 트리거 | 역할 |
|--------|--------|------|
| `rfp-analyzer` | URL + RFP 동시 제공 시 자동 실행 | URL 분석 + RFP 파싱 → rfp-context.md 생성 |
| `proposal-writer` | 제안서 작성 요청 | 제안서 초안 생성 |
| `strategy-analyzer` | 시장/경쟁사 분석 요청 | 분석 문서 작성 |
| `policy-fund-finder` | 정책자금 조회 | 매칭 자금 목록 생성 |
| `project-kickoff` | 킥오프/WBS 작성 | WBS + 사업수행계획서 생성 |
| `ia-generator` | IA 설계 요청 | FO/BO IA 설계서 작성 |
| `wireframe-spec` | 화면설계서 요청 | 화면설계서 작성 |
| `kpi-reporter` | KPI 보고 트리거 | 주간/월간 보고서 생성 |
| `doc-formatter` | 문서 포맷 교정 | 표준 양식 적용 |
