# KRDS v1.0.0 디자인 시스템 레퍼런스

> 출처: [한국 디지털 정부 디자인 시스템 (KRDS)](https://www.krds.go.kr)  
> Figma Community: [KRDS_v1.0.0](https://www.figma.com/community/file/G6q3ztswfIyJgtWeAUZjlq)  
> 아데오 에이전트 시스템 — Figma·HTML·대시보드 산출물 생성 시 이 시스템을 기본 디자인 토큰으로 사용한다.

---

## 1. 색상 시스템 (Color Tokens)

### 1.1 Primary (정부 블루)

| Token | CSS Variable | Hex | 용도 |
|-------|-------------|-----|------|
| primary-30 | `--krds-color-primary-30` | `#6B9FFF` | Hover 강조 배경 |
| primary-40 | `--krds-color-primary-40` | `#4A7EF9` | Hover 상태 (3:1 contrast) |
| **primary-50** | `--krds-color-primary-50` | **`#256EF4`** | **메인 CTA, 브랜드 컬러 (기본값)** |
| primary-60 | `--krds-color-primary-60` | `#0B50D0` | Active / Pressed (4.5:1) |
| primary-70 | `--krds-color-primary-70` | `#0A3EA8` | Dark 강조 (7:1) |
| primary-90 | `--krds-color-primary-90` | `#001B66` | 최고 대비 (15:1) |

### 1.2 Semantic Colors

| 역할 | CSS Variable | Hex | 용도 |
|------|-------------|-----|------|
| Success | `--krds-color-success` | `#1B7F3E` | 성공, 완료 |
| Warning | `--krds-color-warning` | `#C45000` | 경고 |
| Danger | `--krds-color-danger` | `#C40A0A` | 오류, 위험 |
| Info | `--krds-color-info` | `#256EF4` | 정보 (Primary 동일) |

### 1.3 Neutral (Gray)

| Token | CSS Variable | Hex | 용도 |
|-------|-------------|-----|------|
| gray-00 | `--krds-color-gray-00` | `#FFFFFF` | 기본 배경 |
| gray-05 | `--krds-color-gray-05` | `#F7F8FA` | 섹션 배경 |
| gray-10 | `--krds-color-gray-10` | `#F0F1F5` | 비활성 배경 |
| gray-20 | `--krds-color-gray-20` | `#E0E2EA` | 테두리, 구분선 |
| gray-40 | `--krds-color-gray-40` | `#B0B5C4` | Placeholder |
| gray-60 | `--krds-color-gray-60` | `#6B7280` | 보조 텍스트 |
| gray-80 | `--krds-color-gray-80` | `#373D4D` | 본문 텍스트 |
| gray-90 | `--krds-color-gray-90` | `#1A1E2B` | 제목 텍스트 |
| gray-100 | `--krds-color-gray-100` | `#0D0F14` | 최고 대비 텍스트 |

### 1.4 Semantic (Semantic Tokens — 용도별)

| Semantic Token | Primitive 참조 | 용도 |
|----------------|--------------|------|
| `--krds-color-bg-default` | gray-00 `#FFFFFF` | 기본 페이지 배경 |
| `--krds-color-bg-subtle` | gray-05 `#F7F8FA` | 카드·섹션 배경 |
| `--krds-color-text-default` | gray-90 `#1A1E2B` | 기본 텍스트 |
| `--krds-color-text-subtle` | gray-60 `#6B7280` | 보조 텍스트 |
| `--krds-color-text-disabled` | gray-40 `#B0B5C4` | 비활성 텍스트 |
| `--krds-color-border-default` | gray-20 `#E0E2EA` | 기본 테두리 |
| `--krds-color-border-strong` | gray-40 `#B0B5C4` | 강조 테두리 |
| `--krds-color-icon-primary` | primary-50 `#256EF4` | 주요 아이콘 |
| `--krds-color-icon-default` | gray-80 `#373D4D` | 기본 아이콘 |

---

## 2. 타이포그래피 (Typography)

### 2.1 폰트 패밀리

| 구분 | 폰트명 | CDN |
|------|-------|-----|
| **기본** | **Pretendard GOV** | `npm install pretendard-gov` |
| 대체 | Pretendard Variable | Google Fonts / CDN |

```css
/* Pretendard GOV CDN */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-gov.css');
font-family: 'Pretendard GOV', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### 2.2 타입 스케일

| 카테고리 | Token | CSS Variable | Size | Weight | Line Height | 용도 |
|----------|-------|-------------|------|--------|-------------|------|
| **Display** | display-xl | `--krds-fs-display-xl` | 60px | 700 | 120% | 랜딩 히어로 |
| Display | display-lg | `--krds-fs-display-lg` | 48px | 700 | 120% | 섹션 타이틀 |
| Display | display-md | `--krds-fs-display-md` | 36px | 700 | 130% | 페이지 제목 |
| Display | display-sm | `--krds-fs-display-sm` | 28px | 700 | 130% | 서브 타이틀 |
| **Heading** | heading-xl | `--krds-fs-heading-xl` | 40px | 700 | 140% | H1 |
| Heading | heading-lg | `--krds-fs-heading-lg` | 32px | 700 | 140% | H2 |
| Heading | heading-md | `--krds-fs-heading-md` | 24px | 700 | 150% | H3 |
| Heading | heading-sm | `--krds-fs-heading-sm` | 20px | 600 | 150% | H4 |
| Heading | heading-xs | `--krds-fs-heading-xs` | 17px | 600 | 150% | H5 |
| **Body** | **body-lg** | `--krds-fs-body-lg` | **19px** | 400 | **160%** | 본문 Large |
| Body | **body-md** | `--krds-fs-body-md` | **17px** | 400 | **160%** | **기본 본문** |
| Body | body-sm | `--krds-fs-body-sm` | 15px | 400 | 160% | 보조 본문 |
| **Label** | label-lg | `--krds-fs-label-lg` | 17px | 600 | 150% | 버튼, 탭 레이블 |
| Label | label-md | `--krds-fs-label-md` | 15px | 600 | 150% | 소형 버튼 레이블 |
| **Caption** | caption-lg | `--krds-fs-caption-lg` | 14px | 400 | 150% | 캡션, 메타 정보 |
| Caption | caption-sm | `--krds-fs-caption-sm` | 13px | 400 | 150% | 주석 |

> **핵심 규칙**: 기본 본문 크기는 **17px** (Pretendard GOV의 시각적 크기가 작아 16px 대신 17px 사용)

---

## 3. 스페이싱 토큰 (Spacing — 8px Grid)

| Token | CSS Variable | Value | 용도 |
|-------|-------------|-------|------|
| spacing-1 | `--krds-spacing-1` | 4px | 미세 간격 |
| spacing-2 | `--krds-spacing-2` | 8px | 기본 단위 |
| spacing-3 | `--krds-spacing-3` | 12px | |
| spacing-4 | `--krds-spacing-4` | 16px | 컴포넌트 내부 패딩 |
| spacing-5 | `--krds-spacing-5` | 20px | |
| spacing-6 | `--krds-spacing-6` | 24px | 카드 패딩, 섹션 간격 |
| spacing-8 | `--krds-spacing-8` | 32px | |
| spacing-10 | `--krds-spacing-10` | 40px | 섹션 내부 여백 |
| spacing-12 | `--krds-spacing-12` | 48px | 섹션 간 여백 |
| spacing-16 | `--krds-spacing-16` | 64px | 대형 섹션 여백 |
| spacing-20 | `--krds-spacing-20` | 80px | 페이지 상하 패딩 |
| spacing-24 | `--krds-spacing-24` | 96px | |

---

## 4. 그리드 & 레이아웃

| 구분 | Breakpoint | 컬럼 수 | 거터 | 사이드 마진 | 최대 너비 |
|------|-----------|--------|------|-----------|---------|
| Mobile | ~ 767px | 4 | 16px | 20px | — |
| Tablet | 768 ~ 1199px | 8 | 24px | 32px | — |
| PC | 1200px ~ | 12 | 24px | 40px | 1440px |

---

## 5. 컴포넌트 스타일 토큰

### 5.1 버튼

| 구분 | Fill | Text | Border | Radius | Padding | Min Height |
|------|------|------|--------|--------|---------|-----------|
| Primary | `#256EF4` | `#FFFFFF` | — | 4px | 12px 24px | 48px |
| Primary Hover | `#0B50D0` | `#FFFFFF` | — | 4px | 12px 24px | 48px |
| Secondary | `#FFFFFF` | `#256EF4` | `#256EF4` 1px | 4px | 12px 24px | 48px |
| Tertiary (Text) | transparent | `#256EF4` | — | 4px | 12px 16px | 48px |
| Disabled | `#F0F1F5` | `#B0B5C4` | — | 4px | 12px 24px | 48px |
| Danger | `#C40A0A` | `#FFFFFF` | — | 4px | 12px 24px | 48px |

> 최소 터치 영역: **44px × 44px** (모바일 접근성)

### 5.2 입력 필드

| 항목 | 값 |
|------|---|
| 높이 | 48px |
| 배경 | `#FFFFFF` |
| 테두리 | `#E0E2EA` 1px, Radius 4px |
| Focus 테두리 | `#256EF4` 2px |
| Error 테두리 | `#C40A0A` 1px |
| 텍스트 | `#1A1E2B`, 17px |
| Placeholder | `#B0B5C4` |
| Label | `#373D4D`, 15px, Weight 600 |

### 5.3 카드

| 항목 | 값 |
|------|---|
| 배경 | `#FFFFFF` |
| 테두리 | `#E0E2EA` 1px, Radius 8px |
| Shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| 패딩 | 24px |
| Hover Shadow | `0 4px 16px rgba(0,0,0,0.12)` |

### 5.4 배지 / 태그

| 구분 | 배경 | 텍스트 | Radius |
|------|------|--------|--------|
| Primary | `#EBF1FF` | `#256EF4` | 999px |
| Success | `#E6F7EE` | `#1B7F3E` | 999px |
| Warning | `#FFF3E8` | `#C45000` | 999px |
| Danger | `#FFECEC` | `#C40A0A` | 999px |
| Neutral | `#F0F1F5` | `#6B7280` | 999px |

---

## 6. 접근성 기준 (KWCAG 2.2 / WCAG 2.1 AA)

| 기준 | 값 |
|------|---|
| 일반 텍스트 대비 | 4.5:1 이상 |
| 큰 텍스트 (18pt+) 대비 | 3:1 이상 |
| 포커스 인디케이터 대비 | 3:1 이상 |
| 최소 터치 영역 | 44px × 44px |
| 줄 간격 | 150% 이상 |

---

## 7. Figma 산출물 적용 기준

Figma 플러그인 코드 작성 시 아래 색상 변수를 사용한다.

```javascript
// KRDS 색상 팔레트 (Figma Plugin)
const KRDS = {
  primary:   { r: 37/255,  g: 110/255, b: 244/255 }, // #256EF4
  primaryDk: { r: 11/255,  g: 80/255,  b: 208/255 }, // #0B50D0
  textBase:  { r: 26/255,  g: 30/255,  b: 43/255  }, // #1A1E2B
  textSub:   { r: 107/255, g: 114/255, b: 128/255 }, // #6B7280
  bgDefault: { r: 1,       g: 1,       b: 1        }, // #FFFFFF
  bgSubtle:  { r: 247/255, g: 248/255, b: 250/255 }, // #F7F8FA
  border:    { r: 224/255, g: 226/255, b: 234/255 }, // #E0E2EA
  success:   { r: 27/255,  g: 127/255, b: 62/255  }, // #1B7F3E
  warning:   { r: 196/255, g: 80/255,  b: 0       }, // #C45000
  danger:    { r: 196/255, g: 10/255,  b: 10/255  }, // #C40A0A
};
```

---

## 8. Google Apps Script / HTML 대시보드 적용 기준

대시보드 및 스프레드시트 스타일링 시 아래 변수를 사용한다.

```javascript
// KRDS 색상 상수 (Google Apps Script / HTML)
const KRDS_PRIMARY      = '#256EF4';
const KRDS_PRIMARY_DK   = '#0B50D0';
const KRDS_TEXT_BASE    = '#1A1E2B';
const KRDS_TEXT_SUB     = '#6B7280';
const KRDS_BG_DEFAULT   = '#FFFFFF';
const KRDS_BG_SUBTLE    = '#F7F8FA';
const KRDS_BORDER       = '#E0E2EA';
const KRDS_SUCCESS      = '#1B7F3E';
const KRDS_WARNING      = '#C45000';
const KRDS_DANGER       = '#C40A0A';
const KRDS_HEADER_BG    = '#256EF4'; // 헤더 배경
const KRDS_HEADER_TEXT  = '#FFFFFF'; // 헤더 텍스트
const KRDS_ROW_ODD      = '#FFFFFF'; // 홀수 행
const KRDS_ROW_EVEN     = '#F7F8FA'; // 짝수 행
```

```html
<!-- HTML 대시보드 CSS 변수 -->
<style>
  :root {
    --krds-color-primary:     #256EF4;
    --krds-color-primary-dk:  #0B50D0;
    --krds-color-text:        #1A1E2B;
    --krds-color-text-sub:    #6B7280;
    --krds-color-bg:          #FFFFFF;
    --krds-color-bg-subtle:   #F7F8FA;
    --krds-color-border:      #E0E2EA;
    --krds-color-success:     #1B7F3E;
    --krds-color-warning:     #C45000;
    --krds-color-danger:      #C40A0A;
    --krds-font:              'Pretendard GOV', 'Pretendard Variable', system-ui, sans-serif;
    --krds-fs-base:           17px;
    --krds-radius-sm:         4px;
    --krds-radius-md:         8px;
    --krds-radius-full:       999px;
  }
  body { font-family: var(--krds-font); font-size: var(--krds-fs-base); color: var(--krds-color-text); }
</style>
```

---

## 참고 링크

| 리소스 | URL |
|--------|-----|
| KRDS 공식 | https://www.krds.go.kr |
| 색상 가이드 | https://www.krds.go.kr/html/site/style/style_02.html |
| 타이포그래피 | https://www.krds.go.kr/html/site/style/style_03.html |
| 디자인 토큰 | https://www.krds.go.kr/html/site/style/style_07.html |
| 컴포넌트 목록 | https://www.krds.go.kr/html/site/component/component_summary.html |
| GitHub | https://github.com/KRDS-uiux/krds-uiux |
| Figma Community | https://www.figma.com/community/file/G6q3ztswfIyJgtWeAUZjlq |
