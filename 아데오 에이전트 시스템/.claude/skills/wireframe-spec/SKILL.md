---
name: wireframe-spec
description: 웹사이트 화면설계서(DE-03)를 Figma로 생성하는 스킬. IA 설계서를 입력받아 프로젝트명으로 Figma 파일을 생성하고, 1depth 메뉴는 섹션(Section), 2depth 메뉴는 프레임(Frame)으로 구성한다. 트리거: "화면설계서 작성", "wireframe-spec", "화면 설계", "화면 명세", DE-03 산출물 요청, 웹기획팀 에이전트의 Step 10 진입 시 자동 참조.
---

# wireframe-spec

## 개요

IA 설계서 기반으로 아데오 표준 화면설계서(DE-03)를 **Figma 파일**로 생성한다.  
파워포인트·마크다운 파일로 작성하지 않는다. 반드시 Figma MCP(`mcp__claude_ai_Figma`)를 사용한다.

**Figma 구조 원칙**:
- **Figma 파일명** = 프로젝트명 (예: `아데오 코퍼레이션 웹사이트`)
- **Page** = FO / BO 구분 (Figma 파일 내 2개 페이지)
- **Section** = IA 1depth 메뉴 1개 → Section 1개
- **Frame** = IA 2depth 메뉴 1개 (Page 타입) → Frame 1개

---

## 실행 절차

### Step 1: 입력 확인

| 필수 입력 | 확인 방법 |
|---------|---------|
| IA 설계서 Drive URL | `.status/구축 파트/{프로젝트명}/.status`의 `outputs.ia` → `mcp__claude_ai_Google_Drive__read_file_content`로 읽기 |
| 프로젝트명 | IA 설계서 헤더 또는 상위 에이전트 전달값 |
| 고객사 브랜드 가이드 | 있으면 참조, 없으면 아데오 기본 스타일 적용 |

입력이 없으면 즉시 실패 리포트 후 중단.

---

### Step 2: IA 파일 파싱 — 메뉴 구조 추출

`.status outputs.ia` Drive URL의 내용을 `mcp__claude_ai_Google_Drive__read_file_content`로 읽어 다음 데이터를 추출한다.

**추출 대상 (FO · BO 각각)**:
- 1depth 메뉴 목록 → Section 생성에 사용
- 2depth 메뉴 목록 (Type = Page 한정) → Frame 생성에 사용
- 각 Page의 **화면ID** (예: `FO_CV_001`) / 화면명 / URL / 기능 요약

> **화면ID 형식**: `{SYS}_{XY}_{NNN}` — X=1depth약어, Y=2depth약어(없으면 0), NNN=순번  
> IA 인덱스의 `화면ID` 컬럼 값을 그대로 사용한다. IA_ID(`FO-1-01`)와 혼동하지 않는다.

**파싱 결과 예시**:
```
[FO]
1depth: 회사소개 → Section "회사소개"
  2depth (Page): 비전/미션  화면ID=FO_CV_001 → Frame "FO_CV_001 비전/미션"
  2depth (Page): 연혁       화면ID=FO_CI_001 → Frame "FO_CI_001 연혁"
  2depth (Page): 오시는길   화면ID=FO_CA_001 → Frame "FO_CA_001 오시는길"

1depth: 사업영역 → Section "사업영역"
  2depth (Page): 사업소개   화면ID=FO_SI_001 → Frame "FO_SI_001 사업소개"
  ...
```

---

### Step 3: Figma 파일 생성

Figma MCP `mcp__claude_ai_Figma__create_new_file`을 호출하여 프로젝트명으로 파일을 생성한다.

```
파일명: {프로젝트명}  (예: "아데오 코퍼레이션 웹사이트")
```

생성된 Figma 파일 URL과 fileKey를 저장한다.

---

### Step 4: FO 페이지 구성

Figma 파일의 첫 번째 페이지 이름을 `FO (Front Office)`로 설정하고 아래 순서로 구성한다.

#### 4-1. Section 생성 — 1depth 메뉴 1개 = Section 1개

- Section 명칭: `{1depth 메뉴명}` (예: `회사소개`, `사업영역`, `고객지원`)
- Section은 좌→우 방향으로 1200px 간격으로 배치

#### 4-2. Frame 생성 — 2depth 메뉴(Page 타입) 1개 = Frame 1개

Frame 규격·배치·명칭 규칙: `wireframe-template.md` **Figma 파일 구조** 섹션 참조.

- Frame 명칭: `{화면ID} {화면명}` (예: `FO_CV_001 비전/미션`)

#### 4-3. 각 Frame 내 와이어프레임 작성

`mcp__claude_ai_Figma__use_figma`를 사용하여 각 Frame 내부에 아래 요소를 배치한다.

**공통 레이어 구조**: `wireframe-template.md` 레이어 구조 섹션 참조. FO = Header(GNB) + Content Area + Footer, BO = Sidebar(220px) + TopBar(56px) + Content Area.

**화면별 Content Area 구성** (`references/wireframe-rules.md` 상세 규칙 참조):
- 리스트 페이지: 페이지 타이틀 + 필터/정렬 바 + 카드 그리드(3컬럼) + 페이지네이션
- 상세 페이지: 브레드크럼 + 이미지 영역 + 타이틀 + 본문 + 관련 콘텐츠
- 폼 페이지: 브레드크럼 + 섹션 타이틀 + 입력 필드 목록 + 제출/취소 버튼
- 메인(홈) 페이지: 히어로 배너 + 주요 섹션(최소 3개)
- 기타: IA 기능 요약 기반으로 적절히 구성

**Figma 컴포넌트 스타일 기준**: `wireframe-template.md` 디자인 토큰 섹션 및 `templates/krds-design-system.md` 참조. 고객사 브랜드 가이드 존재 시 Primary Color만 대체.

---

### Step 5: BO 페이지 구성

Figma 파일에 두 번째 페이지 `BO (Back Office)`를 추가하고 FO와 동일한 방식으로 구성한다.

BO Frame 규격·레이아웃: `wireframe-template.md` **Figma 파일 구조** 섹션 참조.

- Frame 명칭: `{화면ID} {화면명}` (예: `BO_D0_001 대시보드`)

---

### Step 6: 공통 컴포넌트 페이지 생성

Figma 파일에 세 번째 페이지 `Components`를 추가하고 재사용 컴포넌트를 정의한다.

| 컴포넌트 | 내용 |
|---------|------|
| GNB | FO 전체 공통 상단 내비게이션 |
| Footer | FO 전체 공통 하단 |
| BO Sidebar | BO 전체 공통 사이드바 |
| 공통 모달 | 알림 / 확인 / 오류 3종 |
| 공통 Toast | 성공 / 오류 / 경고 |
| 로딩 스피너 | 데이터 로딩 중 |
| 빈 상태 | 데이터 없을 때 안내 |

---

### Step 7: 자기 검증

Figma 파일 생성 완료 후 다음을 확인한다:

- [ ] FO 페이지에 IA 1depth 메뉴 수와 동일한 Section이 존재하는가
- [ ] 각 Section 내 IA 2depth Page 타입 화면 수와 동일한 Frame이 존재하는가
- [ ] 각 Frame 명칭이 `{화면ID} {화면명}` 형식(예: `FO_CV_001 비전/미션`)인가
- [ ] IA 인덱스의 화면ID와 Figma Frame 명칭 prefix가 1:1 매핑되는가
- [ ] BO 페이지 동일 확인
- [ ] Components 페이지 존재하는가
- [ ] 각 Frame에 GNB + Content Area + Footer 레이어가 있는가

검증 실패 시 해당 Section/Frame만 재생성 후 재확인.

---

### Step 8: 출력 기록

Figma 파일 생성 완료 후 URL을 `.status`에 기록한다.

- **Figma 파일 URL**: (생성된 URL) → `.status/구축 파트/{프로젝트명}/.status`의 `outputs.wireframe`에 기록

- **성공 기준**: Figma 파일 URL 존재 + `.status outputs.wireframe`에 기록 완료 + IA 전체 Page 타입 화면 커버

---

## 실패 처리

| 실패 유형 | 처리 |
|---------|------|
| IA 설계서 없음 | 실패 리포트 생성 후 중단 — `ia-generator` 먼저 실행 필요 안내 |
| Figma MCP 오류 | 오류 메시지 기록 후 재시도 1회, 재실패 시 에스컬레이션 |
| Frame 누락 발견 (자기 검증) | 해당 Frame 즉시 재생성 후 재검증 |
| 자기 검증 2회 실패 | 미완성 화면 목록 명시 후 구축 파트 L2 에스컬레이션 |
