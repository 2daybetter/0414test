---
name: ia-generator
description: 웹사이트 IA(정보구조) 설계 문서를 생성하는 스킬. 요구사항정의서를 입력받아 FO(Front Office)와 BO(Back Office)를 분리한 아데오 표준 IA 설계서(DE-02)를 작성한다. IA_ID(FO-N-NN / BO-N-NN) 체계, 화면ID(FO_XY_NNN) 체계, 1~3depth 메뉴 계층, Type 분류, URL 설계, SEO 메타 정보, 화면 수 집계표를 포함하며 Google Sheets로 출력한다. 트리거: "IA 설계", "정보구조 작성", "ia-generator", "IA 만들어", "사이트 구조 설계", DE-02 산출물 요청, 웹기획팀 에이전트의 Step 9 진입 시 자동 참조.
---

# ia-generator

## 개요

요구사항정의서 기반으로 아데오 표준 IA 설계서(DE-02)를 생성한다.  
반드시 `/templates/ia-template.md` 와 `references/ia-rules.md` 를 참조하여 작성한다.

**출력 형식 원칙**:
- **IA 설계서 (DE-02)**: Excel/마크다운 금지 → **Google Sheets** (`scripts/generators/gen_ia.py` 실행 → Google Drive MCP 업로드)
- **화면 목록 인덱스**: 마크다운 (wireframe-spec이 참조하는 화면ID 매핑표)

---

## 실행 절차

### Step 1: 입력 확인

다음 항목이 모두 있는지 확인한다. 없으면 중단 후 누락 항목 명시.

| 필수 입력 | 확인 방법 |
|---------|---------|
| 요구사항정의서 Drive URL | Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status 파일의 `outputs.requirements` → `mcp__claude_ai_Google_Drive__read_file_content`로 읽기 |
| 프로젝트명 | 파일명에서 추출 |
| IA 템플릿 | `/templates/ia-template.md` 존재 여부 |

### Step 2: 템플릿 및 규칙 로드

`/templates/ia-template.md` 와 `references/ia-rules.md` 를 읽어 구조 및 화면ID 규칙을 확인한다.

### Step 3: FO IA 설계

1. 요구사항정의서의 기능 목록 분석
2. 1depth 메뉴 후보 도출 (최소 4개)
3. **[확인 요청]** — 웹기획팀 에이전트가 1depth 구조를 사용자에게 제시하고 승인 대기
4. 승인 후 2depth ~ 3depth 세부 화면 구조 작성
5. 각 화면에 IA_ID 부여: `FO-{1depth번호}-{순번}` (예: FO-1-01)
6. **화면ID 부여**: `FO_{XY}_{NNN}` 형식 — 규칙은 `references/ia-rules.md` 화면 ID 체계 참조
   - X = 1depth 메뉴 영문 대문자 약어 1자 (HOME→H, COMPANY→C)
   - Y = 2depth 메뉴 영문 대문자 약어 1자. 2depth 없으면 `0`
   - NNN = 동일 XY 내 001부터 순차 (팝업·레이어도 포함하여 순번 증가)
   - **충돌 검사**: 전체 XY 목록을 나열하여 중복 없음을 확인 후 부여
7. Type 분류: Page / Layer Popup / Popup
8. Page 타입 전체에 URL 설계 (`/경로/하위경로` 형식, kebab-case)
9. SEO 메타 정의 (Title 30자 이내 / Description 80자 이내 / Keyword 5개 이내)
10. DB 연동 여부 표시 (Y/N)

### Step 4: BO IA 설계

1. FO 기능 목록 기반 관리 기능 도출
2. BO 1depth 메뉴 구성 (최소 2개 — 콘텐츠관리, 회원관리 등)
3. 각 화면에 IA_ID 부여: `BO-{1depth번호}-{순번}` (예: BO-1-01)
4. **화면ID 부여**: `BO_{XY}_{NNN}` 형식 — FO와 동일한 약어 규칙 적용
   - BO 전체에서 XY 중복 없음을 별도 확인 (FO와는 독립적)
5. Type 분류 (Page / Layer Popup / Popup)
6. URL 설계 (`/admin/경로` 형식)
7. SEO 미적용 (BO는 SEO 불필요)

### Step 5: 화면 수 집계표 생성

```
| 구분 | Page | Layer Popup | Popup | 합계 |
|------|------|-------------|-------|------|
| FO   |      |             |       |      |
| BO   |      |             |       |      |
| 합계 |      |             |       |      |
```

### Step 6: Google Sheets 생성 (DE-02)

설계된 FO/BO IA 전체 데이터를 JSON으로 구성하고 `scripts/generators/gen_ia.py`로 `.xlsx`를 생성한 뒤 Google Drive MCP로 업로드한다.

시트 구조 및 스타일 규칙: `templates/ia-template.md` **Google Sheets 구조 및 스타일** 섹션 참조.

**실행 순서**:
1. FO/BO IA 설계 데이터를 JSON 스키마(`ia-template.md` 참조)에 맞게 구성
2. `scripts/generators/gen_ia.py` 실행 → `IA_{프로젝트명}_{YYYYMMDD}.xlsx` 생성
3. Google Drive MCP(`mcp__claude_ai_Google_Drive__create_file`)로 업로드
4. 반환된 URL을 Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status 파일의 `outputs.ia`에 기록

### Step 7: 검증

- **성공 기준**: FO 1depth 4개 이상 + XY 전체 중복 없음 + Page 타입 전체 URL 존재 + 집계표 정확 + Google Drive `.status` 파일의 `outputs.ia`에 Drive URL 기록 완료

---

## 출력 파일 목록

| 산출물 | 형식 | 저장 위치 |
|--------|------|---------|
| DE-02 IA 설계서 | Google Sheets (Google Drive) | Google Drive `.status` 파일의 `outputs.ia` Drive URL |

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| 요구사항정의서 없음 | 실패 리포트 생성 후 중단 |
| 1depth 4개 미만 도출 | 재시도 1회 후 에스컬레이션 |
| XY 충돌 발생 | 충돌 메뉴 목록 명시 후 약어 재조정 |
| gen_ia.py 실행 오류 또는 Drive 업로드 실패 | 재시도 1회 후 에스컬레이션 |
