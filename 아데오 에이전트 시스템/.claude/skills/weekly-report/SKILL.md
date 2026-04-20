---
name: weekly-report
description: 비서실 주간업무 보고서를 생성하는 스킬. 업무이력DB Google Sheet에서 파트별 진행업무·커뮤니케이션 이력을 읽어 금주/차주 주간업무를 정리하고, 주간보고 Google Sheet에 새 탭을 추가한다. 트리거: "주간보고", "weekly-report", "주간 보고서", 매주 월요일 자동 실행.
---

# weekly-report

## 개요

업무이력DB Google Sheet를 소스로 하여 비서실 주간업무 보고서를 생성한다.  
**출력**: 주간보고 Google Sheet에 `YYYY-MM-DD 주간` 탭 신규 추가.  
세부 규칙은 `references/weekly-report-rules.md` 참조.

---

## 사전 요구사항

| 항목 | 설명 |
|------|------|
| 업무이력DB Sheet ID | `.status/report-config.yaml`의 `db_sheet_id` |
| 주간보고 Sheet ID | `.status/report-config.yaml`의 `weekly_sheet_id` |
| gspread 인증 | `scripts/credentials/service-account.json` (Google Service Account) |

`.status/report-config.yaml`가 없으면 **Step 0** 실행.

---

## 실행 절차

### Step 0: 초기 설정 (최초 1회)

`report-config.yaml`가 없을 때만 실행. 사용자에게 아래를 확인:

1. **업무이력DB Google Sheet URL** → `db_sheet_id` 추출
2. **주간보고 Google Sheet URL** → `weekly_sheet_id` 추출  
   (없으면 Google Drive MCP로 "아데오 주간보고" 신규 생성)
3. `.status/report-config.yaml` 저장

```yaml
# .status/report-config.yaml
db_sheet_id: "SHEET_ID_HERE"
weekly_sheet_id: "SHEET_ID_HERE"
monthly_sheet_id: "SHEET_ID_HERE"
```

### Step 1: 보고 기간 산정

```
보고 기준일 = 오늘 (월요일 자동 실행 시 당일)
금주 기간   = 보고 기준일(월) ~ +4일(금)
전주 기간   = 보고 기준일 -7일(월) ~ -3일(금)
```

탭 이름: `{YYYY-MM-DD} 주간` (보고 기준일 월요일 날짜)

### Step 2: 업무이력DB 읽기

`scripts/generators/gen_weekly_report.py`를 실행:

```bash
python -X utf8 scripts/generators/gen_weekly_report.py \
  --mode read \
  --date {YYYY-MM-DD}
```

스크립트가 없으면 Google Drive MCP로 업무이력DB 시트를 직접 읽는다:
- `mcp__claude_ai_Google_Drive__read_file_content` (db_sheet_id 사용)

수집 항목:

| 탭(파트) | 수집 컬럼 |
|---------|---------|
| 비서실 | 번호, 업무명, 담당자, 시작일, 완료예정일, 진행률, 상태, 주요내용, 커뮤니케이션이력 |
| 제안파트 | 동일 |
| 구축파트 | 동일 |
| 운영파트 | 동일 |
| 연구소 | 동일 |

### Step 3: 금주/차주 업무 분류

수집 데이터에서 아래 기준으로 분류:

| 구분 | 분류 기준 |
|------|---------|
| **금주 완료** | 상태=완료 AND 완료예정일 ∈ 전주~금주 |
| **금주 진행** | 상태=진행중 AND 시작일 ≤ 금주금요일 |
| **차주 예정** | 상태=예정 OR 완료예정일 ∈ 차주 |
| **지연/이슈** | 진행률 < 50% AND 완료예정일 < 오늘 |

파트별 커뮤니케이션 이력 중 **이번 주 발생** 항목도 별도 수집.

### Step 4: 주간보고 탭 생성

`scripts/generators/gen_weekly_report.py`로 주간보고 Sheet에 새 탭 추가:

```bash
python -X utf8 scripts/generators/gen_weekly_report.py \
  --mode write \
  --date {YYYY-MM-DD} \
  --data {JSON_PAYLOAD}
```

탭 구성 (KRDS 스타일 적용):

| 섹션 | 내용 |
|------|------|
| 헤더 | 보고 기간, 작성일, 작성자 |
| 1. 파트별 금주 진행현황 | 파트 × 업무명 × 담당자 × 진행률 × 상태 |
| 2. 금주 완료 업무 | 완료 항목 목록 |
| 3. 차주 예정 업무 | 예정 항목 목록 |
| 4. 커뮤니케이션 이력 | 파트별 주요 커뮤니케이션 이번 주 발생분 |
| 5. 지연/이슈 항목 | 지연 기준 초과 항목 + 대응 방안 |
| 6. 비고 | 기타 공유 사항 |

**스타일 규칙** (KRDS):
- 헤더 행: 배경 `#29292A`, 폰트 `#FFFFFF`, Bold, 가운데 정렬
- 섹션 구분 행: 배경 `#256EF4`, 폰트 `#FFFFFF`, Bold
- 데이터 행: 배경 없음

### Step 5: 완료 확인

```
✅ 주간보고 탭 "{YYYY-MM-DD} 주간" 추가 완료
📎 시트 URL: {weekly_sheet_url}
📋 집계: 금주 진행 N건 / 완료 N건 / 차주 예정 N건 / 이슈 N건
```

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| report-config.yaml 없음 | Step 0 실행 후 재시도 |
| 업무이력DB 읽기 실패 | 수동 입력 요청 후 진행 |
| 동일 날짜 탭 이미 존재 | 탭명 `{날짜} 주간(수정)` 으로 추가 |
| gspread 인증 오류 | `scripts/credentials/service-account.json` 확인 안내 |

---

## 자동 실행 설정

매주 월요일 자동 실행을 원하면 Google Apps Script 트리거를 설정한다.  
트리거 스크립트: `scripts/triggers/weekly-trigger.gs` (별도 생성 필요)

또는 Claude Code의 `/schedule` 스킬로 월요일 cron 등록.
