# KPI 집계 규칙

## KPI 지표 정의

### 구축 파트 KPI

| 지표명 | 정의 | 목표값 | 경고 기준 |
|--------|------|--------|---------|
| 활성 프로젝트 수 | Google Drive 아데오 프로젝트 폴더 하위 프로젝트 폴더 수 (`mcp__claude_ai_Google_Drive__search_files`) | — | 5개 초과 시 리소스 검토 |
| 주간 산출물 생성 수 | 해당 주 `.status outputs:` 섹션에 신규 추가된 Drive/Figma URL 수 | 3개/주 이상 | 0개면 진행 지연 경고 |
| 단계 체류 기간 | `.status` `locked_at` 기준 경과일 | PM~AY: 7일 이내 | 14일 초과 시 지연 경고 |
| 검증 통과율 | validate-doc.py PASS 수 / 전체 산출물 수 | 90% 이상 | 70% 미만 시 품질 경고 |

### 제안 파트 KPI

| 지표명 | 정의 | 목표값 | 경고 기준 |
|--------|------|--------|---------|
| 활성 기회 수 | Google Drive 아데오 프로젝트 폴더 하위 기회 폴더 수 | — | — |
| 제안서 완성 수 | 각 기회의 Google Drive `.status/.status` 파일의 `outputs.proposal` URL 존재 건수 | — | — |
| 정책자금 매칭 수 | 각 기회의 Google Drive `.status/.status` 파일의 `outputs.policy-fund` URL 존재 건수 | — | — |
| 기회 → 제안 전환율 | 제안서 완성 수 / 활성 기회 수 × 100 | 70% 이상 | 50% 미만 시 전략 재검토 |

---

## 집계 기간 정의

| 보고서 유형 | 집계 기간 | 비교 기간 |
|-----------|---------|---------|
| 주간 (PM-WR) | 보고일 기준 직전 7일 (월~일) | 전주 동기간 |
| 월간 (PM-MR) | 보고일 속한 달의 1일~말일 | 전월 동기간 |

---

## .status 파일 파싱 규칙

`.status` 파일 형식:
```
project: {프로젝트명}
current_step: Step {N}
locked_by: {팀명}
locked_at: YYYY-MM-DDTHH:MM:SS
last_output: {파일명 또는 없음}
```

| 필드 | 집계 활용 |
|------|---------|
| `current_step` | 단계별 분포 집계 |
| `locked_at` | 체류 기간 산출 (오늘 날짜 - locked_at) |
| `locked_by` | 팀별 병목 식별 |

---

## 지연 기준 정의

| 단계 | 정상 처리 기간 | 지연 기준 |
|------|-------------|---------|
| PM (착수) | 3~5 영업일 | 7일 초과 |
| AY (분석) | 5~7 영업일 | 14일 초과 |
| DE (설계) | 10~15 영업일 | 21일 초과 |
| IM (구현) | 20~30 영업일 | 45일 초과 |
| TE (테스트) | 5~7 영업일 | 14일 초과 |
| OP (오픈) | 3~5 영업일 | 7일 초과 |

---

## 보고서 서술 가이드

### 수치 해석 원칙

- 관측된 수치만 언급. 추정·예측은 "예상됩니다" 등 추정 표현 사용 필수.
- 지연 경고 기준 초과 항목은 별도 섹션으로 분리 표시.
- 0건 항목은 "활동 없음"으로 기술 (생략 금지).

### 서술 구조 (주간)

1. **이번 주 요약** (2~3문장): 총 산출물 수 + 주요 완료 항목
2. **KPI 현황 테이블**: 지표별 수치
3. **지연/이슈 항목**: 경고 기준 초과 항목 목록
4. **다음 주 계획**: 예정 단계 + 담당 팀

### 서술 구조 (월간)

1. **이달 성과 요약** (3~5문장): 주요 완료 프로젝트 + 제안 활동
2. **KPI 달성률 테이블**: 목표 대비 실적
3. **주요 이슈 및 해결**: 이달 발생 지연/에스컬레이션 내역
4. **다음 달 계획**: 예정 프로젝트 + 중점 활동

---

## 집계 스크립트 없을 때 수동 집계 체크리스트

```
[ ] Google Drive 아데오 프로젝트 폴더 하위 프로젝트 폴더 수 확인 (mcp__claude_ai_Google_Drive__search_files, 루트 폴더 ID: 1XHWdKpQmsoyiScj-NicRrHuYzDZsyBDM)
[ ] 각 프로젝트의 Google Drive .status/.status 파일에서 outputs: 섹션 URL 존재 항목 수 확인
[ ] 각 프로젝트의 Google Drive .status/.status 파일에서 current_step 목록 추출
[ ] Google Drive 아데오 프로젝트 폴더 하위 기회 폴더 수 확인
[ ] 각 기회의 Google Drive .status/.status 파일에서 outputs.proposal URL 존재 건수 확인
[ ] 각 기회의 Google Drive .status/.status 파일에서 outputs.policy-fund URL 존재 건수 확인
```
