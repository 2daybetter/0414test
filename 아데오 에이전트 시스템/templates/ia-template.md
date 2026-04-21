# IA 설계서 표준 양식

> 문서코드: DE-03  
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
> FO와 BO는 **별도 탭**으로 분리한다 (`IA_FO` 탭 / `IA_BO` 탭).

### 1.1 IA_ID 체계

| 구분 | 형식 | 예시 | 설명 |
|------|------|------|------|
| FO | IF{NNN} | IF001, IF002 | 001부터 전체 순번 순차 부여 (팝업 포함) |
| BO | IB{NNN} | IB001, IB002 | 001부터 전체 순번 순차 부여 (팝업 포함) |

### 1.2 Depth ID 체계

**1depth ID** — 영문 대문자 1자, 메뉴별 고유 지정

| 메뉴명 | ID | 메뉴명 | ID |
|--------|----|--------|----|
| 메인 (Main) | M | 로그인 (Login) | L |
| 고객지원 (Notice/support) | N | 마이페이지 (myPage) | P |
| 회원가입 (Join) | J | 공통 (eXtra/common) | Z |
| 대시보드 (Dashboard) | D | 사용자관리 (User) | U |
| 게시판관리 (Board) | B | 운영관리 (Handling) | H |
| 시스템관리 (System) | S | 회사소개 (Company) | C |
| 서비스 (serVice) | V | 제품 (pRoduct) | R |
| 채용 (recRuit) | T | 뉴스레터 (newsLetter) | K |

- FO 전체 / BO 전체에서 각각 1depth ID 중복 불가
- 한글 메뉴는 영문 의미 치환 후 첫 글자 사용. 충돌 시 두 번째 연관 영문자 사용

**2depth ID** — 동일 1depth 내 순서대로 A, B, C, D... 순차 부여

**3depth ID** — 동일 2depth 내 1, 2, 3... 순차 숫자 부여 (팝업·레이어 포함)

### 1.3 화면 ID 체계

**FO 화면 ID**

```
PC_{1depth_ID}{2depth_ID}_{NNN}[_L|_P]
```

| 구성 | 설명 |
|------|------|
| `PC` | 디바이스 구분 (PC 기준. 모바일은 MO) |
| `{1depth_ID}{2depth_ID}` | 1depth ID + 2depth ID 2자리 조합 |
| `_{NNN}` | 해당 조합 내 화면 순번 (001부터) |
| `_L` | Layer Popup 접미사 |
| `_P` | Popup 접미사 |

**BO 화면 ID**

```
BO_{1depth_ID}{2depth_ID}_{NNN}[_L|_P]
```

| 구성 | 설명 |
|------|------|
| `BO` | Back Office 고정값 |
| `{1depth_ID}{2depth_ID}` | 1depth ID + 2depth ID 2자리 조합 |
| `_{NNN}` | 해당 조합 내 화면 순번 (001부터) |
| `_L` | Layer Popup 접미사 |
| `_P` | Popup 접미사 |

### 1.4 화면 타입 정의

| Type | 정의 | URL | FO SEO | 화면ID 접미사 |
|------|------|-----|--------|--------------|
| Page | 독립 URL을 가진 전체 화면 | 필수 | ✅ | 없음 |
| Layer Popup | 현재 화면 위 레이어 표시 | 공란 | ❌ | `_L` |
| Popup | 별도 팝업 창 | 공란 | ❌ | `_P` |

### 1.5 DB 컬럼 값

| 값 | 의미 |
|----|------|
| `DB` | 데이터베이스 연동 화면 (동적 렌더링) |
| `Html` | 정적 HTML (Error 페이지, 약관, 메일 템플릿 등) |

---

## 2. FO (Front Office) IA

> 시트명: `IA_FO` | 제목 행: `프로젝트명 IA (F/O)`

### FO 컬럼 구조

| 컬럼 | 설명 |
|------|------|
| IA_ID | IF001부터 순차 |
| 1depth | 1단계 메뉴명 (그룹 첫 행만 입력) |
| ID | 1depth 영문 대문자 ID |
| 2depth | 2단계 메뉴명 (그룹 첫 행만 입력) |
| ID | 2depth 영문 대문자 ID (A, B, C...) |
| 3depth | 3단계 화면·기능명 |
| ID | 3depth 숫자 순번 |
| Type | Page / Layer Popup / Popup |
| DB | DB / Html |
| 화면 ID | `PC_{1ID}{2ID}_{NNN}[_L\|_P]` |
| To Be URL | 화면 URL (`.do` 금지, Popup류 공란) |
| Title | SEO 제목 (Page만, 30자 이내) |
| Description | SEO 설명 (Page만, 80자 이내) |
| Keyword | SEO 키워드 (Page만, 쉼표 구분, 5개 이내) |

### FO IA 예시 데이터

| IA_ID | 1depth | ID | 2depth | ID | 3depth | ID | Type | DB | 화면 ID | To Be URL | Title | Description | Keyword |
|-------|--------|----|--------|----|--------|----|------|-----|---------|-----------|-------|-------------|---------|
| IF001 | 메인 | M | | | | 1 | Page | DB | PC_MA_001 | / | 사이트명 | 사이트 주요 소개 문구 | 키워드1,키워드2 |
| IF002 | | M | 공지 팝업 | B | | 1 | Layer Popup | DB | PC_MB_001_L | | | | |
| IF003 | 고객지원 | N | 공지사항 | A | 목록 | 1 | Page | DB | PC_NA_001 | /cs/notice | 공지사항 | 공지사항 목록을 확인하세요 | 공지사항 |
| IF004 | | N | | A | 상세 | 2 | Page | DB | PC_NA_002 | /cs/notice/{id} | 공지사항 상세 | 공지사항 상세 내용을 확인하세요 | 공지사항 |
| IF005 | | N | FAQ | B | 목록 | 1 | Page | DB | PC_NB_001 | /cs/faq | FAQ | 자주 묻는 질문을 확인하세요 | FAQ |
| IF006 | | N | 1:1문의 | C | 이용 안내 | 1 | Layer Popup | DB | PC_NC_001_L | | | | |
| IF007 | | N | | C | 등록 | 2 | Page | DB | PC_NC_002 | /cs/inquiry-write | 1:1문의 등록 | | |
| IF008 | 회원가입 | J | 약관동의 | A | | 1 | Page | DB | PC_JA_001 | /join/terms | | | |
| IF009 | | J | | A | 이용약관 동의 | - | Layer Popup | DB | PC_JA_00-_L | | | | |
| IF010 | | J | | A | 본인 인증 | - | Popup | DB | PC_JA_00-_P | | | | |
| IF011 | | J | 정보입력 | B | | 1 | Page | DB | PC_JB_001 | /join/info | | | |
| IF012 | | J | | B | 주소 검색 | 2 | Popup | DB | PC_JB_002_P | | | | |
| IF013 | | J | 가입완료 | C | | 1 | Page | DB | PC_JC_001 | /join/complete | | | |
| IF014 | 로그인 | L | 로그인 | A | | 1 | Page | DB | PC_LA_001 | /login | 로그인 | | |
| IF015 | | L | 이메일찾기 | B | | 1 | Page | DB | PC_LB_001 | /find-id | | | |
| IF016 | | L | 비밀번호찾기 | C | | 1 | Page | DB | PC_LC_001 | /find-pass | | | |
| IF017 | | L | | C | 비밀번호 재설정 | 2 | Page | DB | PC_LC_002 | /reset-pass | | | |
| IF018 | 마이페이지 | P | 내정보관리 | A | 비밀번호 확인 | 1 | Page | DB | PC_PA_001 | /my/pass | | | |
| IF019 | | P | | A | 내정보관리 | 2 | Page | DB | PC_PA_002 | /my/info | | | |
| IF020 | | P | | A | 비밀번호 수정 | 3 | Layer Popup | DB | PC_PA_003_L | | | | |
| IF021 | | P | | A | 회원 탈퇴 | 4 | Layer Popup | DB | PC_PA_004_L | | | | |
| IF022 | | P | 1:1문의 | B | 목록 | 1 | Page | DB | PC_PB_001 | /my/inquiry | | | |
| IF023 | | P | | B | 상세 | 2 | Page | DB | PC_PB_002 | /my/inquiry/{id} | | | |
| IF024 | 공통 | Z | Error | A | 서버 점검중 | 1 | Page | Html | PC_ZA_001 | /maintenance | | | |
| IF025 | | Z | | A | 에러 404 | 2 | Page | Html | PC_ZA_002 | /error-404 | | | |
| IF026 | | Z | | A | 에러 500 | 3 | Page | Html | PC_ZA_003 | /error-500 | | | |
| IF027 | | Z | 약관 | B | 이용약관 | 1 | Page | Html | PC_ZB_001 | /terms | | | |
| IF028 | | Z | | B | 개인정보 취급방침 | 2 | Page | Html | PC_ZB_002 | /privacy | | | |
| IF029 | | Z | | B | 이용약관 동의 | 3 | Layer Popup | Html | PC_ZB_003_L | | | | |
| IF030 | | Z | | B | 개인정보 동의 | 4 | Layer Popup | Html | PC_ZB_004_L | | | | |
| IF031 | | Z | | B | 제3자 제공 동의 | 5 | Layer Popup | Html | PC_ZB_005_L | | | | |
| IF032 | | Z | 외부 API | C | 본인인증 | 1 | Popup | DB | PC_ZC_001_P | | | | |
| IF033 | | Z | | C | 주소 검색 | 2 | Popup | DB | PC_ZC_002_P | | | | |
| IF034 | | Z | 메일 | D | 비밀번호 재설정 메일 | 1 | Page | Html | PC_ZD_001 | /mail/pw-reset | | | |
| IF035 | | Z | | D | 1:1문의 답변 메일 | 2 | Page | Html | PC_ZD_002 | /mail/inquiry | | | |

---

## 3. BO (Back Office) IA

> 시트명: `IA_BO` | 제목 행: `프로젝트명 IA (B/O)`

### BO 컬럼 구조

| 컬럼 | 설명 |
|------|------|
| IA_ID | IB001부터 순차 |
| 1depth | 1단계 메뉴명 (그룹 첫 행만 입력) |
| ID | 1depth 영문 대문자 ID |
| 2depth | 2단계 메뉴명 (그룹 첫 행만 입력) |
| ID | 2depth 영문 대문자 ID (A, B, C...) |
| 3depth | 3단계 화면·기능명 |
| ID | 3depth 숫자 순번 |
| 4depth | 개발 단계 메모 (예: "2단계 개발", "1단계 (DB로 구현)") |
| Type | Page / Layer Popup / Popup |
| DB | DB / Html |
| 화면 ID | `BO_{1ID}{2ID}_{NNN}[_L\|_P]` |
| URL | 화면 URL (Popup류 공란, BO는 공란 허용) |
| Title | 기능 정의 (화면 주요 기능 설명) |
| 비고 | 정렬 기준, 연관 화면, 특이사항 |

### BO IA 예시 데이터

| IA_ID | 1depth | ID | 2depth | ID | 3depth | ID | 4depth | Type | DB | 화면 ID | URL | Title | 비고 |
|-------|--------|----|--------|----|--------|----|--------|------|-----|---------|-----|-------|------|
| IB001 | 메인 | M | 메인 | A | | 1 | | Page | DB | BO_MA_001 | | 관리자 메인 대시보드 (회원수/게시글수 등) | |
| IB002 | 사용자관리 | U | 회원관리 | A | 목록 | 1 | | Page | DB | BO_UA_001 | | 회원정보 관리 목록 (검색/탈퇴/엑셀다운로드) | 등록일자 내림차순 |
| IB003 | | U | | A | 등록 | 2 | | Layer Popup | DB | BO_UA_002_L | | 회원정보 등록 | |
| IB004 | | U | | A | 상세 | 3 | | Popup | DB | BO_UA_003_P | | 회원정보 상세 조회 (수정, 탈퇴, 비밀번호 재설정) | |
| IB005 | | U | 관리자관리 | B | 목록 | 1 | | Page | DB | BO_UB_001 | | 관리자 조회 및 검색, 추가/삭제 | 회원과 관리자 같은 DB |
| IB006 | | U | | B | 등록 | 2 | | Layer Popup | DB | BO_UB_002_L | | 관리자 회원 등록 | |
| IB007 | 게시판관리 | B | 공지사항관리 | A | 목록 | 1 | | Page | DB | BO_BA_001 | | 공지사항 목록 검색 | 등록일자 내림차순 |
| IB008 | | B | | A | 등록/수정/삭제 | 2 | | Layer Popup | DB | BO_BA_002_L | | 공지사항 게시글 등록/수정/삭제 | |
| IB009 | | B | FAQ관리 | B | 목록 | 1 | | Page | DB | BO_BB_001 | | FAQ 목록 검색 | 등록일자 내림차순 |
| IB010 | | B | | B | 등록/수정/삭제 | 2 | | Layer Popup | DB | BO_BB_002_L | | FAQ 게시글 등록/수정/삭제 | |
| IB011 | | B | 갤러리관리 | C | 목록 | 1 | | Page | DB | BO_BC_001 | | 갤러리 목록 검색 | 등록일자 내림차순 |
| IB012 | | B | | C | 등록/수정/삭제 | 2 | | Layer Popup | DB | BO_BC_002_L | | 갤러리 게시글 등록/수정/삭제 | |
| IB013 | | B | 1:1문의관리 | D | 목록 | 1 | | Page | DB | BO_BD_001 | | 1:1문의 목록 검색 | 미답변→등록일자 내림차순 |
| IB014 | | B | | D | 답변 등록/수정/삭제 | 2 | | Layer Popup | DB | BO_BD_002_L | | 1:1문의 답변 등록/수정/삭제 | |
| IB015 | 운영관리 | H | 팝업관리 | A | 목록 | 1 | | Page | DB | BO_HA_001 | | 메인 팝업 목록 검색 | |
| IB016 | | H | | A | 등록/수정/삭제 | 2 | | Layer Popup | DB | BO_HA_002_L | | 팝업 등록/수정/삭제 | |
| IB017 | | H | 배너관리 | B | 목록 | 1 | 2단계 개발 | Page | DB | BO_HB_001 | | 메인 배너 목록 검색 | |
| IB018 | | H | | B | 등록/수정/삭제 | 2 | 2단계 개발 | Layer Popup | DB | BO_HB_002_L | | 배너 등록/수정/삭제 | |
| IB019 | 시스템관리 | S | 개인정보관리이력 | A | 목록 | 1 | 1단계 (DB로 구현) | Page | DB | BO_SA_001 | | 개인정보 관리이력 목록 (검색/엑셀다운로드) | 등록일자 내림차순 |
| IB020 | | S | 로그인이력 | B | 목록 | 1 | 1단계 (DB로 구현) | Page | DB | BO_SB_001 | | 회원/관리자 로그인 이력 조회 | 등록일자 내림차순 |
| IB021 | | S | SMS발송이력 | C | 목록 | 1 | | Page | DB | BO_SC_001 | | SMS 발송이력 (검색/목록/엑셀다운로드) | 등록일자 내림차순 |
| IB022 | | S | | C | 상세/수신자목록 | 2 | | Layer Popup | DB | BO_SC_002_L | | SMS 상세/수신자 목록 | 수신자명 오름차순 |
| IB023 | | S | 메뉴관리 | D | 목록/상세 | 1 | 1단계 (DB로 구현) | Page | DB | BO_SD_001 | | 시스템 메뉴 관리 | DB 관리, 화면 개발 안함 |
| IB024 | | S | 권한관리 | E | 목록/상세 | 1 | 1단계 (DB로 구현) | Page | DB | BO_SE_001 | | 권한 관리 | DB 관리, 화면 개발 안함 |
| IB025 | | S | 공통코드관리 | F | 목록/상세 | 1 | 1단계 (DB로 구현) | Page | DB | BO_SF_001 | | 공통코드 관리 | DB 관리, 화면 개발 안함 |
| IB026 | 로그인 | L | 로그인 | A | | 1 | | Page | DB | BO_LA_001 | | 관리자시스템 로그인 | |
| IB027 | 기타 | Z | Error | A | 서버 점검중 | 1 | | Page | Html | BO_ZA_001 | | 서버 점검중 화면 | |
| IB028 | | Z | | A | 에러 404 | 2 | | Page | Html | BO_ZA_002 | | 404 Error 화면 | |
| IB029 | | Z | | A | 에러 500 | 3 | | Page | Html | BO_ZA_003 | | 500 Error 화면 | |
| IB030 | | Z | 공통레이어 | B | 전체메뉴 레이어 | 1 | | Layer Popup | DB | BO_ZB_001_L | | 전체 메뉴 레이어 | |
| IB031 | | Z | | B | 검색 레이어 | 2 | | Layer Popup | DB | BO_ZB_002_L | | 회원 검색 레이어 | |
| IB032 | | Z | | B | 마이페이지 레이어 | 3 | | Layer Popup | DB | BO_ZB_003_L | | 마이페이지 레이어 | SMS발송/로그아웃 버튼 |
| IB033 | | Z | | B | 이미지 미리보기 | 4 | | Layer Popup | DB | BO_ZB_004_L | | 이미지 미리보기 레이어 | |
| IB034 | | Z | SMS발송등록 | C | SMS 발송 팝업 | 1 | | Popup | DB | BO_ZC_001_P | | SMS 발송 등록 팝업 (수신자 목록, 발송 내용 입력) | 수신자명 오름차순 |
| IB035 | | Z | | C | 회원 검색 레이어 | 2 | | Layer Popup | DB | BO_ZC_002_L | | SMS 발송 회원 추가 | |
| IB036 | | Z | | C | 수신번호 추가 레이어 | 3 | | Layer Popup | DB | BO_ZC_003_L | | SMS 발송 수신번호 추가 | |

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
| .do 금지 | `.do` 확장자 사용 금지 (레거시 패턴) |
| 계층 구조 | 메뉴 계층을 URL에 반영 |
| RESTful | 목록: `/resource`, 상세: `/resource/{id}` |
| BO prefix | BO URL은 관리자 내부 URL 또는 공란 허용 |
| Popup류 | Layer Popup·Popup은 URL 공란 |

---

## 6. Google Sheets 구조 및 스타일

> `ia-generator` 스킬이 `scripts/generators/gen_ia.py`로 파일을 생성할 때 아래 규격을 적용한다.

### 시트 구성

| 시트명 | 내용 | 컬럼 수 |
|--------|------|---------|
| `IA_FO` | FO 전체 화면 목록 | 14개 (IA_ID / 1depth / ID / 2depth / ID / 3depth / ID / Type / DB / 화면ID / URL / Title / Description / Keyword) |
| `IA_BO` | BO 전체 화면 목록 | 14개 (IA_ID / 1depth / ID / 2depth / ID / 3depth / ID / 4depth / Type / DB / 화면ID / URL / Title / 비고) |
| `집계` | 화면 수 집계표 | 구분 / Page / Layer Popup / Popup / 합계 |

### 첫 번째 타이틀 행

각 시트 최상단에 병합 셀로 프로젝트명 타이틀 행을 삽입한다.

| 시트 | 타이틀 텍스트 |
|------|-------------|
| `IA_FO` | `{프로젝트명} IA (F/O)` |
| `IA_BO` | `{프로젝트명} IA (B/O)` |

### 셀 스타일 규칙

| 행 구분 | 배경 컬러 | 폰트 컬러 | 굵기 | 정렬 |
|---------|---------|---------|------|------|
| 헤더 행 (컬럼명 행) | `#29292A` | `#FFFFFF` | Bold | Center |
| 데이터 행 | 없음 | 기본 | 기본 | 기본 |

---

## 7. gen_ia.py JSON 입력 스키마

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
      "ia_id": "IF001",
      "depth1": "메인",
      "depth1_id": "M",
      "depth2": "",
      "depth2_id": "",
      "depth3": "",
      "depth3_id": "1",
      "type": "Page",
      "db": "DB",
      "screen_id": "PC_MA_001",
      "url": "/",
      "seo_title": "사이트명",
      "seo_desc": "사이트 설명",
      "seo_keyword": "키워드1, 키워드2"
    },
    {
      "ia_id": "IF002",
      "depth1": "",
      "depth1_id": "M",
      "depth2": "공지 팝업",
      "depth2_id": "B",
      "depth3": "",
      "depth3_id": "1",
      "type": "Layer Popup",
      "db": "DB",
      "screen_id": "PC_MB_001_L",
      "url": "",
      "seo_title": "",
      "seo_desc": "",
      "seo_keyword": ""
    }
  ],
  "bo_ia": [
    {
      "ia_id": "IB001",
      "depth1": "메인",
      "depth1_id": "M",
      "depth2": "메인",
      "depth2_id": "A",
      "depth3": "",
      "depth3_id": "1",
      "depth4": "",
      "type": "Page",
      "db": "DB",
      "screen_id": "BO_MA_001",
      "url": "",
      "title": "관리자 메인 대시보드",
      "note": ""
    }
  ],
  "summary": {
    "fo": { "page": 0, "layer_popup": 0, "popup": 0, "total": 0 },
    "bo": { "page": 0, "layer_popup": 0, "popup": 0, "total": 0 }
  }
}
```
