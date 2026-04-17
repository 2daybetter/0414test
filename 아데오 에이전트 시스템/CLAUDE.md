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
│   ├── PM L3 (.claude/agents/PM팀/AGENT.md)
│   ├── 웹기획팀 L3 (.claude/agents/웹기획팀/AGENT.md)
│   ├── 디자인팀 L3 (.claude/agents/디자인팀/AGENT.md)
│   └── 개발팀 L3 (.claude/agents/개발팀/AGENT.md)
├── 운영 파트 L2 (.claude/agents/운영 파트/AGENT.md)
└── 연구소 L2 (.claude/agents/연구소/AGENT.md)
```

**계층 규칙**: 서브에이전트는 동급/하위 에이전트를 직접 호출 불가 — 반드시 상위 에이전트 경유.

---

## 워크플로우 라우팅

이사님 또는 팀원의 지시를 받으면 아래 기준으로 해당 에이전트에 위임:

| 지시 유형 | 라우팅 대상 | 주요 스킬 |
|-----------|------------|----------|
| 제안서 작성 / 수주 기회 | 제안 파트 L2 | `proposal-writer`, `strategy-analyzer` |
| 정책자금 조회 / 매칭 | 제안 파트 → 정책자금팀 L3 | `policy-fund-finder` |
| 프로젝트 킥오프 / WBS | 구축 파트 → PM L3 | `project-kickoff` |
| IA 설계서 작성 | 구축 파트 → 웹기획팀 L3 | `ia-generator` |
| 화면설계서 작성 | 구축 파트 → 웹기획팀 L3 | `wireframe-spec` |
| KPI 보고서 (주간/월간) | 비서실 L1 직접 수행 | `kpi-reporter` |
| 운영·마케팅 업무 | 운영 파트 L2 | — |
| 기술 리서치 | 연구소 L2 | — |

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
| IA 설계서 | `/templates/ia-template.md` | DE-02 |
| 화면설계서 | `/templates/wireframe-template.md` | DE-03 |
| 통합 테스트 시나리오 | `/templates/test-scenario-template.md` | TE-02 |
| 제안서 | `/templates/proposal-template.md` | PR-01 |
| 정책자금 사업제안서 | `/templates/policy-fund-template.md` | PR-02 |
| 주간 보고서 | `/templates/weekly-report-template.md` | PM-WR |
| 월간 보고서 | `/templates/monthly-report-template.md` | PM-MR |

---

## 구축 파트 프로젝트 표준 단계 (WBS)

모든 구축 프로젝트는 아래 6단계를 준수한다:

| 단계 | 코드 | 가중치 | 주요 산출물 |
|------|------|--------|------------|
| 착수 | PM | 5% | PM-01 착수보고서, PM-02 인력계획서, PM-03 WBS |
| 분석 | AY | 10% | AY-01 요구사항정의서 / 현황분석서 |
| 설계 | DE | 20% | DE-02 IA, DE-03 화면설계서, DE-04 디자인가이드, DE-05 DB설계서, DE-06 아키텍처, DE-07 API명세서, DE-08 보안설계서 |
| 구현 | IM | 45% | IM-01~04 소스코드 및 인프라 |
| 테스트 | TE | 10% | TE-01~08 테스트 결과서 |
| 오픈/운영 | OP | 10% | OP-01~05 운영 관련 산출물 |

---

## 산출물 검증 기준

- **스키마 검증**: 필수 섹션/필드 존재 여부 — `scripts/validate-doc.py` 실행
- **규칙 기반 검증**: 항목 수, 구조 규칙 — 에이전트 내 규칙 체크
- **LLM 자기 검증**: 정성적 품질 — 에이전트 자체 평가
- **사람 검토**: 이사님 최종 승인이 필요한 산출물 (제안서, 착수 보고서 등)

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
| `proposal-writer` | 제안서 작성 요청 | 제안서 초안 생성 |
| `strategy-analyzer` | 시장/경쟁사 분석 요청 | 분석 문서 작성 |
| `policy-fund-finder` | 정책자금 조회 | 매칭 자금 목록 생성 |
| `project-kickoff` | 킥오프/WBS 작성 | WBS + 착수보고서 생성 |
| `ia-generator` | IA 설계 요청 | FO/BO IA 설계서 작성 |
| `wireframe-spec` | 화면설계서 요청 | 화면설계서 작성 |
| `kpi-reporter` | KPI 보고 트리거 | 주간/월간 보고서 생성 |
| `doc-formatter` | 문서 포맷 교정 | 표준 양식 적용 |
