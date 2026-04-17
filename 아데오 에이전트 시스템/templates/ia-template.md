# IA 설계서 표준 양식

> 문서코드: DE-02  
> 버전: v1.0  
> 작성일: YYYY-MM-DD  
> 작성자: [작성자명]

---

## 표지

| 항목 | 내용 |
|------|------|
| 고객사명 | |
| 프로젝트명 | |
| 프로젝트 코드 | SKB-YYYY-NNN |
| 문서 버전 | v1.0 |
| 작성일 | YYYY-MM-DD |
| 작성자 | |
| 검토자 | |
| 승인자 | |

---

## 개정 이력

| 버전 | 일자 | 작성자 | 변경 내용 | 비고 |
|------|------|--------|-----------|------|
| v1.0 | YYYY-MM-DD | | 최초 작성 | |

---

## 1. IA 설계 기준

> **출력 형식**: IA 설계서는 Google Apps Script를 통해 **Google Sheets**로 생성한다.  
> 로컬 `.gs` 스크립트를 Google Drive → Apps Script에서 실행하면 스프레드시트가 자동 생성된다.

### 1.1 화면 ID 체계

| 구분 | 형식 | 예시 | 설명 |
|------|------|------|------|
| FO (Front Office) | FO_XY_NNN | FO_HV_001 | X=1depth약어, Y=2depth약어(없으면 0) |
| BO (Back Office) | BO_XY_NNN | BO_D0_001 | 동일 규칙 적용 |

**화면 ID 생성 규칙**

| 구성 | 자리수 | 규칙 |
|------|--------|------|
| 시스템 구분 | — | FO 또는 BO |
| X (1depth 약어) | 1자리 대문자 | 1depth 메뉴명의 대표 영문 대문자 1자 (HOME→H, COMPANY→C, MY→M) |
| Y (2depth 약어) | 1자리 대문자 | 2depth 메뉴명의 대표 영문 대문자 1자. 2depth 없으면 `0` |
| NNN (화면 순번) | 3자리 | 동일 XY 내에서 001부터 순차 부여 (팝업·레이어 포함) |

> **유일성 규칙**: XY 2자리 조합은 FO 전체, BO 전체에서 각각 중복되지 않아야 한다.  
> 동일 약어 충돌 시 다음 연관 영문자로 대체한다 (예: H 충돌 → HI, HE 등).

**약어 예시**

| 메뉴명 | 약어 | 메뉴명 | 약어 |
|--------|------|--------|------|
| 홈 / Home | H | Vision / 비전 | V |
| Company / 회사소개 | C | History / 연혁 | I |
| My / 마이페이지 | M | News / 뉴스 | N |
| Service / 서비스 | S | Support / 고객지원 | U |
| Dashboard / 대시보드 | D | Member / 회원관리 | E |
| Board / 게시판 | B | System / 시스템관리 | Y |

**예시**

| 1depth | 2depth | XY | 화면 | 화면ID |
|--------|--------|----|------|--------|
| 홈(Home→H) | 없음 | H0 | 메인 페이지 | FO_H0_001 |
| 회사소개(Company→C) | 비전(Vision→V) | CV | 비전 페이지 | FO_CV_001 |
| 회사소개(Company→C) | 연혁(History→I) | CI | 연혁 페이지 | FO_CI_001 |
| 회사소개(Company→C) | 연혁(History→I) | CI | 연혁 상세 팝업 | FO_CI_002 |
| 뉴스(News→N) | 공지사항(Notice→O) | NO | 공지 목록 | FO_NO_001 |

### 1.2 IA ID 체계

| 구분 | 형식 | 예시 |
|------|------|------|
| FO | FO-N-NN | FO-1-01 |
| BO | BO-N-NN | BO-1-01 |

### 1.3 화면 타입 정의

| Type | 설명 |
|------|------|
| Page | 독립 URL을 가진 일반 페이지 |
| Layer Popup | 페이지 위에 레이어 형태로 표시되는 팝업 |
| Popup | 별도 팝업 윈도우 |

---

## 2. FO (Front Office) IA

### 2.1 FO IA 구조

| IA_ID | 1depth | 1depth 약어 | 2depth | 2depth 약어 | XY | 3depth | Type | DB | 화면ID | 기능정의 | URL | Title | Description | Keyword |
|-------|--------|------------|--------|------------|-----|--------|------|----|--------|---------|-----|-------|-------------|---------|
| FO-1-01 | 홈 | H | | | H0 | | Page | N | FO_H0_001 | 메인 페이지 | / | [사이트명] | [사이트 설명] | [키워드] |
| FO-2-01 | [메뉴명] | C | [서브메뉴1] | V | CV | | Page | Y | FO_CV_001 | [기능 설명] | /path | [페이지 제목] | [설명] | [키워드] |
| FO-2-02 | [메뉴명] | C | [서브메뉴2] | I | CI | | Page | Y | FO_CI_001 | [기능 설명] | /path | [페이지 제목] | [설명] | [키워드] |
| FO-2-03 | [메뉴명] | C | [서브메뉴2] | I | CI | [3depth] | Layer Popup | N | FO_CI_002 | [기능 설명] | | | | |

> **작성 가이드:**
> - 1depth: 상단 GNB(Global Navigation Bar) 메뉴
> - 2depth: 서브 메뉴 (LNB 또는 탭)
> - 3depth: 팝업, 레이어, 서브 기능
> - DB: 데이터베이스 연동 여부 (Y/N)
> - SEO (Title/Description/Keyword): Page 타입에만 작성, Popup 류는 빈칸

---

## 3. BO (Back Office) IA

### 3.1 BO IA 구조

| IA_ID | 1depth | 1depth 약어 | 2depth | 2depth 약어 | XY | 3depth | Type | DB | 화면ID | 기능정의 | URL | 비고 |
|-------|--------|------------|--------|------------|-----|--------|------|----|--------|---------|-----|------|
| BO-1-01 | 대시보드 | D | | | D0 | | Page | Y | BO_D0_001 | 관리자 메인 대시보드 | /admin | |
| BO-2-01 | 회원관리 | E | 회원 목록 | L | EL | | Page | Y | BO_EL_001 | 회원 목록 조회/검색 | /admin/users | |
| BO-2-02 | 회원관리 | E | 회원 상세 | T | ET | | Page | Y | BO_ET_001 | 회원 상세 정보 조회/수정 | /admin/users/:id | |
| BO-2-03 | 회원관리 | E | 회원 목록 | L | EL | 탈퇴 확인 | Layer Popup | N | BO_EL_002 | 회원 탈퇴 처리 확인 팝업 | | |
| BO-3-01 | 콘텐츠관리 | B | [서브메뉴] | [약어] | B? | | Page | Y | BO_B?_001 | [기능 설명] | /admin/content | |
| BO-4-01 | 시스템관리 | Y | 공통 코드 | C | YC | | Page | Y | BO_YC_001 | 공통 코드 관리 | /admin/system/code | |
| BO-4-02 | 시스템관리 | Y | 메뉴 관리 | M | YM | | Page | Y | BO_YM_001 | 메뉴 구성 관리 | /admin/system/menu | |
| BO-4-03 | 시스템관리 | Y | 권한 관리 | A | YA | | Page | Y | BO_YA_001 | 관리자 권한 설정 | /admin/system/auth | |
| BO-4-04 | 시스템관리 | Y | 배너 관리 | N | YN | | Page | Y | BO_YN_001 | 배너 등록/수정/삭제 | /admin/system/banner | |
| BO-4-05 | 시스템관리 | Y | 팝업 관리 | P | YP | | Page | Y | BO_YP_001 | 팝업 등록/수정/삭제 | /admin/system/popup | |

> **BO 작성 가이드:**
> - BO는 SEO(Title/Description/Keyword) 필드 불필요 — 생략 또는 "-" 처리
> - 1depth: 관리자 사이드바 주요 메뉴
> - 시스템관리 메뉴는 반드시 포함 (공통코드/메뉴관리/권한관리/배너관리/팝업관리)

---

## 4. 전체 화면 수 집계

| 구분 | Page | Layer Popup | Popup | 합계 |
|------|------|-------------|-------|------|
| FO | 0 | 0 | 0 | 0 |
| BO | 0 | 0 | 0 | 0 |
| **합계** | **0** | **0** | **0** | **0** |

---

## 5. URL 설계 원칙

| 원칙 | 내용 |
|------|------|
| 소문자 사용 | 모든 URL은 소문자로 작성 |
| 단어 구분 | 하이픈(-) 사용 (언더스코어 금지) |
| 계층 구조 | 메뉴 계층을 URL에 반영 |
| RESTful | 목록: /resource, 상세: /resource/:id, 등록: /resource/new |
| 관리자 prefix | 모든 BO URL은 /admin으로 시작 |
