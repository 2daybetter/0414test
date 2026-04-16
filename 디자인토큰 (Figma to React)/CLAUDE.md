# ASC - AI Context Document

> 이 문서는 AI(Claude)가 프로젝트 작업 시 반드시 따라야 하는 규칙과 컨텍스트입니다.

---

## 🎨 디자인 시스템 규칙 (최우선!)

> ⚠️ **모든 UI 작업은 아래 디자인 시스템을 기반으로 합니다. 예외 없음.**

### 토큰 파일 구조 (3파일 동기화 필수)

| 파일 | 역할 | 수정 기준 |
|------|------|-----------|
| `theme.css` | CSS 변수 정의 (원본 헥스값은 **여기에만** 존재) | Figma 변수 변경 시에만 |
| `theme.js` | JS에서 토큰 참조용 (CSS 변수로 연결) | theme.css와 동기화 |
| `tailwind.config.js` | Tailwind 유틸리티 ↔ CSS 변수 매핑 | 토큰 추가/삭제 시에만 |

---

### 색상 토큰

| CSS 변수 | Tailwind 클래스 | 용도 | 값 |
|----------|----------------|------|-----|
| `--color-border-default` | `border-border` | 테두리, 구분선 | #DCDEE3 |
| `--color-text-primary` | `text-text-primary` | 제목, 본문 텍스트 | #2A3038 |
| `--color-text-secondary` | `text-text-secondary` | 보조 텍스트, 캡션, 플레이스홀더 | #555D6D |
| `--color-bg-secondary` | `bg-bg-secondary` | 카드 배경, 태그 배경, 섹션 배경 | #F3F4F5 |
| `--color-brand-primary` | `bg-brand-primary` | CTA 버튼, 강조 요소 | #FF6F0F |
| `--color-brand-secondary` | `bg-brand-secondary` | 브랜드 보조 (hover 등) | #E68507 |

**코드 예시 — 올바른 사용 vs 금지:**

```jsx
// ❌ 금지: 헥스 코드 직접 사용
<div style={{ color: '#2A3038', background: '#F3F4F5' }}>

// ❌ 금지: Tailwind 기본 색상
<div className="text-gray-800 bg-gray-100">

// ✅ 올바른: CSS 변수 사용 (인라인)
<div style={{ color: 'var(--color-text-primary)', background: 'var(--color-bg-secondary)' }}>

// ✅ 올바른: Tailwind 커스텀 토큰
<div className="text-text-primary bg-bg-secondary">
```

---

### 타이포그래피

**폰트**: Pretendard Variable (`--font-family-base`)
theme.css에서 CDN으로 자동 로드됨.

**텍스트 스타일 5종 — 용도별 사용 가이드:**

| 스타일 | font-weight | font-size | line-height | 용도 | Tailwind |
|--------|-------------|-----------|-------------|------|----------|
| **Bold/38** | 700 | 38px | 38px | 페이지 메인 타이틀 | `text-38 font-bold` |
| **SemiBold/16** | 600 | 16px | 24px | 버튼 라벨, 카드 제목, 드롭다운 | `text-16 font-semibold` |
| **SemiBold/14** | 600 | 14px | 20px | 소형 버튼, 태그 라벨 | `text-14 font-semibold` |
| **Regular/16** | 400 | 16px | 24px | 본문 텍스트 | `text-16 font-normal` |
| **Regular/14** | 400 | 14px | 20px | 보조 텍스트, 인기 검색어, 캡션 | `text-14 font-normal` |

**코드 예시:**

```jsx
// ❌ 금지: 임의 폰트 사이즈
<p style={{ fontSize: '15px' }}>  // 15px는 토큰에 없음
<p className="text-sm">           // Tailwind 기본값, 토큰 아님

// ✅ 올바른: 토큰에 정의된 사이즈만 사용
<h1 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 700, fontSize: 'var(--font-size-38)', lineHeight: 'var(--line-height-38)' }}>
  메인 타이틀
</h1>

// ✅ 올바른: Tailwind 커스텀 토큰
<h1 className="font-base font-bold text-38">메인 타이틀</h1>
<p className="font-base font-normal text-16 text-text-secondary">본문 텍스트</p>
<span className="font-base font-semibold text-14">태그 라벨</span>
```

---

### 스페이싱

**사용 가능한 값 (이 외의 값 사용 금지):**

| CSS 변수 | 값 | Tailwind | 주요 용도 |
|----------|-----|----------|-----------|
| `--spacing-2` | 2px | `p-2px`, `gap-2px` | 미세 간격 |
| `--spacing-4` | 4px | `p-4px`, `gap-4px` | 아이콘-텍스트 간격, 버튼 내 아이콘 패딩 |
| `--spacing-6` | 6px | `p-6px`, `gap-6px` | 버튼 세로 패딩, 검색 아이콘 패딩 |
| `--spacing-10` | 10px | `p-10px`, `gap-10px` | 태그 세로 패딩, 검색바 내부 간격 |
| `--spacing-12` | 12px | `p-12px`, `gap-12px` | 버튼 가로 패딩, 키워드 간 간격 |
| `--spacing-14` | 14px | `p-14px`, `gap-14px` | 태그 가로 패딩 |
| `--spacing-16` | 16px | `p-16px`, `gap-16px` | 카드 전체 패딩 |
| `--spacing-20` | 20px | `p-20px`, `gap-20px` | 드롭다운 좌측 패딩, 섹션 패딩 |
| `--spacing-32` | 32px | `p-32px`, `gap-32px` | 큰 섹션 간격 |
| `--spacing-80` | 80px | `p-80px` | 페이지 레벨 여백 |
| `--spacing-260` | 260px | `w-260px` | 사이드바 너비 등 고정 레이아웃 |

**코드 예시:**

```jsx
// ❌ 금지: 임의 spacing
<div style={{ padding: '8px' }}>      // 8px는 토큰에 없음
<div style={{ padding: '15px' }}>     // 15px는 토큰에 없음
<div className="p-3">                  // Tailwind 기본값, 토큰 아님

// ✅ 올바른
<div style={{ padding: 'var(--spacing-16)', gap: 'var(--spacing-12)' }}>
<div className="p-16px gap-12px">
```

---

### Border Radius

| CSS 변수 | 값 | Tailwind | 용도 |
|----------|-----|----------|------|
| `--radius-4` | 4px | `rounded-4` | 버튼(primary, dialog) |
| `--radius-12` | 12px | `rounded-12` | 카드 |
| `--radius-16` | 16px | `rounded-16` | 큰 카드, 모달 |
| `--radius-full` | 9999px | `rounded-full` | pill 형태 (태그, 검색바, 검색 버튼) |

---

### 컴포넌트 사용 가이드

모든 컴포넌트는 `components/index.js`에서 barrel export됩니다.

```jsx
import { Button, Tag, Card, Dropdown, SearchBar, Title, PopularKeywords } from './components';
```

#### Button — 3가지 variant

```jsx
// primary: 브랜드 색상 배경 + 흰 텍스트 (88×32)
<Button variant="primary" label="앱 다운로드" />
<Button variant="primary" label="로그인" icon={<UserIcon />} />
<Button variant="primary" label="비활성" disabled />

// dialog: 투명 배경 + 아이콘 전용 (32×32)
<Button variant="dialog" icon={<MenuIcon />} />

// search: 다크 원형 + 아이콘 (28×28)
<Button variant="search" icon={<SearchIcon />} />
```

#### Tag — pill 형태 태그

```jsx
<Tag label="송도동" />
<Tag label="강남구" icon={<LocationIcon />} />
<Tag label="비활성" disabled />
```

#### Card — 카테고리 카드

```jsx
<Card label="중고거래" icon={<TradeIcon />} />
<Card label="알바" icon={<JobIcon />} disabled />
```

#### Dropdown — 셀렉트 트리거

```jsx
<Dropdown label="중고거래" />
<Dropdown label="동네생활" icon={<CustomChevron />} />
```

#### SearchBar — 검색 폼 (Dropdown + Input + Button/search 조합)

```jsx
<SearchBar 
  placeholder="검색어를 입력해주세요"
  dropdownLabel="중고거래"
  onSearch={() => console.log('검색')}
  onDropdownClick={() => console.log('드롭다운')}
/>
<SearchBar disabled />
```

#### Title — 키워드 교체 헤드라인

```jsx
// {keyword} 위치에 keyword prop이 들어감
<Title label="당근에서 {keyword} 찾고 계신가요?" keyword="아이폰" />
<Title label="{keyword} 인기 매물" keyword="맥북" />
```

#### PopularKeywords — 가로 스크롤 키워드 목록

```jsx
<PopularKeywords
  label="인기 검색어"
  keywords={['에어컨', '노트북', '원룸', '중고차']}
  onKeywordClick={(kw) => console.log(kw)}
/>
```

---

### ⛔ 디자인 시스템 금지사항 (코드 리뷰 체크리스트)

| # | 금지 | 올바른 방법 | 예시 |
|---|------|-------------|------|
| 1 | 헥스 코드 직접 사용 | CSS 변수 사용 | `#FF6F0F` → `var(--color-brand-primary)` |
| 2 | Tailwind 기본 색상 | 커스텀 토큰 | `bg-orange-500` → `bg-brand-primary` |
| 3 | Tailwind 기본 사이즈 | 커스텀 토큰 | `text-sm` → `text-14` |
| 4 | 토큰에 없는 spacing | 토큰 값만 사용 | `p-3`(12px) → `p-12px` |
| 5 | 토큰에 없는 font-size | 토큰 값만 사용 | `15px` → `14px` 또는 `16px` |
| 6 | 기존 컴포넌트 중복 생성 | `components/` 재사용 | 새 Button 만들기 → `<Button variant="primary">` |
| 7 | 컴포넌트 내부 스타일 직접 수정 | props로 제어 | `.Button { color: red }` → `<Button variant="search">` |
| 8 | 토큰 1파일만 수정 | 3파일 동시 수정 | theme.css만 → theme.css + theme.js + tailwind.config.js |

---

### 새 토큰 추가 절차 (구체적 예시)

> 예: Figma에서 `--color-status-success: #22C55E` 추가가 필요한 경우

**1단계: 사용자에게 Figma 변수 확인 요청**

**2단계: 승인 후 3파일 동시 수정**

```css
/* theme.css — 원본 값 추가 */
:root {
  /* 기존 변수들... */
  --color-status-success: #22C55E;   /* ← 추가 */
}
```

```javascript
// theme.js — CSS 변수 참조 추가
color: {
  // 기존...
  status: {
    success: 'var(--color-status-success)',  // ← 추가
  },
},
```

```javascript
// tailwind.config.js — Tailwind 매핑 추가
colors: {
  // 기존...
  status: {
    success: 'var(--color-status-success)',  // ← 추가
  },
},
```

**3단계: 사용**

```jsx
// 인라인
<span style={{ color: 'var(--color-status-success)' }}>완료</span>

// Tailwind
<span className="text-status-success">완료</span>
```

---

# 작업원칙

- **확장성/유연성 검토**: 현재 요구사항을 해결하되, 향후 확장이 막히지 않는 구조 확인
- **기존 코드 재사용**: 새로 만들기 전에 `components/`, `theme.js` 등 기존 리소스를 먼저 탐색
- **커뮤니케이션**: 항상 **개요(왜, 무엇을)** → **상세 구현 계획** 순서로 설명

### 작업 프로세스 (필수!)

> ⚠️ **추측을 사실처럼 말하지 말 것!** 모든 가설은 반드시 검증 후 결론.
> ⛔ **코드 작성 전 반드시 4단계까지 완료하고 사용자 승인을 받을 것.**

#### 1단계: 문제/요청 이해
- 문제 현상을 명확히 기술
- 불분명한 부분이 있으면 사용자에게 질문
- "~일 것 같습니다"가 아니라 실제 코드를 확인

#### 2단계: 원인 분석 (문제 해결의 경우)
- 가설 수립 → 가설 검증 → 원인 확정
- ❌ "이게 원인입니다" (검증 없이)
- ✅ "가설: ~일 수 있습니다. 검증해보겠습니다." → "확인 결과, ~가 원인입니다"

#### 3단계: 해결책 탐색
- 해결 방안 2-3개 제시, 각 방안의 영향 범위 분석
- 사전 검증 가능하면 검증

#### 4단계: 작업 계획 보고 (코드 작성 전 필수!)

> ⛔ 사용자가 "그냥 빨리 해줘"라고 해도, 이 보고를 먼저 하세요.

```
📋 작업 계획 보고

🔍 문제 상황 (What's wrong?)
어떤 상황에서 어떤 증상이 발생하는지, 왜 이 작업이 필요한지.

🎯 목표 (What we want to achieve)
이 작업이 완료되면 어떤 상태가 되어야 하는지.

🔬 원인 분석 (Why it happens) - 문제 해결의 경우
검증된 원인만 기술. 추측은 "가설"이라고 명시.

📁 변경 예정 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|----------|------|

⚡ Before → After
[Before] 현재 상태
[After] 작업 후 기대 상태

🎨 디자인 토큰 사용 계획
- 사용할 CSS 변수: --color-*, --spacing-* 등
- 재사용할 컴포넌트: Button(primary), Tag 등
- 새로 필요한 토큰: 있으면 명시 (없으면 "없음")

이대로 진행해도 될까요?
```

#### 5단계: 작업 실행
- 승인받은 계획대로 진행
- 예상치 못한 상황 → 중단 후 보고

#### 6단계: 결과 검증

| # | 확인 항목 | 필수 | 구체적 검증 방법 |
|---|-----------|------|-----------------|
| 1 | 빌드 에러 없음 | ✅ | `npm run build` 통과 |
| 2 | 헥스 코드 미사용 | ✅ | 새로 작성한 코드에 `#` + 6자리 패턴 없는지 확인 |
| 3 | Tailwind 기본값 미사용 | ✅ | `bg-red-`, `text-gray-`, `text-sm` 등 기본 클래스 없는지 확인 |
| 4 | 토큰 외 spacing 미사용 | ✅ | `8px`, `15px`, `24px` 등 토큰에 없는 값 없는지 확인 |
| 5 | 기존 컴포넌트 재사용 | ✅ | Button/Tag/Card 등 기존 컴포넌트로 대체 가능한 부분 없는지 확인 |
| 6 | 토큰 추가 시 3파일 동기화 | ✅ | theme.css, theme.js, tailwind.config.js 모두 수정했는지 확인 |
| 7 | 기존 기능 정상 동작 | ✅ | 기존 컴포넌트/페이지 깨지지 않았는지 확인 |

#### 7단계: 작업 완료
- 6단계 검증 **전부 통과** 후에만 "완료" 선언
- 변경 사항 요약 보고

### 금지 사항

| 금지 | 이유 | 올바른 대안 |
|------|------|-------------|
| 허락 없이 새 파일/컴포넌트 생성 | 프로젝트 구조 임의 변경 방지 | 사용자에게 먼저 제안 후 승인 |
| 기존 아키텍처 임의 변경 | 설계 의도 훼손 방지 | 변경 필요 시 이유와 함께 제안 |
| 요청 범위 밖 리팩토링 | 스코프 크립 방지 | "이 부분도 개선하면 좋겠는데, 할까요?" |
| 문제 발견 시 바로 수정 | 사용자가 다른 해결책을 원할 수 있음 | 문제 보고 → 해결책 2-3개 제시 → 승인 후 수정 |
| 디자인 토큰 없이 스타일링 | 디자인 시스템 일관성 파괴 | 항상 `var(--*)` 또는 Tailwind 커스텀 토큰 사용 |

### 이전 세션 작업 이어받을 때

1. "완료됐다"는 요약을 그대로 믿지 말 것
2. 실제 코드 상태를 직접 확인 (`Read`, `Grep`으로 검증)
3. 동작 테스트로 검증 후 진행

---

## 📁 프로젝트 구조

```
asc/
├── CLAUDE.md               ← 이 파일 (AI 작업 규칙)
├── theme.css               ← CSS 변수 정의 (원본 헥스값, @import 폰트)
├── theme.js                ← JS 토큰 참조 (CSS 변수 연결)
├── tailwind.config.js      ← Tailwind ↔ CSS 변수 매핑
└── components/
    ├── index.js            ← barrel export (모든 컴포넌트 여기서 import)
    ├── Button.jsx          ← variant: primary(CTA) / dialog(아이콘) / search(원형)
    ├── Tag.jsx             ← pill 태그 (bg-secondary + text-primary)
    ├── Card.jsx            ← 카테고리 카드 (213×104, rounded-12)
    ├── Dropdown.jsx        ← 셀렉트 트리거 (텍스트 + 쉐브론)
    ├── SearchBar.jsx       ← 검색바 = Dropdown + Input + Button/search
    ├── Title.jsx           ← "{keyword}" 교체 가능한 Bold/38 헤드라인
    └── PopularKeywords.jsx ← 가로 스크롤 키워드 + 우측 fade 오버레이
```

---

## 🛠️ 기술 스택

- **언어**: JavaScript (JSX)
- **스타일링**: CSS Variables (`theme.css`) + Tailwind CSS (`tailwind.config.js`)
- **폰트**: Pretendard Variable (CDN, theme.css에서 @import)
- **디자인 소스**: Figma (TalkToFigmaDesktop MCP 연동)
- **컴포넌트**: Inline Style 기반 React 컴포넌트 (CSS 변수 참조)

---

**Last Updated**: 2026-03-11
