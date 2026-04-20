# IA 설계서 표준 양식

> 문서코드: DE-02  
> 버전: v1.0  
> 작성일: YYYY-MM-DD  
> 작성자: [작성자명]  
> 디자인 시스템: `/templates/krds-design-system.md`

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

> **출력 형식**: IA 설계서는 `scripts/generators/gen_ia.py`로 `.xlsx`를 생성한 뒤 Google Drive MCP로 업로드하여 **Google Sheets**로 제공한다.

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

---

## 6. Google Sheets 구조 및 스타일

> `ia-generator` 스킬이 `scripts/generators/gen_ia.py`로 파일을 생성할 때 아래 규격을 적용한다.

### 시트 구성

| 시트명 | 내용 | 컬럼 |
|--------|------|------|
| `FO_IA` | FO 전체 화면 목록 | IA_ID / 1depth / 1depth약어 / 2depth / 2depth약어 / XY / 3depth / Type / DB / 화면ID / 기능정의 / URL / SEO Title / SEO Description / SEO Keyword |
| `BO_IA` | BO 전체 화면 목록 | IA_ID / 1depth / 1depth약어 / 2depth / 2depth약어 / XY / 3depth / Type / DB / 화면ID / 기능정의 / URL |
| `화면목록` | FO+BO 통합 화면ID 인덱스 | 시스템 / 화면ID / 화면명 / URL / Type / 기능정의 |
| `집계` | 화면 수 집계표 | 구분 / Page / Layer Popup / Popup / 합계 |

### 셀 스타일 규칙

| 행 구분 | 배경 컬러 | 폰트 컬러 | 굵기 | 정렬 |
|---------|---------|---------|------|------|
| 헤더 행 (1행) | `#29292A` | `#FFFFFF` | Bold | Center |
| 데이터 행 (2행~) | 없음 | 기본 | 기본 | 기본 |

> **내용 셀 배경 없음**: 데이터가 들어가는 모든 셀은 배경색을 지정하지 않는다.

### gen_ia.py JSON 입력 스키마

```json
{
  "project_name": "프로젝트명",
  "client_name": "고객사명",
  "version": "v1.0",
  "doc_date": "YYYY-MM-DD",
  "author": "작성자",
  "reviewer": "검토자",
  "fo_ia": [
    {
      "ia_id": "FO-1-01",
      "depth1": "홈",
      "depth1_abbr": "H",
      "depth2": "",
      "depth2_abbr": "0",
      "xy": "H0",
      "depth3": "",
      "type": "Page",
      "db": "N",
      "screen_id": "FO_H0_001",
      "function": "메인 페이지",
      "url": "/",
      "seo_title": "사이트명",
      "seo_desc": "사이트 설명",
      "seo_keyword": "키워드1, 키워드2"
    }
  ],
  "bo_ia": [
    {
      "ia_id": "BO-1-01",
      "depth1": "대시보드",
      "depth1_abbr": "D",
      "depth2": "",
      "depth2_abbr": "0",
      "xy": "D0",
      "depth3": "",
      "type": "Page",
      "db": "Y",
      "screen_id": "BO_D0_001",
      "function": "관리자 대시보드",
      "url": "/admin"
    }
  ],
  "summary": {
    "fo": { "page": 0, "layer_popup": 0, "popup": 0, "total": 0 },
    "bo": { "page": 0, "layer_popup": 0, "popup": 0, "total": 0 }
  }
}
