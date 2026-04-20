# 이노빌드랩 유지보수/운영 제안 에이전트 시스템 설계서

> 작성일: 2026-04-21
> 목적: Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트

### 배경 및 목적

아데오 에이전트 시스템은 현재 "URL + RFP 동시 제공" 시에만 자동 실행 모드가 활성화된다. 이노빌드랩(innobuildlab.com)처럼 **RFP 없이 영업 목적으로 먼저 접근하는 신규 수주 상황**에 대응하는 워크플로우가 없다. 이 설계서는 다음 두 단계를 자동화하는 에이전트 확장을 정의한다:

- **Phase 1 (수주 전)**: 공개 정보만으로 사이트를 분석하여 유지보수/운영 제안서를 생성
- **Phase 2 (수주 후)**: 운영 계약 체결 후 기획 산출물(요구사항 정의서·IA·화면설계서·WBS)을 월별 순차 납품

### 범위

- 포함:
  - `site-analyzer` 스킬 신규 생성 (RFP 없이 URL만으로 사이트 현황 분석)
  - `proposal-writer` 스킬 확장 — 유지보수/운영 제안서 모드 추가
  - CLAUDE.md(L1) 라우팅 규칙에 "URL 단독 (No-RFP)" 모드 추가
  - 수주 후 기획 산출물 순차 납품 워크플로우 (기존 스킬 재활용)
  - `.status` 파일 기반 상태 관리 (기존 규칙 준수)

- 제외:
  - 사이트 리뉴얼·구축 제안 (현 단계 범위 밖)
  - 서버/호스팅 직접 운영
  - 콘텐츠 정기 업데이트 서비스

### 입출력 정의

| 항목 | 내용 |
|------|------|
| **입력** | 고객사 URL (`https://innobuildlab.com/`), 제안 유형 = "유지보수/운영", 제안사 정보 (회사명·레퍼런스) |
| **출력** | Phase 1: 유지보수/운영 제안서 Figma (PR-01), 현황 분석서 Google Drive (AY-01) / Phase 2: 요구사항 정의서(AY-01), IA(DE-03), 화면설계서(DE-08), WBS(PM-03) — 모두 Google Drive/Figma |
| **트리거** | L1 CLAUDE.md에 URL만 단독 제공 + "유지보수/운영 제안" 지시 수신 시 |

### 제약조건

- innobuildlab.com의 SSL 인증서 오류로 직접 크롤링 불가 → 웹 검색(WebSearch), 링크드인, SNS, 포트폴리오 등 공개 정보로 분석 대체
- 월 100~300만원 소규모 계약 → 산출물 범위는 운영비 내 공수로 처리 가능한 수준 유지
- 기존 아데오 에이전트 시스템 `.status` 파일 규칙 및 Google Drive/Figma 출력 원칙 준수
- 하위 에이전트 간 직접 호출 금지 — 반드시 상위 에이전트 경유

### 용어 정의

| 용어 | 정의 |
|------|------|
| No-RFP 모드 | RFP 없이 URL만 제공된 경우의 제안 자동화 모드 |
| Phase 1 | 수주 전 제안서 생성 단계 |
| Phase 2 | 수주 후 기획 산출물 순차 납품 단계 |
| 사이트 현황 분석서 | site-analyzer가 생성하는 공개 정보 기반 분석 문서 (AY-01 포맷) |
| 납품 산출물 | 운영 계약 이후 월별로 납품하는 기획 문서 4종 |

---

## 2. 워크플로우 정의

### 전체 흐름도

```
[입력: URL + "유지보수/운영" 지시]
        ↓
[L1: No-RFP 모드 감지 → proposal-co L2 위임]
        ↓
[Step 1: 사이트 현황 분석]  ← site-analyzer 스킬
  → 현황 분석서(AY-01) → Google Drive 저장
        ↓
[Step 2: 제안 전략 수립]  ← strategy-analyzer 스킬
  → 제안 전략 문서 → Google Drive 저장
        ↓
[Step 3: 유지보수/운영 제안서 생성]  ← proposal-writer 스킬 (운영 모드)
  → PR-01 제안서 → Figma 저장
        ↓
[✋ 확인 요청: 이사님 제안서 검토 후 발송 승인]
        ↓
[Phase 2 대기: 계약 체결 후 L1이 Phase 2 트리거]
        ↓
[Step 4: 요구사항 정의서 생성 — Month 1]
  → AY-01 → Google Drive
        ↓
[Step 5: IA / 사이트맵 생성 — Month 1~2]
  → DE-03 → Google Drive
        ↓
[Step 6: 화면설계서 생성 — Month 2]
  → DE-08 → Figma
        ↓
[Step 7: WBS / 일정계획 생성 — Month 2~3]
  → PM-03 → Google Drive
        ↓
[완료 보고 → L1]
```

### LLM 판단 vs 코드 처리 구분

| LLM이 직접 수행 | 스크립트로 처리 |
|----------------|----------------|
| 공개 정보 기반 사이트 현황 분석 및 개선 포인트 도출 | Google Drive .status 파일 읽기/쓰기 |
| 유지보수 서비스 범위 정의 (기능 개선 항목 도출) | 요구사항 정의서 Excel 템플릿 렌더링 (gen_requirements.py) |
| 장기 파트너십 내러티브 구성 및 제안서 본문 작성 | WBS Excel 생성 (gen_wbs.py) |
| IA 1depth/2depth 구조 설계 | validate-doc.py 스키마 검증 |
| 화면설계서 화면 목록 정의 및 기능 명세 | Figma MCP 파일 생성 호출 |
| 요구사항 우선순위 판단 | Google Drive MCP 업로드 호출 |

### 단계별 상세

#### Step 1: 사이트 현황 분석

- **처리 주체**: 에이전트 — `site-analyzer` 스킬 (영업팀 L3 담당)
- **입력**: 고객사 URL (`https://innobuildlab.com/`), WebSearch로 수집한 공개 정보
- **처리 내용**:
  1. WebSearch로 회사명·사업 분야·주요 서비스·레퍼런스 수집
  2. 사이트 기술스택 추정 (공개 소스 기반)
  3. 현재 사이트 UX 문제점·개선 기회 도출 (5~7개 항목)
  4. 유지보수 필요 영역 우선순위 도출
  5. AY-01 포맷으로 현황 분석서 작성
- **출력**: Google Drive `아데오 프로젝트/이노빌드랩-운영/AY-01-현황분석서.xlsx`
- **성공 기준**: 회사 개요·현황 분석·개선 포인트(최소 5개)·기술스택 추정 섹션 모두 존재
- **검증 방법**: 규칙 기반 — 4개 섹션 존재 여부 + 개선 포인트 5개 이상
- **실패 시 처리**: WebSearch 결과 부족 시 분석 가능한 항목만으로 문서 생성 후 "미확인 항목" 명시, 에스컬레이션 없이 진행

#### Step 2: 제안 전략 수립

- **처리 주체**: 에이전트 — `strategy-analyzer` 스킬 (전략팀 L3 담당)
- **입력**: Step 1 현황 분석서 Drive URL (.status `outputs.site-analysis`)
- **처리 내용**:
  1. 개선 포인트 기반 운영 서비스 범위 정의 (기능 개선 중심)
  2. 월 서비스 패키지 구성 (기본/표준 2티어, 100~300만원 범위)
  3. 차별화 메시지 도출 ("장기 파트너십" 내러티브)
  4. 제안서 핵심 섹션별 메시지 맵 작성
- **출력**: Google Drive `아데오 프로젝트/이노빌드랩-운영/proposal-strategy.md`
- **성공 기준**: 서비스 패키지 2티어 정의 + 차별화 메시지 + 섹션별 메시지 맵 존재
- **검증 방법**: LLM 자기 검증 — 가격 티어 존재 여부 + 차별화 내러티브 일관성
- **실패 시 처리**: 자동 재시도 최대 2회 → 이후 이사님 에스컬레이션

#### Step 3: 유지보수/운영 제안서 생성

- **처리 주체**: 에이전트 — `proposal-writer` 스킬 (유지보수/운영 모드, 전략팀 L3 담당)
- **입력**: Step 1 현황 분석서 + Step 2 전략 문서 Drive URL
- **처리 내용**:
  1. 제안서 7개 섹션 순서대로 생성 (spec 목차 기준)
  2. Figma MCP로 PR-01 슬라이드 생성
  3. 가격 옵션 A/B 슬라이드 포함
  4. 월별 납품 산출물 로드맵 슬라이드 포함
- **출력**: Figma `아데오/이노빌드랩-운영-제안서 (PR-01)`
- **성공 기준**: 7개 섹션 슬라이드 + 가격 옵션 + 납품 로드맵 슬라이드 존재
- **검증 방법**: 규칙 기반 — 섹션 수 7개 이상, 가격 슬라이드 존재
- **실패 시 처리**: Figma MCP 오류 시 로컬 MD 초안 → 이사님 수동 업로드 요청

#### Step 4: 요구사항 정의서 생성 (Month 1)

- **처리 주체**: 에이전트 — webagency-co L2 → 웹기획팀 L3 (기존 AY-01 워크플로우)
- **입력**: 계약 체결 확인 메시지 + Step 1 현황 분석서 Drive URL
- **처리 내용**: 현황 분석 기반으로 기능 요구사항 (FO/BO) 정의, AY-01 포맷 작성
- **출력**: Google Drive `아데오 프로젝트/이노빌드랩-운영/AY-01-요구사항정의서.xlsx`
- **성공 기준**: FO 요구사항 최소 10개 + 우선순위 컬럼 존재
- **검증 방법**: 규칙 기반 — 행 수 10개 이상, 필수 컬럼 존재
- **실패 시 처리**: 자동 재시도 1회 → 실패 시 담당자 에스컬레이션

#### Step 5: IA / 사이트맵 생성 (Month 1~2)

- **처리 주체**: 에이전트 — `ia-generator` 스킬 (웹기획팀 L3 담당)
- **입력**: Step 4 요구사항 정의서 Drive URL
- **처리 내용**: FO/BO IA 2depth 구조 설계, DE-03 포맷 작성
- **출력**: Google Drive `아데오 프로젝트/이노빌드랩-운영/DE-03-IA.xlsx`
- **성공 기준**: FO/BO IA 1depth·2depth 구조 + 메뉴 정책 존재
- **검증 방법**: 규칙 기반 — FO 1depth 최소 4개 + BO IA 존재
- **실패 시 처리**: 자동 재시도 1회 → 실패 시 담당자 에스컬레이션

#### Step 6: 화면설계서 생성 (Month 2)

- **처리 주체**: 에이전트 — `wireframe-spec` 스킬 (웹기획팀 L3 담당)
- **입력**: Step 5 IA Drive URL
- **처리 내용**: IA 기반 주요 화면 Figma 와이어프레임 생성 (1depth = Section, 2depth = Frame)
- **출력**: Figma `아데오/이노빌드랩-운영-화면설계서 (DE-08)`
- **성공 기준**: 주요 화면 최소 10개 프레임 + 기능 명세 주석 존재
- **검증 방법**: 규칙 기반 — Figma 프레임 수 10개 이상
- **실패 시 처리**: Figma MCP 오류 시 담당자 에스컬레이션

#### Step 7: WBS / 일정계획 생성 (Month 2~3)

- **처리 주체**: 에이전트 — `project-kickoff` 스킬 (PM L3 담당)
- **입력**: Step 4~6 산출물 Drive/Figma URL 목록
- **처리 내용**: 운영 서비스 WBS 작성 (월별 업무 단위), gen_wbs.py → Drive MCP 업로드
- **출력**: Google Drive `아데오 프로젝트/이노빌드랩-운영/PM-03-WBS.xlsx`
- **성공 기준**: 월별 업무 계획 + 담당자 + 산출물 컬럼 존재
- **검증 방법**: 규칙 기반 — 최소 3개월 계획 행 존재
- **실패 시 처리**: 자동 재시도 1회 → 실패 시 담당자 에스컬레이션

### 상태 전이

| 상태 | 전이 조건 | 다음 상태 |
|------|----------|----------|
| INIT | URL + "유지보수/운영" 지시 수신 | ANALYZING |
| ANALYZING | Step 1 현황 분석서 Drive URL 존재 | STRATEGIZING |
| STRATEGIZING | Step 2 전략 문서 Drive URL 존재 | PROPOSING |
| PROPOSING | Step 3 Figma PR-01 URL 존재 | PENDING_APPROVAL |
| PENDING_APPROVAL | 이사님 확인 완료 | WAITING_CONTRACT |
| WAITING_CONTRACT | 계약 체결 메시지 수신 | DELIVERING |
| DELIVERING | Step 4~7 모든 산출물 Drive/Figma URL 존재 | COMPLETED |
| COMPLETED | 완료 보고 전송 | — |

---

## 3. 구현 스펙

### 폴더 구조

```
아데오 에이전트 시스템/
  ├── CLAUDE.md                          ← No-RFP 모드 라우팅 규칙 추가
  ├── .claude/
  │   ├── skills/
  │   │   ├── site-analyzer/             ← 신규 생성
  │   │   │   ├── SKILL.md
  │   │   │   ├── scripts/
  │   │   │   │   └── validate_site_analysis.py
  │   │   │   └── references/
  │   │   │       └── site-analysis-rules.md
  │   │   ├── proposal-writer/           ← 기존 확장 (운영 모드 추가)
  │   │   │   ├── SKILL.md               ← maintenance_mode 섹션 추가
  │   │   │   └── references/
  │   │   │       └── proposal-rules.md  ← 유지보수/운영 제안 규칙 추가
  │   │   ├── ia-generator/              ← 기존 재활용 (변경 없음)
  │   │   ├── wireframe-spec/            ← 기존 재활용 (변경 없음)
  │   │   └── project-kickoff/           ← 기존 재활용 (변경 없음)
  │   └── agents/
  │       ├── proposal-co/
  │       │   └── AGENT.md               ← No-RFP 분기 추가
  │       └── webagency-co/
  │           └── AGENT.md               ← Phase 2 트리거 조건 추가
  └── templates/
      └── proposal-template.md           ← 유지보수/운영 목차 섹션 추가
```

### CLAUDE.md 핵심 섹션 목록

- **워크플로우 라우팅**: "URL 단독 + 유지보수/운영" 조건 추가 (기존 "URL + RFP" 분기 하위에 배치)
- **No-RFP 자동 실행 모드**: Phase 1/2 단계 정의, 확인 요청 시점 명시
- **스킬 사용 규칙**: `site-analyzer` 스킬 항목 추가

### 에이전트 구조

**구조 선택**: 멀티 에이전트 (기존 L1-L2-L3 계층 확장)

**선택 근거**: 기존 아데오 에이전트 시스템이 이미 L1-L2-L3 멀티에이전트로 설계되어 있으며, Phase 1(제안)과 Phase 2(기획 산출물)는 각각 proposal-co, webagency-co로 자연스럽게 분리된다. 컨텍스트 독립성과 스킬 재활용성을 위해 기존 구조를 확장한다.

#### 메인 에이전트 (CLAUDE.md)

- **역할**: No-RFP 모드 감지, Phase 1/2 라우팅, 이사님 확인 요청 중계
- **담당 단계**: 트리거 감지, proposal-co 위임, Phase 2 계약 확인 후 webagency-co 위임, 완료 보고

#### 서브에이전트 목록

| 이름 | 역할 | 트리거 조건 | 입력 | 출력 | 참조 스킬 |
|------|------|-----------|------|------|----------|
| proposal-co L2 | Phase 1 전체 조율 | L1이 No-RFP 모드 감지 | URL + 제안 유형 | .status 업데이트 | `site-analyzer`, `strategy-analyzer`, `proposal-writer` |
| 영업팀 L3 | 사이트 현황 분석 | proposal-co Step 1 위임 | URL | 현황 분석서 Drive URL | `site-analyzer` |
| 전략팀 L3 | 전략 수립 + 제안서 생성 | proposal-co Step 2~3 위임 | 분석서 + 전략 문서 URL | Figma PR-01 URL | `strategy-analyzer`, `proposal-writer` |
| webagency-co L2 | Phase 2 기획 산출물 조율 | L1이 계약 체결 확인 후 위임 | .status 파일 + 분석서 URL | 산출물 4종 Drive/Figma URL | `ia-generator`, `wireframe-spec`, `project-kickoff` |
| 웹기획팀 L3 | 요구사항·IA·화면설계서 생성 | webagency-co Step 4~6 위임 | 분석서 + 요구사항 URL | AY-01, DE-03, DE-08 URL | `ia-generator`, `wireframe-spec` |
| PM L3 | WBS 생성 | webagency-co Step 7 위임 | 산출물 URL 목록 | PM-03 Drive URL | `project-kickoff` |

### 스킬/스크립트 목록

| 이름 | 유형 | 역할 | 트리거 조건 |
|------|------|------|-----------|
| `site-analyzer` | 스킬 (신규) | URL 단독으로 사이트 현황 분석 → AY-01 생성 | No-RFP 모드 Step 1 |
| `proposal-writer` | 스킬 (확장) | 유지보수/운영 제안서 모드 추가 (기존 일반 제안서 모드에 `maintenance_mode` 분기) | No-RFP 모드 Step 3 |
| `strategy-analyzer` | 스킬 (기존) | 제안 전략 문서 생성 | No-RFP 모드 Step 2 |
| `ia-generator` | 스킬 (기존) | FO/BO IA 설계서 생성 | Phase 2 Step 5 |
| `wireframe-spec` | 스킬 (기존) | 화면설계서 Figma 생성 | Phase 2 Step 6 |
| `project-kickoff` | 스킬 (기존) | WBS 생성 | Phase 2 Step 7 |
| `scripts/validate_site_analysis.py` | 스크립트 (신규) | 현황 분석서 필수 섹션 검증 | Step 1 완료 후 |

### 스킬 생성 규칙

> 이 설계서에 정의된 모든 스킬은 구현 시 반드시 `skill-creator` 스킬(`/skill-creator`)을 사용하여 생성할 것.
> 직접 SKILL.md를 수동 작성하지 말 것 — 규격 불일치 및 트리거 실패의 원인이 됨.

skill-creator가 보장하는 규격:
1. SKILL.md frontmatter (`name`, `description`) 필수 필드 준수
2. `description`의 트리거 정확도 최적화 (eval 기반 optimization loop)
3. 폴더 구조 (`SKILL.md` + `scripts/` + `references/`) 규격 준수
4. Progressive disclosure: SKILL.md 본문 500줄 이내, 대용량 참조는 `references/`로 분리
5. 테스트 프롬프트 실행 및 품질 검증 완료

**신규 생성 대상**: `site-analyzer`
**확장 대상** (skill-creator로 업데이트 처리): `proposal-writer`

### 주요 산출물 파일

| 파일 | 형식 | 생성 단계 | 용도 |
|------|------|----------|------|
| Google Drive `AY-01-현황분석서.xlsx` | Google Sheet | Step 1 | 사이트 현황 파악, 이후 단계 입력 |
| Google Drive `proposal-strategy.md` | Drive 문서 | Step 2 | 제안 전략, 가격 티어, 메시지 맵 |
| Figma `이노빌드랩-운영-제안서 (PR-01)` | Figma 슬라이드 | Step 3 | 클라이언트 제출용 제안서 |
| Google Drive `AY-01-요구사항정의서.xlsx` | Google Sheet | Step 4 | 운영 기능 요구사항 |
| Google Drive `DE-03-IA.xlsx` | Google Sheet | Step 5 | FO/BO 사이트 구조 |
| Figma `이노빌드랩-운영-화면설계서 (DE-08)` | Figma 파일 | Step 6 | 주요 화면 와이어프레임 |
| Google Drive `PM-03-WBS.xlsx` | Google Sheet | Step 7 | 월별 운영 업무 일정 |
| Google Drive `.status/.status` | 텍스트 | 전 단계 | 진행 상태 및 산출물 URL 관리 |

---

## 4. 구현 순서 (권장)

1. **CLAUDE.md 라우팅 확장** — No-RFP 모드 분기 조건 추가 (2줄 추가)
2. **`site-analyzer` 스킬 생성** — skill-creator로 신규 생성, `references/site-analysis-rules.md` 작성
3. **`proposal-writer` 스킬 확장** — skill-creator로 `maintenance_mode` 분기 추가, `proposal-rules.md` 유지보수/운영 섹션 보완
4. **proposal-co AGENT.md 확장** — No-RFP Step 0~3 분기 추가
5. **webagency-co AGENT.md 확장** — Phase 2 트리거 조건 추가
6. **`validate_site_analysis.py` 스크립트 생성** — 현황 분석서 검증 스크립트
7. **통합 테스트** — 이노빌드랩 URL 입력 → Phase 1 산출물 생성 확인
