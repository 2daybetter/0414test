# IA 설계 규칙

## IA_ID 체계

| 구분 | 형식 | 예시 | 설명 |
|------|------|------|------|
| FO | IF{NNN} | IF001, IF002 | I=Information, F=Front, NNN=전체 순번 001부터 순차 부여 |
| BO | IB{NNN} | IB001, IB002 | I=Information, B=Back, NNN=전체 순번 001부터 순차 부여 |

- FO와 BO 각각 001부터 독립적으로 순번 부여
- 팝업·레이어도 별도 순번 부여

---

## Depth ID 체계

### 1depth ID — 영문 대문자 1자 (메뉴별 고유 지정)

| 메뉴명 | ID | 메뉴명 | ID |
|--------|----|--------|----|
| 메인 (Main) | M | 로그인 (Login) | L |
| 고객지원 (support/Notice) | N | 마이페이지 (myPage) | P |
| 회원가입 (Join) | J | 공통 (Common/eXtra) | Z |
| 대시보드 (Dashboard) | D | 사용자관리 (User) | U |
| 게시판관리 (Board) | B | 운영관리 (Handling) | H |
| 시스템관리 (System) | S | 뉴스레터관리 (Newsletter) | N |
| 서비스 (Service) | V | 회사소개 (Company) | C |
| 제품 (Product) | R | 채용 (recRuit) | T |

- 1depth ID는 프로젝트 메뉴 구성에 따라 새로 정의한다
- **FO 전체**, **BO 전체**에서 각각 1depth ID가 중복되지 않아야 한다
- 한글 메뉴명은 영문 의미로 치환 후 첫 글자 사용. 충돌 시 두 번째 연관 영문자 사용

### 2depth ID — 영문 대문자 1자 (동일 1depth 내 순서대로)

| 순서 | ID | 순서 | ID |
|------|-----|------|-----|
| 첫 번째 2depth | A | 여섯 번째 2depth | F |
| 두 번째 2depth | B | 일곱 번째 2depth | G |
| 세 번째 2depth | C | 여덟 번째 2depth | H |
| 네 번째 2depth | D | ... | ... |
| 다섯 번째 2depth | E | | |

- 2depth가 없는 경우 ID는 공란
- 동일 1depth 내에서 2depth ID는 중복되지 않아야 한다

### 3depth ID — 숫자 순번

- 동일 2depth 내에서 1부터 순차 부여
- Layer Popup·Popup도 3depth로 분류하여 순번 부여
- 3depth가 없는 경우 공란

---

## 화면 ID 체계

### FO 화면 ID

```
PC_{1depth_ID}{2depth_ID}_{NNN}[_L|_P]
```

| 구성 | 설명 |
|------|------|
| `PC` | 디바이스 구분 (PC 기준. 모바일은 MO) |
| `{1depth_ID}{2depth_ID}` | 1depth ID + 2depth ID 조합 (2자리) |
| `_{NNN}` | 해당 조합 내 화면 순번 (001부터) |
| `_L` | Layer Popup 접미사 |
| `_P` | Popup 접미사 |

**예시**

| 1depth | ID | 2depth | ID | Type | 화면ID |
|--------|----|--------|----|------|--------|
| 메인 | M | (없음) | A | Page | PC_MA_001 |
| 메인 | M | 공지팝업 | B | Layer Popup | PC_MB_001_L |
| 고객지원 | N | 공지사항 | A | Page | PC_NA_001 |
| 고객지원 | N | 공지사항 | A | Page (상세) | PC_NA_002 |
| 회원가입 | J | 약관동의 | A | Page | PC_JA_001 |
| 회원가입 | J | 약관동의 | A | Popup | PC_JA_001_P |

### BO 화면 ID

```
BO_{1depth_ID}{2depth_ID}_{NNN}[_L|_P]
```

| 구성 | 설명 |
|------|------|
| `BO` | Back Office 구분 고정값 |
| `{1depth_ID}{2depth_ID}` | 1depth ID + 2depth ID 조합 (2자리) |
| `_{NNN}` | 해당 조합 내 화면 순번 (001부터) |
| `_L` | Layer Popup 접미사 |
| `_P` | Popup 접미사 |

**예시**

| 1depth | ID | 2depth | ID | Type | 화면ID |
|--------|----|--------|----|------|--------|
| 메인 | M | 메인 | A | Page | BO_MA_001 |
| 사용자관리 | U | 회원관리 | A | Page | BO_UA_001 |
| 사용자관리 | U | 회원관리 | A | Layer Popup | BO_UA_002_L |
| 사용자관리 | U | 회원관리 | A | Popup | BO_UA_003_P |
| 게시판관리 | B | 공지사항 | A | Page | BO_BA_001 |

---

## 화면 타입 정의

| Type | 정의 | URL 필요 | FO SEO | 화면ID 접미사 |
|------|------|---------|--------|--------------|
| Page | 독립 URL을 가진 전체 화면 | ✅ | ✅ | 없음 |
| Layer Popup | 현재 화면 위에 레이어로 표시 | ❌ | ❌ | `_L` |
| Popup | 별도 팝업 창으로 표시 | ❌ | ❌ | `_P` |

---

## DB 컬럼 값 정의

| 값 | 의미 |
|----|------|
| `DB` | 데이터베이스 연동 화면 (동적) |
| `Html` | 정적 HTML 화면 (Error 페이지, 약관 페이지, 메일 템플릿 등) |

---

## FO IA 컬럼 정의

| 컬럼 | 설명 | 비고 |
|------|------|------|
| IA_ID | FO 순번 ID | IF001~ |
| 1depth | 1단계 메뉴명 | 반복 입력 없이 해당 그룹 최초 행만 입력 |
| ID | 1depth 영문 ID | 대문자 1자 |
| 2depth | 2단계 메뉴명 | 반복 입력 없이 해당 그룹 최초 행만 입력 |
| ID | 2depth 영문 ID | 대문자 1자 |
| 3depth | 3단계 화면/기능명 | |
| ID | 3depth 숫자 순번 | |
| Type | 화면 타입 | Page / Layer Popup / Popup |
| DB | DB 연동 여부 | DB / Html |
| 화면 ID | 화면 고유 ID | `PC_{1ID}{2ID}_{NNN}[_L|_P]` |
| To Be URL | 화면 URL | `.do` 확장자 금지 / Layer Popup·Popup은 공란 |
| Title | SEO 제목 | Page 타입만 작성, 30자 이내 |
| Description | SEO 설명 | Page 타입만 작성, 80자 이내 |
| Keyword | SEO 키워드 | Page 타입만 작성, 쉼표 구분, 5개 이내 |

---

## BO IA 컬럼 정의

| 컬럼 | 설명 | 비고 |
|------|------|------|
| IA_ID | BO 순번 ID | IB001~ |
| 1depth | 1단계 메뉴명 | 반복 입력 없이 해당 그룹 최초 행만 입력 |
| ID | 1depth 영문 ID | 대문자 1자 |
| 2depth | 2단계 메뉴명 | 반복 입력 없이 해당 그룹 최초 행만 입력 |
| ID | 2depth 영문 ID | 대문자 1자 |
| 3depth | 3단계 화면/기능명 | |
| ID | 3depth 숫자 순번 | |
| 4depth | 개발 단계 메모 | 예: "2단계 개발", "1단계 (DB로 구현)" |
| Type | 화면 타입 | Page / Layer Popup / Popup |
| DB | DB 연동 여부 | DB / Html |
| 화면 ID | 화면 고유 ID | `BO_{1ID}{2ID}_{NNN}[_L|_P]` |
| URL | 화면 URL | `.do` 확장자 금지 / Layer Popup·Popup은 공란 |
| Title | 기능 정의 | 화면 주요 기능 설명 |
| 비고 | 특이사항 | 정렬 기준, 연관 화면 등 |

> **FO vs BO 차이**: FO는 SEO 3개 컬럼(Title/Description/Keyword), BO는 4depth + 비고 컬럼 구조

---

## FO/BO 구분 규칙

- FO와 BO는 **별도 탭**으로 분리한다 (Google Sheet 기준: `IA_FO`, `IA_BO` 탭)
- 단일 시트에 FO·BO를 혼재하지 않는다

---

## URL 설계 규칙

- 소문자 + 하이픈(-) 또는 슬래시(/) 사용
- 언더스코어(_) 금지 (SEO 불리)
- **.do 확장자 사용 금지** (To Be URL .do 지양)
- FO: `/경로/하위경로` (예: `/cs/notice`, `/my/info`)
- BO: `/admin/경로` 또는 경로 없이 관리자 내부에서만 사용 (URL 컬럼 공란 허용)
- 동적 파라미터: `/경로/{id}` 또는 `/경로/1(number)` 형식
- Layer Popup·Popup은 URL 공란

---

## SEO 메타 기준 (FO Page 타입만 해당)

| 항목 | 작성 기준 | 길이 제한 |
|------|---------|---------|
| Title | 페이지 핵심 키워드 + 브랜드명 | 30자 이내 |
| Description | 페이지 내용 요약 + CTA | 80자 이내 |
| Keyword | 쉼표 구분, 주요 검색어 | 5개 이내 |

---

## 공통 화면 (FO Z, BO Z) 필수 포함 항목

### FO 공통 (1depth ID: Z)

| 분류 | 필수 화면 |
|------|---------|
| Error | 서버 점검중 (Html), 404 에러 (Html), 500 에러 (Html) |
| 약관 | 이용약관, 개인정보 취급방침, 이용약관 동의 팝업, 개인정보 동의 팝업, 제3자 제공 동의 팝업 |
| 외부 API | 본인인증 팝업 (Nice Check Plus 등), 주소 검색 팝업 (우편번호) |
| 메일 | 비밀번호 재설정 메일, 1:1문의 답변 메일 등 |

### BO 공통 (1depth ID: Z)

| 분류 | 필수 화면 |
|------|---------|
| Error | 서버 점검중, 404 에러, 500 에러 |
| 공통 레이어 | 전체메뉴 레이어, 검색 레이어, 마이페이지 레이어, 이미지 미리보기 레이어 |
| 발송 팝업 | SMS 발송 팝업, SMS 회원 검색 레이어, 수신번호 추가 레이어 |

---

## 1depth 메뉴 가이드라인

### FO 1depth 공통 구성 예시

| 업종 | 1depth 예시 |
|------|-----------|
| 기업 홈페이지 | 메인 / 회사소개 / 사업영역 / 고객지원 / 회원가입 / 로그인 / 마이페이지 / 공통 |
| 쇼핑몰 | 메인 / 카테고리 / 이벤트 / 고객센터 / 마이페이지 / 회원가입 / 로그인 / 공통 |
| 서비스 플랫폼 | 메인 / 서비스소개 / 이용방법 / 요금제 / 고객지원 / 로그인 / 마이페이지 / 공통 |

### BO 1depth 공통 구성 예시

| 메뉴 | ID | 설명 |
|------|-----|------|
| 메인 | M | 관리자 대시보드 |
| 사용자관리 | U | 회원 정보, 관리자 계정 관리 |
| 게시판관리 | B | 공지사항, FAQ, 갤러리, 1:1문의 |
| 운영관리 | H | 팝업, 배너, 메인 콘텐츠 |
| 시스템관리 | S | 개인정보이력, 로그인이력, 발송이력, 메뉴/권한/코드 관리 |
| 로그인 | L | 관리자 로그인 |
| 기타/공통 | Z | 에러 화면, 공통 레이어, 발송 팝업 |
