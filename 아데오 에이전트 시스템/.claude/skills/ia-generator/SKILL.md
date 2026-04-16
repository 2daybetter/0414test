---
name: ia-generator
description: 웹사이트 IA(정보구조) 설계 문서를 생성하는 스킬. 요구사항정의서를 입력받아 FO(Front Office)와 BO(Back Office)를 분리한 아데오 표준 IA 설계서(DE-02)를 작성한다. IA_ID(FO-N-NN / BO-N-NN) 체계, 1~3depth 메뉴 계층, Type 분류, URL 설계, SEO 메타 정보, 화면 수 집계표를 포함한다. 트리거: "IA 설계", "정보구조 작성", "ia-generator", "IA 만들어", "사이트 구조 설계", DE-02 산출물 요청, 웹기획팀 에이전트의 Step 9 진입 시 자동 참조.
---

# ia-generator

## 개요

요구사항정의서 기반으로 아데오 표준 IA 설계서(DE-02)를 생성한다.  
반드시 `/templates/ia-template.md` 를 참조하여 작성한다.

---

## 실행 절차

### Step 1: 입력 확인

다음 항목이 모두 있는지 확인한다. 없으면 중단 후 누락 항목 명시.

| 필수 입력 | 확인 방법 |
|---------|---------|
| 요구사항정의서 경로 | `/output/구축사/{프로젝트명}/웹기획팀/요구사항정의서-{프로젝트명}.md` 존재 여부 |
| 프로젝트명 | 파일명에서 추출 |
| IA 템플릿 | `/templates/ia-template.md` 존재 여부 |

### Step 2: 템플릿 로드

`/templates/ia-template.md` 를 읽어 출력 구조를 확인한다.  
세부 설계 규칙은 `references/ia-rules.md` 를 참조한다.

### Step 3: FO IA 설계

1. 요구사항정의서의 기능 목록 분석
2. 1depth 메뉴 후보 도출 (최소 4개)
3. **[확인 요청]** — 웹기획팀 에이전트가 1depth 구조를 사용자에게 제시하고 승인 대기
4. 승인 후 2depth ~ 3depth 세부 화면 구조 작성
5. 각 화면에 IA_ID 부여: `FO-{1depth번호}-{순번}` (예: FO-1-01)
6. Type 분류: Page / Layer Popup / Popup
7. Page 타입 전체에 URL 설계 (`/경로/하위경로` 형식, snake_case)
8. SEO 메타 정의 (Title 30자 이내 / Description 80자 이내 / Keyword 5개 이내)
9. DB 연동 여부 표시 (O/X)

### Step 4: BO IA 설계

1. FO 기능 목록 기반 관리 기능 도출
2. BO 1depth 메뉴 구성 (최소 2개 — 콘텐츠관리, 회원관리 등)
3. 각 화면에 IA_ID 부여: `BO-{1depth번호}-{순번}` (예: BO-1-01)
4. Type 분류 (Page / Layer Popup / Popup)
5. URL 설계 (`/admin/경로` 형식)
6. SEO 미적용 (BO는 SEO 불필요)

### Step 5: 화면 수 집계표 생성

```
| 구분 | Page | Layer Popup | Popup | 합계 |
|------|------|-------------|-------|------|
| FO   |      |             |       |      |
| BO   |      |             |       |      |
| 합계 |      |             |       |      |
```

### Step 6: 출력 및 검증

- **출력 경로**: `/output/구축사/{프로젝트명}/웹기획팀/ia-{프로젝트명}.md`
- **검증**: `scripts/validate-doc.py` 실행
- **성공 기준**: FO/BO 분리 + 1depth 4개 이상 + 집계표 + Page 타입 전체 URL 존재

---

## 출력 형식

`references/ia-output-format.md` 참조.

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| 요구사항정의서 없음 | 실패 리포트 생성 후 중단 |
| 1depth 4개 미만 도출 | 재시도 1회 후 에스컬레이션 |
| validate-doc.py 실패 | 자동 재시도 최대 2회 후 에스컬레이션 |
