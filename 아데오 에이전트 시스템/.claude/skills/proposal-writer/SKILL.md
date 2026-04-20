---
name: proposal-writer
description: 수주 제안서(PR-01)를 생성하는 스킬. RFP 분석 결과와 제안 전략을 입력받아 아데오 표준 제안서를 작성한다. 표지·목차·경영진 요약·사업 이해·수행 방법론·팀 구성·일정·금액·차별화 포인트를 포함한다. 트리거: "제안서 작성", "proposal-writer", "제안서 초안", PR-01 산출물 요청, 전략팀 에이전트의 Step C-2 진입 시 자동 참조.
---

# proposal-writer

## 개요

기회 분석 보고서 + 제안 전략 문서 기반으로 아데오 표준 제안서(PR-01)를 생성한다.  
반드시 `/templates/proposal-template.md` 를 참조하여 작성한다.

---

## 실행 절차

### Step 1: 입력 확인

| 필수 입력 | 확인 방법 |
|---------|---------|
| 기회 분석 보고서 | Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status 파일의 `outputs.opportunity-analysis` Drive URL → `mcp__claude_ai_Google_Drive__read_file_content`로 읽기 |
| 제안 전략 문서 | Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status 파일의 `outputs.proposal-strategy` Drive URL → `mcp__claude_ai_Google_Drive__read_file_content`로 읽기 |
| 제안서 템플릿 | `/templates/proposal-template.md` 존재 여부 |
| 핵심 메시지 승인 여부 | `outputs.rfp-context` URL 존재 여부로 판단 — URL 존재 시 자동 실행 모드 |

**자동 실행 모드** (`outputs.rfp-context` URL 존재): 핵심 메시지 승인 없이 rfp-context 기반으로 즉시 진행.  
**수동 모드** (`outputs.rfp-context` 없음): 핵심 메시지 미승인 상태이면 **[확인 요청]** 재출력 후 중단.

### Step 2: 제안서 구성 작성

세부 작성 기준은 `references/proposal-rules.md` 참조.

| 섹션 | 내용 |
|------|------|
| 표지 | 프로젝트명, 제출처, 제출일, 회사명 |
| 경영진 요약 (Executive Summary) | 1~2페이지, 핵심 메시지 + 기대 효과 |
| 사업 이해 | RFP 분석 기반 발주처 니즈 정리 |
| 수행 방법론 | 아데오 표준 6단계(PM/AY/DE/IM/TE/OP) 적용 계획 |
| 팀 구성 | 투입 인력 경력 및 역할 |
| 수행 일정 | 6단계 마일스톤 요약 |
| 수행 금액 | 견적 요약 (있는 경우) |
| 차별화 포인트 | 경쟁사 대비 강점 3가지 이상 |
| 레퍼런스 | 유사 수행 실적 (있는 경우) |

### Step 3: 자기 검증

- [ ] 경영진 요약 섹션 존재
- [ ] 수행 방법론에 6단계 언급
- [ ] 차별화 포인트 3가지 이상
- [ ] 발주처 명칭 일관성 (오타 없음)

### Step 4: 출력 및 저장

- **출력 방법**: Figma MCP(`mcp__claude_ai_Figma__create_new_file`)로 제안서(PR-01) 생성 → Figma URL을 Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status 파일의 `outputs.proposal`에 기록
- **검증**: `scripts/validate-doc.py` 실행

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| 기회 분석 보고서 없음 | 실패 보고 후 중단 |
| 핵심 메시지 미승인 | [확인 요청] 재출력 후 대기 |
| 차별화 포인트 3개 미만 | 재작성 1회 후 에스컬레이션 |
