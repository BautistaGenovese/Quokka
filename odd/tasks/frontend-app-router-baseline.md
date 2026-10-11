# Feature: Quokka Frontend — App Router Baseline (TypeScript + Spanish UI)

## Objective
Migrate `./frontend` from JS `app/` to a TypeScript App Router baseline with 5 routes, Spanish UI copy/metadata, English code/names, Clean Architecture folder layout, and DESIGN.md-aligned typography/layout tokens.

## Problem / Why
Current `frontend/` is a create-next-app scaffold: JS (no TS), placeholder English copy, Geist fonts not in DESIGN.md, and no route structure for the Quokka Studio product (home, services public/protected, contact, dashboard).

## Constraints
- Root: `./frontend` only.
- Language split (HARD): UI text, `<h1>`, `Metadata` titles/descriptions → **Spanish**. Folder names, file names, identifiers, component signatures, comments → **English**.
- Use `./frontend/src/app` (modern layout) — migrate existing `app/` → `src/app/`.
- Design tokens/typography/layout classes MUST follow `./DESIGN.md` (§3.7 canonical tokens, §4 typography families + scale, §5 `.wrap` container, §10 implementation rules).
- Fonts per DESIGN.md §4.1: Gabarito (display), Source Sans 3 (body), IBM Plex Mono (mono/labels), Fraunces (editorial accent) — loaded centrally via `next/font/google`, exposed as `--font-display`, `--font-body`, `--font-mono`, `--font-serif`.
- Tailwind 4 + `@tailwindcss/postcss` already configured — do not add/change stack (DESIGN.md §10.11).
- No new runtime dependencies.

## Scope
IN:
- `tsconfig.json`, TypeScript migration (`.js`/`.jsx` → `.ts`/`.tsx`), `typescript` + `@types/*` devDeps.
- `src/app/` migration: `layout.tsx`, `globals.css`, `favicon.ico`, root `page.tsx`.
- 5 route `page.tsx` files (Home `/`, Services `/services`, Dashboard Services `/dashboard/services`, Contact `/contact-me`, Dashboard `/dashboard`).
- `Metadata` export per route (Spanish title/description).
- Shared `PageHeader` component (optional, English) for consistent H1 + section label per DESIGN.md §7.1.
- Move `components/`, `lib/` under `src/` to match `src/app`.

OUT:
- Real auth/protected-route middleware (dashboard routes are structural placeholders only).
- Full section content (hero, cards, team, etc.) — baseline `<h1>` + metadata only, per DESIGN.md §6 architecture as future work.
- Backend integration.

## Checklist
- [x] T1 — TypeScript + `src/` migration: install TS deps, create `tsconfig.json`, move `app/` → `src/app/`, `components/` → `src/components/`, `lib/` → `src/lib/`, update `jsconfig.json` → remove, convert `layout.js` → `src/app/layout.tsx` with DESIGN.md fonts + Spanish default metadata + `lang="es"`.
- [x] T2 — Design token alignment: extend `src/app/globals.css` with DESIGN.md canonical tokens (keep existing shadcn vars, add `--font-*` bindings from next/font variables, `.wrap` container utility).
- [x] T3 — Route pages: create the 5 `page.tsx` files with Spanish `Metadata` + `<h1>`, English identifiers/comments.
- [x] T4 — Verification: `npm run build` passes, `npm run lint` clean; Spanish UI text spot-check; English identifier spot-check.
- [x] T5 — Work-unit commit: `42b74ab` on `feat/frontend-app-router-baseline` (conventional commit, no AI attribution).
- [x] T6 — Site header: `src/components/site-header.tsx` (DESIGN.md §7.2/§7.3/§14): `<header>` + `<nav aria-label="Navegación principal">`, brand links to `/`, 4 Spanish nav links, hover/focus-visible, wraps on small screens. Active-route styling omitted (would need `usePathname` → client component).
- [x] T7 — Site footer: `src/components/site-footer.tsx`: semantic `<footer>`, brand + Spanish credit + mono copyright.
- [x] T8 — Layout wiring: header/main/footer frame in `src/app/layout.tsx`. **Bug found & fixed:** DESIGN.md tokens lived only in `:root`, so Tailwind 4 emitted 0 rules for `text-muted-foreground`/`bg-background`/`border-border` (verified in built CSS). Added `@theme inline` bridge + `@utility font-body` in `globals.css`. Verified: build ✅, lint ✅, emitted CSS now contains the rules.
- [x] T9 — Work-unit commit: `006e52c`. RDD assess: medium / `under_budget` → no review due yet (candidate stays in slice).

## Acceptance Criteria
- `cd frontend && npm run build` succeeds.
- All 5 routes render Spanish `<h1>` and Spanish `metadata.title`.
- All paths/identifiers/comments in English.
- `tsconfig.json` present; no `.js`/`.jsx` left in `src/`.
- Fonts and container utility match DESIGN.md.

## TDD
- Mode: off (no test framework installed; source of truth: no test config in `frontend/`).
- Runner (functional checks only): `npm run build`, `npm run lint`.

## Progress
- [x] Exploration done (2026-10-10): existing JS scaffold, Tailwind 4, DESIGN.md reviewed (§3.7, §4, §5, §10).
- [x] T1–T4 implemented + verified (2026-10-10): `npm run build` ✅, `npm run lint` ✅.
- [x] T5 committed: `42b74ab` on `feat/frontend-app-router-baseline`.
- [ ] Native review (RDD on): lineage `review-db5991acc0fe42df` started, consent granted, but the `review-reliability` lens sub-agent is unavailable in this runtime ("OpenCode's free tier can only be used from within OpenCode") — blocked at collect; no receipt burned. Re-run review from a compatible runtime or decline via `gentle-ai review start ... --consent declined`.

## Route table (authoritative)
| Route | File | H1 (ES) | Metadata title (ES) | Visibility |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Inicio | Inicio | Public |
| `/services` | `src/app/services/page.tsx` | Nuestros Servicios | Nuestros Servicios | Public |
| `/dashboard/services` | `src/app/dashboard/services/page.tsx` | Panel de Servicios - Usuarios Autorizados | Panel de Servicios | Protected (structural) |
| `/contact-me` | `src/app/contact-me/page.tsx` | Contáctame | Contáctame | Public |
| `/dashboard` | `src/app/dashboard/page.tsx` | Panel de Control | Panel de Control | Protected (structural) |

## Delivery forecast
~5 pages × ~40 lines + layout ~70 + tsconfig ~35 ≈ 320 authored lines → under 400 budget; single PR, `ask-on-risk` (no split needed).

## Next step
Delegate T1–T4 to one writer (delegated direct route); parent verifies build.
