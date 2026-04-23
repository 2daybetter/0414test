# 화면설계서 작성 규칙 (KRDS v1.0.0 기반)

> **디자인 시스템 기준**: KRDS v1.0.0 (한국 디지털 정부 디자인 시스템)  
> **비주얼 레퍼런스**: [범정부 UI/UX 표준프로토타입 Figma](https://www.figma.com/design/MxyagR7eWWYbElFNGoRN3Z/%EB%B2%94%EC%A0%95%EB%B6%80_UIUX) (fileKey: `MxyagR7eWWYbElFNGoRN3Z`)  
> **상세 토큰**: `/templates/krds-design-system.md`
>
> **실측 치수 기준** (Figma 직접 측정):
> - 캔버스 전체 너비: **1920px**
> - 콘텐츠 Inner 너비: **1280px** (좌우 여백 각 320px)
> - 헤더 전체 높이: **204px** (TOP bar 96px + Nav bar 108px)
> - Mobile: **390×844px** (헤더 96px)

---

## Figma 파일 구조 규칙

### 파일 · 페이지 · 섹션 · 프레임 계층

```
Figma 파일 ({프로젝트명})
├── Page: FO (Front Office)
│   ├── Section: {1depth 메뉴명 A}
│   │   ├── Frame: {FO-A-01 화면명}  1440×1024px
│   │   ├── Frame: {FO-A-02 화면명}  1440×1024px
│   │   └── Frame: {FO-A-03 화면명}  1440×1024px
│   ├── Section: {1depth 메뉴명 B}
│   │   └── Frame: {FO-B-01 화면명}  1440×1024px
│   └── ...
├── Page: BO (Back Office)
│   ├── Section: {1depth 메뉴명 A}
│   │   └── Frame: {BO-A-01 화면명}  1440×900px
│   └── ...
└── Page: Components
    └── (공통 컴포넌트 정의)
```

### 명칭 규칙

| 대상 | 명칭 형식 | 예시 |
|------|---------|------|
| Figma 파일 | 프로젝트명 그대로 | `아데오 코퍼레이션 웹사이트` |
| FO Page | `FO (Front Office)` | — |
| BO Page | `BO (Back Office)` | — |
| Components Page | `Components` | — |
| Section | 1depth 메뉴명 | `회사소개`, `사업영역` |
| FO Frame | `{화면ID} {화면명}` | `FO-1-01 인사말` |
| BO Frame | `{화면ID} {화면명}` | `BO-1-01 대시보드` |

### 배치 규칙

| 대상 | 배치 방향 | 간격 |
|------|---------|------|
| Section | 좌 → 우 | 1200px |
| Frame (Section 내) | 위 → 아래 | 800px |

---

## Frame 내부 레이어 구조 규칙

### FO Frame 레이어 트리

```
Frame (FO-N-NN 화면명)  [1440×1024px]
├── GNB (Height: 80px, Fill: #FFFFFF, Stroke bottom: #E0E2EA 1px)
│   ├── Inner (Max-width: 1200px, Auto Layout Row, align: center)
│   │   ├── Logo (Rectangle 140×40, Fill: #256EF4)
│   │   ├── NavMenu (Auto Layout Row, gap: 32)
│   │   │   └── NavItem × N (Text 17px Regular #1A1E2B / Active: #256EF4 + border-bottom)
│   │   └── AuthGroup (Auto Layout Row, gap: 8)
│   │       ├── LoginBtn (Tertiary Button, 15px)
│   │       └── SignupBtn (Primary Button, Small)
├── ContentArea (Auto Layout Column, width: 100%)
│   └── {화면 유형별 구성 — 아래 섹션 참조}
└── Footer (Height: 200px, Fill: #1A1E2B)
    ├── Inner (Max-width: 1200px)
    │   ├── LogoArea (Logo + 기관명 Text 17px #FFFFFF)
    │   ├── FooterNav (Auto Layout Row, gap: 24)
    │   │   └── NavLink × N (Text 15px #B0B5C4)
    │   └── CompanyInfo (Text 14px #6B7280, line-height: 160%)
    └── Copyright (Text 13px #6B7280, border-top: #373D4D)
```

### BO Frame 레이어 트리

```
Frame (BO-N-NN 화면명)  [1440×900px]
├── Sidebar (Width: 240px, Height: 900px, Fill: #1A1E2B)
│   ├── LogoArea (Height: 64px, Fill: #256EF4)
│   │   └── Logo + SiteName (Text 17px Bold #FFFFFF)
│   └── MenuList (Auto Layout Column, gap: 4, Padding: 16px 12px)
│       └── MenuItem × N (Height: 44px, Radius: 4px)
│           └── Active: Fill #256EF4, Text 15px SemiBold #FFFFFF
│           └── Default: Text 15px Regular #B0B5C4, Hover: Fill #373D4D
├── TopBar (Height: 56px, Fill: #FFFFFF, Stroke bottom: #E0E2EA 1px)
│   ├── PageTitle (Text 20px Bold #1A1E2B)
│   ├── Breadcrumb (Text 14px #6B7280)
│   └── AdminProfile (Avatar 32×32 + Text 15px #1A1E2B + 로그아웃 Link)
└── ContentArea (Fill: #F7F8FA, Padding: 32px)
    └── {화면 유형별 구성}
```

---

## 화면 유형별 Content Area 구성

### 메인(홈) 페이지

```
ContentArea
├── HeroBanner (Width: 1440, Height: 560)
│   ├── BannerImage (Fill: #E0E2EA placeholder)
│   ├── Overlay (Fill: rgba(26,30,43,0.5))
│   ├── Title (Text 48px Bold #FFFFFF, line-height: 120%)
│   ├── Subtitle (Text 19px Regular #F7F8FA, line-height: 160%)
│   └── CTAButton (Primary Button, Large: Height 56px)
├── Section1 (Padding: 80px 0, Inner max-width: 1200px)
│   ├── SectionTitle (Text 32px Bold #1A1E2B)
│   ├── SectionDesc (Text 17px Regular #6B7280)
│   └── CardGrid (3-column Auto Layout, gap: 24px)
├── Section2 (Padding: 80px 0, Fill: #F7F8FA)
└── Section3 (Padding: 80px 0)
```

### 리스트 페이지

```
ContentArea (Padding: 64px 0)
├── Inner (max-width: 1200px, Auto Layout Column, gap: 32)
│   ├── PageHeader
│   │   ├── Breadcrumb (Text 14px #6B7280, Separator: ">")
│   │   ├── PageTitle (Text 36px Bold #1A1E2B)
│   │   └── FilterRow (Auto Layout Row, gap: 12)
│   │       ├── FilterSelect (Width: 140px, Height: 48px)
│   │       └── SortSelect (Width: 120px, Height: 48px)
│   ├── CardGrid (3-column, gap: 24px)
│   │   └── Card × N (Width: 384, Radius: 8px)
│   │       ├── CardImage (Height: 216px, Radius: 8px 8px 0 0)
│   │       ├── CardBody (Padding: 20px)
│   │       │   ├── Category (Badge — Primary 배지, 14px)
│   │       │   ├── CardTitle (Text 19px SemiBold #1A1E2B)
│   │       │   └── CardMeta (Text 14px Regular #6B7280)
│   │       └── Card Hover: Shadow 0 4px 16px rgba(0,0,0,0.12)
│   └── Pagination (Auto Layout Row, gap: 4, justify: center)
│       └── PageBtn × N (Size: 40×40px, Radius: 4px)
│           └── Active: Fill #256EF4, Text #FFFFFF
│           └── Default: Fill #FFFFFF, Text #1A1E2B, Stroke #E0E2EA
```

### 상세 페이지

```
ContentArea (Padding: 64px 0)
├── Inner (max-width: 1200px)
│   ├── Breadcrumb (Text 14px #6B7280)
│   ├── DetailHeader (gap: 16)
│   │   ├── Category (Badge)
│   │   ├── Title (Text 36px Bold #1A1E2B, line-height: 130%)
│   │   └── MetaInfo (Text 14px Regular #6B7280 — 작성일, 조회수 등)
│   ├── ContentImage (Width: 1200, Radius: 8px, Max-height: 480px)
│   ├── Body (max-width: 800px, margin: 0 auto)
│   │   └── BodyText (Text 17px Regular #373D4D, line-height: 160%)
│   ├── Divider (Fill: #E0E2EA, Height: 1px)
│   └── RelatedContent
│       ├── RelatedTitle (Text 24px Bold #1A1E2B)
│       └── RelatedList (3-column CardGrid)
```

### 폼(입력) 페이지

```
ContentArea (Padding: 64px 0)
├── Inner (max-width: 800px)
│   ├── Breadcrumb
│   ├── FormTitle (Text 32px Bold #1A1E2B)
│   ├── RequiredNote (Text 14px #6B7280 — "* 필수항목")
│   └── Form (Auto Layout Column, gap: 24)
│       ├── FormField × N
│       │   ├── Label (Text 15px SemiBold #373D4D + Required * #C40A0A)
│       │   ├── Input (Width: 100%, Height: 48px, Radius: 4px)
│       │   │   └── Default: Stroke #E0E2EA / Focus: Stroke #256EF4 2px
│       │   └── HelperText (Text 14px #6B7280 / Error: #C40A0A)
│       └── ButtonGroup (Auto Layout Row, gap: 8, justify: end)
│           ├── CancelBtn (Secondary Button)
│           └── SubmitBtn (Primary Button)
```

### BO 목록 페이지

```
ContentArea
├── PageHeader (Auto Layout Row, justify: space-between, margin-bottom: 24)
│   ├── TitleGroup
│   │   ├── PageTitle (Text 20px Bold #1A1E2B)
│   │   └── CountBadge (Neutral 배지 — "총 N건")
│   └── ActionGroup (Auto Layout Row, gap: 8)
│       ├── SearchInput (Width: 240px, Height: 40px)
│       └── RegisterBtn (Primary Button, Small)
├── DataTable (Width: 100%, Radius: 8px, Fill: #FFFFFF, Stroke: #E0E2EA)
│   ├── TableHeader (Fill: #F7F8FA, Height: 48px, Stroke bottom: #E0E2EA)
│   │   └── HeaderCell × N (Text 15px SemiBold #373D4D, Padding: 0 16px)
│   └── TableRow × N (Height: 56px, Stroke bottom: #F0F1F5)
│       └── DataCell × N (Text 15px Regular #1A1E2B, Padding: 0 16px)
│           └── Row Hover: Fill #F7F8FA
└── Pagination
```

### BO 등록/수정 폼

```
ContentArea
├── FormCard (Fill: #FFFFFF, Radius: 8px, Padding: 32px, Stroke: #E0E2EA)
│   ├── SectionTitle (Text 17px SemiBold #1A1E2B, border-bottom: #E0E2EA, padding-bottom: 16px)
│   └── FieldGrid (2-column, gap: 24)
│       └── FormField × N (동일 FO 폼 필드 규격)
└── ActionBar (Fill: #FFFFFF, Stroke top: #E0E2EA, Padding: 16px 32px)
    ├── DeleteBtn (Danger — Fill: #C40A0A, Text: #FFFFFF, 수정 시만 표시)
    └── ButtonGroup (Auto Layout Row, gap: 8)
        ├── CancelBtn (Secondary Button)
        └── SaveBtn (Primary Button)
```

---

## 컴포넌트 스타일 규칙 (KRDS v1.0.0)

### 색상 토큰

| 토큰 | Hex | KRDS Token | 사용처 |
|------|-----|-----------|-------|
| Primary | `#256EF4` | primary-50 | CTA 버튼, 링크, 활성 메뉴 |
| Primary Hover | `#0B50D0` | primary-60 | 버튼 Hover/Active |
| Primary Light | `#EBF1FF` | — | 배지 배경, 활성 행 |
| Text Base | `#1A1E2B` | gray-90 | 제목, 주요 텍스트 |
| Text Body | `#373D4D` | gray-80 | 본문 텍스트 |
| Text Sub | `#6B7280` | gray-60 | 부제목, 메타 정보 |
| Text Disabled | `#B0B5C4` | gray-40 | 비활성, Placeholder |
| Border | `#E0E2EA` | gray-20 | 구분선, 입력 테두리 |
| Border Strong | `#B0B5C4` | gray-40 | 강조 테두리 |
| Background | `#F7F8FA` | gray-05 | 섹션·테이블 헤더 배경 |
| Surface | `#FFFFFF` | gray-00 | 카드, 모달 배경 |
| Danger | `#C40A0A` | danger | 삭제 버튼, 에러 |
| Success | `#1B7F3E` | success | 성공 상태 |
| Warning | `#C45000` | warning | 경고 상태 |

### 타이포그래피 (KRDS 타입 스케일)

| 용도 | 크기 | 굵기 | 행간 | KRDS Token |
|------|------|------|------|-----------|
| 히어로 제목 | 48px | Bold 700 | 120% | display-lg |
| 페이지 제목 | 36px | Bold 700 | 130% | display-md |
| 섹션 제목 | 28–32px | Bold 700 | 130% | display-sm ~ heading-lg |
| 카드 제목 | 19–20px | SemiBold 600 | 150% | heading-sm |
| 기본 본문 | **17px** | Regular 400 | **160%** | **body-md** |
| 보조 본문 | 15px | Regular 400 | 160% | body-sm |
| 라벨 / 버튼 | 17px | SemiBold 600 | 150% | label-lg |
| 소형 라벨 | 15px | SemiBold 600 | 150% | label-md |
| 캡션 / 메타 | 14px | Regular 400 | 150% | caption-lg |
| 주석 | 13px | Regular 400 | 150% | caption-sm |

> **핵심**: 기본 본문은 반드시 **17px** (16px 금지 — Pretendard GOV 시각 크기 보정)

### 공통 버튼 규격 (KRDS 기준)

| 유형 | Fill | Text | Border | Radius | Padding V×H | Height |
|------|------|------|--------|--------|-------------|--------|
| Primary | `#256EF4` | `#FFFFFF` | — | **4px** | 12×24px | **48px** |
| Primary Hover | `#0B50D0` | `#FFFFFF` | — | 4px | 12×24px | 48px |
| Secondary | `#FFFFFF` | `#256EF4` | `#256EF4` 1px | 4px | 12×24px | 48px |
| Tertiary (Text) | transparent | `#256EF4` | — | 4px | 12×16px | 48px |
| Disabled | `#F0F1F5` | `#B0B5C4` | — | 4px | 12×24px | 48px |
| Danger | `#C40A0A` | `#FFFFFF` | — | 4px | 12×24px | 48px |
| Small (각 유형) | — | — | — | 4px | 8×16px | **40px** |

> 모바일 최소 터치 영역: **44×44px** 확보 필수

### 입력 필드

| 항목 | 값 |
|------|---|
| 높이 | 48px |
| Radius | 4px |
| 배경 | `#FFFFFF` |
| 기본 테두리 | `#E0E2EA` 1px |
| Focus 테두리 | `#256EF4` 2px |
| Error 테두리 | `#C40A0A` 1px |
| 텍스트 | `#1A1E2B`, 17px |
| Placeholder | `#B0B5C4`, 17px |
| Label | `#373D4D`, 15px, Weight 600 |

### 카드

| 항목 | 값 |
|------|---|
| 배경 | `#FFFFFF` |
| 테두리 | `#E0E2EA` 1px, Radius **8px** |
| Shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| 패딩 | 24px |
| Hover Shadow | `0 4px 16px rgba(0,0,0,0.12)` |

### 배지 / 태그

| 구분 | 배경 | 텍스트 | Radius |
|------|------|--------|--------|
| Primary | `#EBF1FF` | `#256EF4` | 999px |
| Success | `#E6F7EE` | `#1B7F3E` | 999px |
| Warning | `#FFF3E8` | `#C45000` | 999px |
| Danger | `#FFECEC` | `#C40A0A` | 999px |
| Neutral | `#F0F1F5` | `#6B7280` | 999px |

---

## 어노테이션(Annotation) 규칙

각 Frame에 다음 어노테이션을 Sticky-note 스타일 Rectangle로 추가한다.

| 어노테이션 유형 | Fill | 위치 | 내용 |
|-------------|------|------|------|
| 화면 정보 | `#FEF9C3` (노란색) | Frame 우측 상단 외부 | 화면ID / URL / 로그인 필요 여부 |
| 기능 설명 | `#DBEAFE` (파란색) | 해당 컴포넌트 근처 | 클릭/입력 시 동작 설명 |
| 조건 분기 | `#FCE7F3` (분홍색) | 해당 영역 근처 | 로그인 전/후, 권한별 차이 |
| BO 연동 | `#D1FAE5` (초록색) | 해당 콘텐츠 근처 | BO 관리 화면 ID 명시 |

---

## 접근성 준수 (KWCAG 2.2 기준)

| 항목 | 기준 |
|------|------|
| 일반 텍스트 대비 | 4.5:1 이상 |
| 큰 텍스트 (18pt+) 대비 | 3:1 이상 |
| 포커스 인디케이터 대비 | 3:1 이상 |
| 최소 터치 영역 | 44×44px |
| 줄 간격 | 160% (KRDS body 기준) |

---

## 반응형 처리 규칙

각 2depth 화면(Frame)에 대해 모바일 변형이 필요한 경우:
- 동일 Section 내 PC Frame 우측에 추가 Frame 생성
- Mobile Frame 크기: **390×844px** (iPhone 14 기준)
- Frame 명칭: `{화면ID} {화면명} — Mobile`

**모바일 주요 변경 사항 (KRDS 그리드: 4컬럼, 사이드마진: 20px)**:

| 항목 | PC | Mobile |
|------|----|----|
| GNB | 80px 전체 너비 | 56px + 햄버거 메뉴 (32×32px) |
| 콘텐츠 여백 | 좌우 각 120px | 좌우 각 20px |
| 카드 그리드 | 3컬럼 | 1컬럼 |
| 폼 필드 | 2컬럼 (BO) / 800px 중앙 | 1컬럼 100% 너비 |
| 버튼 | 자동 너비 | Full Width (100%) |
| 글자 크기 | 규격 그대로 | body-md 17px 유지 (캡션은 14px) |
