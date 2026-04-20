---
name: project-kickoff
description: 구축 프로젝트 착수 문서(PM-01, PM-03)를 생성하는 스킬. 제안 파트 인계 문서를 입력받아 아데오 표준 WBS(PM-03)를 gen_wbs.py → Google Drive MCP로 생성하고, 사업수행계획서(PM-01)는 Figma MCP로 작성한다. 트리거: "킥오프", "WBS 작성", "project-kickoff", "사업수행계획서", "프로젝트 시작", PM-03 산출물 요청, PM 에이전트의 Step 7 진입 시 자동 참조.
---

# project-kickoff

## 개요

제안 파트 인계 문서 기반으로 아데오 표준 착수 문서 패키지(PM-01~03)를 생성한다.

**출력 형식 원칙**:
- **WBS (PM-03)**: Excel 금지 → **Google Sheets** (`scripts/generators/gen_wbs.py` 실행 → Google Drive MCP 업로드)
- **사업수행계획서 (PM-01)**: Figma 파일 (Figma MCP 사용)

반드시 `/templates/kickoff-template.md` 를 참조하여 내용을 구성한다.

---

## 실행 절차

### Step 1: 입력 확인

| 필수 입력 | 확인 방법 |
|---------|---------|
| 프로젝트명 | 사용자 입력 또는 인계 문서에서 추출 |
| 납기일 | 인계 문서 또는 사용자 입력 (YYYY-MM-DD) |
| 고객사명 | 인계 문서에서 추출 |
| 계약 금액 (선택) | 있으면 반영 |

납기일이 없으면 `.status outputs.rfp-context` Drive URL 내용에서 재확인. 없으면 "미정 — 착수 후 합의"로 처리하고 계속 진행 (중단 금지).

---

### Step 2: 마일스톤 일정 계산

납기일 기준 역산하여 6단계 시작/종료일 초안 계산.  
세부 일정 계산 규칙은 `references/kickoff-rules.md` 참조.

**일정 확인 분기**:
- **`outputs.rfp-context` URL 존재 시 (자동 실행 모드)**: 계산된 일정 그대로 WBS 작성 진행. 확인 요청 없음.
- **`outputs.rfp-context` URL 미존재 시 (수동 모드)**: 아래 [확인 요청] 출력 후 승인 대기.

**[확인 요청] 출력 형식**:
```
[확인 요청] WBS 납기일 및 마일스톤 확인
─────────────────────────────────────
프로젝트: {프로젝트명}  고객사: {고객사명}
최종 납기일: {YYYY-MM-DD}

단계별 일정 (안):
  PM (착수, 5%)   : {시작} ~ {종료}
  AY (분석, 10%)  : {시작} ~ {종료}
  DE (설계, 20%)  : {시작} ~ {종료}
  IM (구현, 45%)  : {시작} ~ {종료}
  TE (테스트, 10%): {시작} ~ {종료}
  OP (오픈, 10%)  : {시작} ~ {종료}

위 일정으로 진행하겠습니다. 수정이 필요하면 알려주세요.
승인 시 "확인" 또는 수정 내용을 입력해주세요.
─────────────────────────────────────
```

---

### Step 3: WBS Google Sheets 생성 (PM-03)

승인된 일정 기준으로 프로젝트 데이터를 JSON으로 구성하고 `scripts/generators/gen_wbs.py`로 `.xlsx`를 생성한 뒤 Google Drive MCP로 업로드한다.

시트 구조 및 스타일 규칙: `templates/kickoff-template.md` **Google Sheets 구조 및 스타일** 섹션 참조.

**실행 순서**:
1. 마일스톤·산출물·리스크 데이터를 JSON 스키마(`kickoff-template.md` 참조)에 맞게 구성
2. `scripts/generators/gen_wbs.py` 실행 → `WBS_{프로젝트명}_{YYYYMMDD}.xlsx` 생성
3. Google Drive MCP(`mcp__claude_ai_Google_Drive__create_file`)로 업로드
4. 반환된 URL을 `.status/구축 파트/{프로젝트명}/.status`의 `outputs.wbs`에 기록

---

### Step 4: 사업수행계획서 작성 (PM-01)

Figma MCP(`mcp__claude_ai_Figma__create_new_file`)로 Figma 파일로 작성한다.

| 항목 | 내용 |
|------|------|
| 프로젝트 개요 | 목적, 배경, 범위 |
| 프로젝트 조직 | PM, 팀별 담당자 |
| 마일스톤 요약 | 6단계 일정 요약 |
| 산출물 계획 | 문서 코드별 생성 계획 |
| 승인 요청 | 이사님 착수 승인 항목 |

생성된 Figma URL을 `.status/구축 파트/{프로젝트명}/.status`의 `outputs.kickoff`에 기록.

---

### Step 5: 인력계획서 작성 (PM-02)

Figma MCP(`mcp__claude_ai_Figma__use_figma`)로 사업수행계획서 Figma 파일에 추가 페이지로 작성한다.

| 항목 | 내용 |
|------|------|
| 팀 구성 | PM / 웹기획 / 디자인 / 개발팀 |
| 단계별 투입 인원 | 각 팀의 단계별 투입 인력 수 |
| 역할 정의 | 팀별 담당 역할 및 책임 |

---

### Step 6: 출력 및 검증

**출력 파일 목록**:

| 산출물 | 형식 | 저장 위치 |
|--------|------|---------|
| PM-03 WBS | Google Sheets (Google Drive) | `.status outputs.wbs` Drive URL |
| PM-01 사업수행계획서 | Figma (Figma MCP) | `.status outputs.kickoff` Figma URL |

**성공 기준**:
- WBS: PM/AY/DE/IM/TE/OP 6단계 데이터 + 4개 시트 구성 + 납기일 반영 + Google Drive 파일 URL 존재
- 사업수행계획서: Figma에 프로젝트 개요 + 조직 + 마일스톤 + 산출물 계획 섹션 존재

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| 납기일 없음 | [확인 요청] 출력 후 중단 |
| 일정 역산 불가 (납기 너무 촉박) | 최소 일정 경고 후 사람 판단 요청 |
| gen_wbs.py 실행 오류 또는 Drive 업로드 실패 | 재시도 1회 → 초과 시 에스컬레이션 |
