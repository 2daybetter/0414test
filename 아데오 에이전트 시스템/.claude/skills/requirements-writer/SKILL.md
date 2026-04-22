---
name: requirements-writer
description: RFP의 전체 요구사항(SFR~PMR 모든 카테고리)을 파싱하여 아데오 표준 요구사항정의서(AY-01)를 Google Sheet로 생성하는 스킬. 트리거: 구축 파트 Step 3에서 웹기획팀 L3 자동 실행, "requirements-writer", "요구사항정의서", "AY-01".
---

# requirements-writer

## 개요

rfp-context의 요구사항 섹션 전체(SFR·ECR·PER·SIR·DAR·SOR·TER·SER·COR·PSR·PMR)를 파싱하여  
아데오 표준 요구사항정의서(AY-01)를 Google Sheet로 생성한다.  
각 요구사항에 요구사항 ID, 카테고리, 우선순위, 수용여부, 대응 방안을 매핑한다.

**출력 형식 원칙**:
- **AY-01 요구사항정의서**: `scripts/gen_requirements.py` 실행 → Google Drive MCP 업로드
- 로컬 `.xlsx` 파일은 업로드 즉시 삭제

---

## 실행 절차

### Step 1: 입력 확인

| 필수 입력 | 확인 방법 |
|---------|---------|
| rfp-context Drive URL | `.status` 파일의 `outputs.rfp-context` |
| 프로젝트명 | `.status` 파일의 `lead` |

`.status` 파일 경로: Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status (루트 폴더 ID: 1XHWdKpQmsoyiScj-NicRrHuYzDZsyBDM)

### Step 2: rfp-context 읽기

`mcp__claude_ai_Google_Drive__read_file_content`로 rfp-context를 읽고 다음을 추출한다:

- 요구사항 전체 목록 (카테고리별 분류 포함)
- 각 요구사항의 원문 텍스트
- 필수/선택 여부 (기재된 경우)

### Step 3: 요구사항 파싱

추출한 요구사항을 다음 카테고리 기준으로 분류한다.

**더케이예다함 사업 기준 카테고리**:

| 코드 | 카테고리명 | 설명 |
|------|----------|------|
| SFR | 소프트웨어 기능 요구사항 | 시스템이 제공해야 할 기능 |
| ECR | 외부 인터페이스 요구사항 | 외부 시스템 연동 요건 |
| PER | 성능 요구사항 | 응답시간, 처리량, 가용성 |
| SIR | 시스템 인터페이스 요구사항 | 내부 시스템 연동 구조 |
| DAR | 데이터 요구사항 | 데이터 구조, 이관, 보존 |
| SOR | 지원 요구사항 | 운영·유지보수 지원 범위 |
| TER | 기술 요구사항 | 기술 스택, 표준, 인프라 |
| SER | 보안 요구사항 | 인증, 접근제어, 암호화 |
| COR | 제약 요구사항 | 법적·정책적 제약 조건 |
| PSR | 프로젝트 지원 요구사항 | 산출물, 교육, 협조 요건 |
| PMR | 프로젝트 관리 요구사항 | 일정, 인력, 보고 기준 |

**요구사항 ID 부여 규칙**: `{카테고리코드}-{순번(01부터)}` (예: SFR-01, SFR-02, ..., ECR-01)

### Step 4: 우선순위 및 수용여부 판단

각 요구사항에 대해 LLM이 자동으로 다음을 판단한다.

**우선순위 기준**:

| 우선순위 | 기준 |
|---------|------|
| 필수(Must) | "반드시", "필수", "의무", "준수", 평가 배점 직결 항목 |
| 권장(Should) | "권장", "가능한 한", 명시적 필수 표현 없음 |
| 선택(Could) | "가능하면", "검토", "향후" |

**수용여부 기준**:

| 수용여부 | 기준 |
|---------|------|
| 수용 | 아데오 표준 기술 스택(Spring Boot, React, 하이브리드 앱)으로 구현 가능 |
| 조건부 수용 | 추가 협의 또는 외부 API 연동 필요 |
| 확인필요 | 요구사항 원문이 불명확하거나 범위 미정 |

### Step 5: 대응 방안 작성

우선순위 "필수(Must)" 항목에 대해 구체적인 대응 방안을 1~2문장으로 작성한다.

- 기술 스택 기준: Spring Boot(OpenJDK 17+), React, 하이브리드 앱(iOS/Android), GIT, CI/CD
- 구현 방법, 관련 컴포넌트, 예상 산출물 코드 명시

### Step 6: Google Sheet 생성 (AY-01)

파싱된 전체 요구사항 데이터를 JSON으로 구성하고 `scripts/gen_requirements.py`를 실행하여 `.xlsx`를 생성한 뒤 Google Drive MCP로 업로드한다.

**Google Sheet 구조**:

| 열 | 헤더 | 내용 |
|----|------|------|
| A | 요구사항 ID | SFR-01, ECR-01, ... |
| B | 카테고리 | 소프트웨어 기능, 외부 인터페이스, ... |
| C | 요구사항명 | 요구사항 제목 (30자 이내) |
| D | 요구사항 원문 | RFP 원문 그대로 |
| E | 우선순위 | 필수 / 권장 / 선택 |
| F | 수용여부 | 수용 / 조건부 수용 / 확인필요 |
| G | 대응 방안 | 구현 방법 요약 |
| H | 관련 산출물 | DE-01~07, TE-01 등 |
| I | 비고 | 추가 협의 필요 사항 |

**헤더 행 스타일**: 배경 `#29292A`, 폰트 White, Bold, Center (CLAUDE.md Google Sheet 스타일 규칙 준수)

**실행 순서**:
1. 전체 요구사항을 JSON 배열로 구성
2. `scripts/gen_requirements.py` 실행 → `AY-01_{프로젝트명}_{YYYYMMDD}.xlsx` 생성
3. `mcp__claude_ai_Google_Drive__create_file`로 업로드
4. 반환된 URL을 `.status` 파일의 `outputs.requirements`에 기록
5. 로컬 `.xlsx` 파일 삭제

### Step 7: 검증

**성공 기준**:
- 전체 요구사항 수가 rfp-context 원문과 일치 (누락 없음)
- 모든 행에 요구사항 ID, 카테고리, 우선순위, 수용여부 기재 (빈 셀 없음)
- 우선순위 "필수" 항목 전체에 대응 방안 작성
- `.status` 파일의 `outputs.requirements`에 Drive URL 기록 완료

---

## 출력 파일 목록

| 산출물 | 형식 | 저장 위치 |
|--------|------|---------|
| AY-01 요구사항정의서 | Google Sheet (Google Drive) | `.status` 파일의 `outputs.requirements` Drive URL |

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| rfp-context Drive URL 없음 | rfp-analyzer 재실행 요청 후 중단 |
| 요구사항 섹션 미추출 | rfp-context 재파싱 1회 → 실패 시 에스컬레이션 |
| 요구사항 수 불일치 (±3개 이상) | 누락 항목 목록 출력 후 재시도 1회 |
| gen_requirements.py 실행 오류 | 재시도 1회 → 실패 시 에스컬레이션 |
| Drive 업로드 실패 | 재시도 1회 → 실패 시 에스컬레이션 |
