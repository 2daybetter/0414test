# 화면설계서 작성 규칙 (Figma 기반)

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
Frame (FO-N-NN 화면명)
├── GNB (Height: 80px, Fill: #FFFFFF, Stroke bottom: #E5E7EB)
│   ├── Logo (Rectangle 120×40, Fill: #1A56DB)
│   ├── NavMenu (Auto Layout Row, gap 32)
│   │   └── NavItem × N (Text 16px Regular #111827)
│   └── AuthGroup (Auto Layout Row, gap 12)
│       ├── LoginBtn (Secondary Button)
│       └── SignupBtn (Primary Button)
├── ContentArea (Auto Layout Column)
│   └── {화면 유형별 구성 — 아래 섹션 참조}
└── Footer (Height: 160px, Fill: #111827)
    ├── CompanyInfo (Text 14px Regular #9CA3AF)
    └── Links (Auto Layout Row, gap 24)
```

### BO Frame 레이어 트리

```
Frame (BO-N-NN 화면명)
├── Sidebar (Width: 220px, Height: 900px, Fill: #1E293B)
│   ├── Logo+Name (Height: 64px)
│   └── MenuList (Auto Layout Column, gap 4)
│       └── MenuItem × N (Height 40px, Text 14px #94A3B8)
├── TopBar (Height: 56px, Fill: #FFFFFF, Stroke bottom: #E5E7EB)
│   ├── PageTitle (Text 20px SemiBold #111827)
│   ├── NotificationIcon (24×24px)
│   └── AdminProfile (Avatar 32×32 + Text 14px)
└── ContentArea (Fill: #F9FAFB, Padding: 32px)
    └── {화면 유형별 구성}
```

---

## 화면 유형별 Content Area 구성

### 메인(홈) 페이지

```
ContentArea
├── HeroBanner (Width: 1440, Height: 560)
│   ├── BannerImage (Fill placeholder #E5E7EB)
│   ├── Title (Text 48px Bold #FFFFFF)
│   ├── Subtitle (Text 20px Regular #F3F4F6)
│   └── CTAButton (Primary Button, Large)
├── Section1 (Padding: 80px 120px)
│   ├── SectionTitle (Text 36px Bold)
│   └── CardGrid (3-column Auto Layout)
├── Section2 (Padding: 80px 120px, Fill: #F9FAFB)
└── Section3 (Padding: 80px 120px)
```

### 리스트 페이지

```
ContentArea (Padding: 60px 120px)
├── PageHeader
│   ├── PageTitle (Text 32px Bold)
│   └── FilterRow (Auto Layout Row)
│       ├── FilterDropdown (Width: 140px)
│       └── SortDropdown (Width: 120px)
├── CardGrid (3-column, gap 24)
│   └── Card × N (Width: 384, Radius: 12px)
│       ├── CardImage (Height: 200px)
│       ├── CardTitle (Text 18px SemiBold)
│       └── CardMeta (Text 14px #6B7280)
└── Pagination (Auto Layout Row, gap 8)
    └── PageBtn × N (40×40px)
```

### 상세 페이지

```
ContentArea (Padding: 60px 120px)
├── Breadcrumb (Text 14px #6B7280)
├── DetailHeader
│   ├── Title (Text 36px Bold)
│   └── MetaInfo (Text 14px #6B7280)
├── ContentImage (Width: 1200, Height: 480, Radius: 12px)
├── Body (Width: 800, Max-width)
│   └── BodyText (Text 16px Regular #374151, line-height 1.75)
└── RelatedContent
    ├── RelatedTitle (Text 24px Bold)
    └── RelatedList (3-column CardGrid)
```

### 폼(입력) 페이지

```
ContentArea (Padding: 60px 120px)
├── Breadcrumb
├── FormTitle (Text 32px Bold)
└── Form (Width: 800, Auto Layout Column, gap 24)
    ├── FormField × N
    │   ├── Label (Text 14px SemiBold #374151)
    │   ├── Input (Width: 100%, Height: 48px)
    │   └── HelperText (Text 12px #9CA3AF, optional)
    └── ButtonGroup (Auto Layout Row, gap 12, justify: end)
        ├── CancelBtn (Secondary Button)
        └── SubmitBtn (Primary Button)
```

### BO 목록 페이지

```
ContentArea
├── PageHeader
│   ├── Title + Count Badge
│   └── ActionGroup (검색 Input + 등록 Button)
├── DataTable (Width: 100%, Radius: 12px, Fill: #FFFFFF)
│   ├── TableHeader (Fill: #F9FAFB, Height: 48px)
│   │   └── HeaderCell × N (Text 14px SemiBold)
│   └── TableRow × N (Height: 56px, Stroke bottom: #F3F4F6)
│       └── DataCell × N (Text 14px Regular)
└── Pagination
```

### BO 등록/수정 폼

```
ContentArea
├── FormCard (Fill: #FFFFFF, Radius: 12px, Padding: 32px)
│   ├── SectionTitle (Text 18px SemiBold)
│   └── FieldGrid (2-column, gap 24)
│       └── FormField × N
└── ActionBar (Stroke top: #E5E7EB, Padding: 16px 32px)
    ├── DeleteBtn (Danger — Fill: #FEE2E2, Text: #DC2626, 수정 시만 표시)
    └── ButtonGroup
        ├── CancelBtn
        └── SaveBtn (Primary Button)
```

---

## 컴포넌트 스타일 규칙

### 색상 토큰

| 토큰 | Hex | 사용처 |
|------|-----|-------|
| Primary | #1A56DB | CTA 버튼, 링크, 활성 메뉴 |
| Primary Light | #EBF5FF | 버튼 Hover, 배지 배경 |
| Text Primary | #111827 | 본문 제목 |
| Text Secondary | #6B7280 | 부제목, 메타정보 |
| Text Muted | #9CA3AF | 플레이스홀더, 도움말 |
| Border | #E5E7EB | 구분선, 인풋 테두리 |
| Background | #F9FAFB | 섹션 배경, 테이블 헤더 |
| Surface | #FFFFFF | 카드, 모달 배경 |
| Danger | #DC2626 | 삭제 버튼, 에러 메시지 |
| Success | #059669 | 성공 상태 |

### 타이포그래피

| 용도 | 크기 | 굵기 | 행간 |
|------|------|------|------|
| 페이지 제목 | 36–48px | Bold (700) | 1.2 |
| 섹션 제목 | 28–32px | Bold (700) | 1.3 |
| 카드 제목 | 18–20px | SemiBold (600) | 1.4 |
| 본문 | 16px | Regular (400) | 1.75 |
| 부제목 / 라벨 | 14px | Medium (500) | 1.5 |
| 캡션 / 도움말 | 12px | Regular (400) | 1.5 |

### 공통 버튼 규격

| 유형 | Fill | Text 색상 | Radius | Padding (V×H) | Height |
|------|------|---------|--------|--------------|--------|
| Primary | #1A56DB | #FFFFFF | 8px | 12×24px | 48px |
| Secondary | transparent + Stroke #1A56DB | #1A56DB | 8px | 12×24px | 48px |
| Ghost | transparent | #374151 | 8px | 12×24px | 48px |
| Danger | #FEE2E2 + Stroke #DC2626 | #DC2626 | 8px | 12×24px | 48px |
| Small (각 유형) | — | — | 6px | 8×16px | 36px |

---

## 어노테이션(Annotation) 규칙

각 Frame에 다음 어노테이션을 Sticky-note 스타일 Rectangle로 추가한다:

| 어노테이션 유형 | Fill | 위치 | 내용 |
|-------------|------|------|------|
| 화면 정보 | #FEF9C3 (노란색) | Frame 우측 상단 외부 | 화면ID / URL / 로그인 필요 여부 |
| 기능 설명 | #DBEAFE (파란색) | 해당 컴포넌트 근처 | 클릭/입력 시 동작 설명 |
| 조건 분기 | #FCE7F3 (분홍색) | 해당 영역 근처 | 로그인 전/후, 권한별 차이 |
| BO 연동 | #D1FAE5 (초록색) | 해당 콘텐츠 근처 | BO 관리 화면 ID 명시 |

---

## 반응형 처리 규칙

각 2depth 화면(Frame)에 대해 PC 외 모바일 변형이 필요한 경우:
- 동일 Section 내 Frame 우측에 추가 Frame 생성
- Mobile Frame 크기: 390 × 844px (iPhone 14 기준)
- Frame 명칭: `{화면ID} {화면명} — Mobile`

**모바일 주요 변경 사항**:
- GNB → 햄버거 메뉴 (3-line icon, 32×32px)
- 3컬럼 카드 그리드 → 1컬럼
- 폼 필드 → 전체 너비 (100%)
- 버튼 → 전체 너비 (Full Width)
