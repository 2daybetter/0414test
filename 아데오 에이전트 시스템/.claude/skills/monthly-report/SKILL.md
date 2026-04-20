---
name: monthly-report
description: 비서실 월간보고서를 생성하는 스킬. 업무이력DB Google Sheet에서 이전 달 전체 파트별 업무 실적·커뮤니케이션 이력을 집계하여 월간보고 Google Sheet에 새 탭을 추가한다. 트리거: "월간보고", "monthly-report", "월간 보고서", 매월 1일 자동 실행.
---

# monthly-report

## 개요

업무이력DB Google Sheet를 소스로 하여 **이전 달** 비서실 월간보고서를 생성한다.  
**출력**: 월간보고 Google Sheet에 `YYYY-MM 월간` 탭 신규 추가.  
세부 규칙은 `references/monthly-report-rules.md` 참조.

---

## 사전 요구사항

| 항목 | 설명 |
|------|------|
| 업무이력DB Sheet ID | `.status/report-config.yaml`의 `db_sheet_id` |
| 월간보고 Sheet ID | `.status/report-config.yaml`의 `monthly_sheet_id` |
| gspread 인증 | `scripts/credentials/service-account.json` |

`.status/report-config.yaml`가 없으면 **Step 0** 실행 (weekly-report Step 0과 동일).

---

## 실행 절차

### Step 0: 초기 설정 (최초 1회)

`report-config.yaml`가 없을 때만 실행 — weekly-report Step 0과 동일.  
`monthly_sheet_id`가 없으면 Google Drive MCP로 "아데오 월간보고" 신규 생성.

### Step 1: 보고 기간 산정

```
실행일    = 오늘 (매월 1일 자동 실행)
보고 대상 = 직전 달 (실행일이 2026-05-01이면 2026년 4월)
집계 기간 = {YYYY}-{MM}-01 ~ {YYYY}-{MM}-말일
```

탭 이름: `{YYYY-MM} 월간` (직전 달 기준)

### Step 2: 업무이력DB 집계

`scripts/generators/gen_monthly_report.py` 실행:

```bash
python -X utf8 scripts/generators/gen_monthly_report.py \
  --mode read \
  --month {YYYY-MM}
```

수집 항목:

| 집계 항목 | 기준 |
|---------|------|
| 파트별 완료 업무 수 | `상태=완료` AND `완료예정일 ∈ 집계월` |
| 파트별 진행 중 업무 수 | `상태=진행중` |
| 신규 착수 업무 수 | `시작일 ∈ 집계월` |
| 지연 발생 건수 | `완료예정일 < 집계월말일` AND `상태≠완료` |
| 커뮤니케이션 이력 | `커뮤니케이션이력` 내 집계월 발생 전체 |
| 구축파트 프로젝트 현황 | 프로젝트별 단계·진행률 |
| 제안파트 활동 현황 | 제안 건수·수주 여부 |

### Step 3: KPI 산출

| KPI | 계산 방법 | 목표 |
|-----|---------|------|
| 월간 완료 업무 수 | 완료 행 수 | — |
| 업무 완료율 | 완료 수 / (완료+진행+보류) × 100 | 70% 이상 |
| 지연 발생률 | 지연 건수 / 전체 업무 수 × 100 | 10% 이하 |
| 커뮤니케이션 건수 | 이력 항목 수 (파트별) | — |

### Step 4: 월간보고 탭 생성

`scripts/generators/gen_monthly_report.py`로 월간보고 Sheet에 새 탭 추가:

```bash
python -X utf8 scripts/generators/gen_monthly_report.py \
  --mode write \
  --month {YYYY-MM} \
  --data {JSON_PAYLOAD}
```

탭 구성 (KRDS 스타일 적용):

| 섹션 | 내용 |
|------|------|
| 헤더 | 보고 월, 작성일, 작성자, 보고 대상 |
| 1. 이달의 핵심 요약 | 전 파트 주요 성과 3~5줄 |
| 2. KPI 달성 현황 | KPI × 목표 × 실적 × 달성률 × 상태 |
| 3. 파트별 업무 실적 | 파트별 완료/진행/신규 건수 + 주요 업무 목록 |
| 4. 커뮤니케이션 이력 요약 | 파트별 주요 커뮤니케이션 (월별 집계) |
| 5. 구축파트 프로젝트 현황 | 프로젝트 × 단계 × 진행률 × 납기 × 상태 |
| 6. 제안파트 활동 현황 | 제안 건수 × 수주 여부 × 수주 금액 |
| 7. 이슈 및 리스크 | 지연 발생 항목 + 조치 내용 |
| 8. 다음 달 계획 | 파트별 예정 업무 + 핵심 목표 |
| 9. 건의/요청 사항 | 비고 컬럼의 이슈·요청 내용 |

**스타일 규칙** (KRDS):
- 헤더 행: 배경 `#29292A`, 폰트 `#FFFFFF`, Bold, 가운데 정렬
- 섹션 구분 행: 배경 `#256EF4`, 폰트 `#FFFFFF`, Bold
- 데이터 행: 배경 없음
- KPI 달성 기준: ✅ 100% 이상 / ⚠️ 80~99% / ❌ 80% 미만

### Step 5: 완료 확인

```
✅ 월간보고 탭 "{YYYY-MM} 월간" 추가 완료
📎 시트 URL: {monthly_sheet_url}
📊 집계: 완료 N건 / 진행중 N건 / 지연 N건 / 완료율 N%
```

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| report-config.yaml 없음 | Step 0 실행 후 재시도 |
| 업무이력DB 읽기 실패 | 수동 입력 요청 후 진행 |
| 동일 월 탭 이미 존재 | 탭명 `{월} 월간(수정)` 으로 추가 |
| 집계 대상 0건 | "집계 대상 업무 없음" 월간보고 생성 후 완료 |

---

## 자동 실행 설정

매월 1일 자동 실행을 원하면 Google Apps Script 트리거 설정.  
트리거 스크립트: `scripts/triggers/monthly-trigger.gs` (별도 생성 필요)

또는 Claude Code의 `/schedule` 스킬로 월초 cron 등록.
