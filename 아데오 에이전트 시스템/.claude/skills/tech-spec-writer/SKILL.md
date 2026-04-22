---
name: tech-spec-writer
description: 요구사항정의서와 rfp-context를 기반으로 Spring Boot + React + 하이브리드 앱 기술 스펙 7종(DE-04~DE-07, TE-01 관련)을 자동 생성하는 스킬. 트리거: 구축 파트 Step 7에서 개발팀 L3 자동 실행, "tech-spec-writer", "기술 스펙", "API 정의서", "테이블정의서", "DE-04", "DE-05", "DE-06", "DE-07".
---

# tech-spec-writer

## 개요

요구사항정의서(AY-01)와 IA 설계서(DE-03)를 입력받아 아데오 표준 기술 스펙 문서 7종을 자동 생성한다.  
기술 스택: Spring Boot(OpenJDK 17+) + React + 하이브리드 앱(iOS/Android) + GIT + CI/CD.

**출력 산출물 (7종)**:

| 코드 | 산출물명 | 출력 도구 |
|------|---------|---------|
| DE-04 | 정책정의서 | Google Sheet |
| DE-05 | 테이블정의서·ERD | Google Sheet |
| DE-06 | 프로그램 목록 | Google Sheet |
| DE-07 | API 정의서 | Google Sheet |
| TE-01 | 단위 테스트 시나리오 기반 | Google Sheet |
| (보조) | 기술 아키텍처 문서 | Google Drive (Markdown) |
| (보조) | 개발 환경 설정 가이드 | Google Drive (Markdown) |

**출력 형식 원칙**:
- Google Sheet 산출물: `scripts/gen_tech_spec.py` 실행 → Google Drive MCP 업로드
- 로컬 파일 업로드 즉시 삭제

---

## 실행 절차

### Step 1: 입력 확인

| 필수 입력 | 확인 방법 |
|---------|---------|
| rfp-context Drive URL | `.status` 파일의 `outputs.rfp-context` |
| 요구사항정의서 Drive URL | `.status` 파일의 `outputs.requirements` |
| IA 설계서 Drive URL | `.status` 파일의 `outputs.ia` |
| 프로젝트명 | `.status` 파일의 `lead` |

`.status` 파일 경로: Google Drive 아데오 프로젝트/{프로젝트명}/.status/.status (루트 폴더 ID: 1XHWdKpQmsoyiScj-NicRrHuYzDZsyBDM)

IA 설계서 URL이 없는 경우: 요구사항정의서만으로 진행 (화면 목록 대신 기능 목록 기반으로 처리).

### Step 2: 입력 문서 읽기

`mcp__claude_ai_Google_Drive__read_file_content`로 다음을 읽는다:
- rfp-context: 기술 요구사항(TER) + 보안 요구사항(SER) + 성능 요구사항(PER)
- 요구사항정의서: 전체 기능 목록 + SFR 항목
- IA 설계서: 화면ID 목록 + URL 구조

### Step 3: 기술 스택 확정

rfp-context의 TER 항목을 기반으로 기술 스택을 확정한다.

**더케이예다함 사업 기준 기술 스택**:

| 레이어 | 기술 | 버전 |
|--------|------|------|
| Backend | Spring Boot | 3.x (OpenJDK 17+) |
| Frontend | React | 18.x |
| Mobile | 하이브리드 앱 (iOS/Android) | React Native 또는 Ionic |
| DB | PostgreSQL 또는 MySQL | TER 기준 |
| 소스관리 | GIT | — |
| 배포 | CI/CD (Jenkins 또는 GitHub Actions) | — |
| 보안 | Spring Security, JWT | — |

### Step 4: DE-04 정책정의서 생성

시스템 운영 정책을 정의한다.

**정책 항목 (최소 구성)**:

| 정책 분류 | 정책 항목 | 내용 |
|---------|---------|------|
| 회원/계정 | 비밀번호 정책 | 8자 이상, 영문+숫자+특수문자 조합 |
| 회원/계정 | 세션 유지 시간 | 30분 비활동 시 자동 로그아웃 |
| 파일 관리 | 업로드 허용 확장자 | jpg, png, pdf, xlsx, hwp |
| 파일 관리 | 파일 최대 크기 | 단일 파일 50MB 이하 |
| 게시판 | 페이징 기본값 | 10건/페이지 |
| 게시판 | 삭제 정책 | 소프트 삭제 (복구 가능) |
| 보안 | 로그인 실패 허용 횟수 | 5회 이상 계정 잠금 |
| 보안 | 접근 로그 보존 기간 | 1년 |

SER 요구사항과 교차 검증하여 정책 항목을 추가·조정한다.

### Step 5: DE-05 테이블정의서·ERD 생성

SFR + DAR 요구사항을 기반으로 핵심 엔티티와 테이블을 도출한다.

**도출 절차**:
1. SFR 기능 목록에서 명사(엔티티 후보) 추출
2. 핵심 엔티티 확정 (최소 8개 이상)
3. 각 엔티티의 컬럼 정의 (PK, FK, Not Null, Default, 설명)
4. 엔티티 간 관계(1:N, N:M) 정의

**필수 공통 컬럼** (모든 테이블):

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |
| created_by | VARCHAR(50) | 생성자 |
| is_deleted | BOOLEAN | 소프트 삭제 여부 |

**ERD**: 텍스트 기반 Mermaid 다이어그램으로 시트 내 별도 탭에 기록.

### Step 6: DE-06 프로그램 목록 생성

IA 설계서의 화면ID와 SFR 기능 목록을 매핑하여 프로그램 목록을 생성한다.

**프로그램 목록 컬럼**:

| 열 | 헤더 | 내용 |
|----|------|------|
| A | 프로그램 ID | PGM_{화면ID} |
| B | 프로그램명 | 화면명 기반 |
| C | 화면ID | IA 설계서 화면ID |
| D | URL | IA 설계서 URL |
| E | 구분 | FO / BO |
| F | 개발 언어 | React / Spring Boot |
| G | 관련 API | API ID (Step 7에서 채움) |
| H | 관련 요구사항 | SFR-XX |
| I | 개발 우선순위 | 필수 / 권장 / 선택 |

### Step 7: DE-07 API 정의서 생성

SFR 기능 목록과 프로그램 목록을 기반으로 REST API를 정의한다.

**API ID 규칙**: `API-{모듈코드}-{순번(001부터)}` (예: API-USR-001, API-BRD-001)

**API 정의서 컬럼**:

| 열 | 헤더 | 내용 |
|----|------|------|
| A | API ID | API-USR-001 |
| B | API명 | 회원 로그인 |
| C | HTTP Method | GET / POST / PUT / DELETE |
| D | URL | /api/v1/users/login |
| E | 요청 파라미터 | JSON 스키마 (컬럼명: 타입: 필수여부) |
| F | 응답 구조 | JSON 스키마 |
| G | 인증 필요 | Y / N |
| H | 관련 테이블 | DE-05 테이블명 |
| I | 관련 화면 | 화면ID |
| J | 비고 | 특이사항 |

**필수 API 최소 구성** (SFR 기반 도출):
- 회원 관련: 회원가입, 로그인, 로그아웃, 정보 조회/수정
- 공통: 파일 업로드/다운로드, 코드 조회
- 각 주요 기능 모듈별 CRUD

### Step 8: Google Sheet 생성 및 업로드

7종 산출물 데이터를 JSON으로 구성하고 `scripts/gen_tech_spec.py`를 실행한다.

**실행 순서**:
1. DE-04~07 데이터를 단일 JSON으로 구성 (산출물별 키)
2. `scripts/gen_tech_spec.py` 실행 → 산출물별 `.xlsx` 생성
3. `mcp__claude_ai_Google_Drive__create_file`로 각각 업로드
4. 반환된 URL을 `.status` 파일에 기록:
   - `outputs.policy-spec` (DE-04)
   - `outputs.table-spec` (DE-05)
   - `outputs.program-list` (DE-06)
   - `outputs.api-spec` (DE-07)
5. 로컬 `.xlsx` 파일 삭제

### Step 9: 검증

**성공 기준**:
- DE-05: 엔티티 8개 이상, 모든 테이블에 공통 컬럼 존재
- DE-06: IA 설계서 화면 수와 프로그램 목록 행 수 일치
- DE-07: 모든 SFR "필수" 항목에 대응 API 존재
- 모든 `.status` outputs URL 기록 완료

---

## 출력 파일 목록

| 산출물 코드 | 산출물명 | 형식 | `.status` 키 |
|-----------|---------|------|------------|
| DE-04 | 정책정의서 | Google Sheet | `outputs.policy-spec` |
| DE-05 | 테이블정의서·ERD | Google Sheet | `outputs.table-spec` |
| DE-06 | 프로그램 목록 | Google Sheet | `outputs.program-list` |
| DE-07 | API 정의서 | Google Sheet | `outputs.api-spec` |

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| 요구사항정의서 URL 없음 | requirements-writer 재실행 요청 후 중단 |
| 엔티티 8개 미만 도출 | SFR 재분석 후 재시도 1회 |
| API 매핑 누락 항목 존재 | 누락 SFR 목록 출력 후 보완 |
| gen_tech_spec.py 실행 오류 | 재시도 1회 → 실패 시 에스컬레이션 |
| Drive 업로드 실패 | 재시도 1회 → 실패 시 에스컬레이션 |
