# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Structure

This workspace contains two projects:

- **`디자인 토큰 시스템/`** — React component library with a design token system (CSS Variables + Tailwind CSS). The active code project.
- **`아데오 사업제안서/`** — Business proposal documents (PDFs, Word, PowerPoint). No code.

When working on UI/component tasks, all relevant rules and architecture are in [`디자인 토큰 시스템/CLAUDE.md`](디자인 토큰 시스템/CLAUDE.md).

## Commands

From within `디자인 토큰 시스템/`:

```bash
npm run build   # Validate — must pass before marking any task complete
```

## Design Token System — Architecture Summary

**Tech stack**: React (JSX), CSS Variables, Tailwind CSS, Pretendard Variable font (CDN).

**Three-file sync rule**: Any token change must update all three files simultaneously:
- `theme.css` — source of truth (hex values live here only)
- `theme.js` — JS references to CSS variables
- `tailwind.config.js` — Tailwind ↔ CSS variable mappings

**Components** (`components/index.js` barrel export): `Button`, `Tag`, `Card`, `Dropdown`, `SearchBar`, `Title`, `PopularKeywords`.

**Core styling rule**: Never use raw hex codes, Tailwind built-in colors/sizes, or spacing values not defined in tokens. Always use `var(--*)` or custom Tailwind tokens.

**Before writing any code**: present a work plan (problem → goal → files to change → design tokens to use) and wait for user approval.

## Skill Workflow

Always follow this workflow — do not skip straight to implementation.

| 상황 | 패턴 |
|------|------|
| 새 프로젝트 / 에이전트 | `blueprint` → `deep-dive` → 구현 → `autoresearch` → `reflect` |
| 중간 기능 추가 | `deep-dive` → 구현 → `reflect` |
| 스킬 최적화 | `autoresearch` 단독 |
| 세션 마무리 | `reflect` 단독 |

Custom skills are in `.claude/skills/`: `autoresearch`, `blueprint`, `deep-dive`, `reflect`.  
Each skill has a `SKILL.md` and a `references/` directory with detailed guides.
