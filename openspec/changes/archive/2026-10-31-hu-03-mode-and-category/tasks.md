# Tasks

## 0. Branch

- [x] 0.1 Work on `feature/hu-03-mode-and-category`, cut from `origin/main`

## 1. Building blocks (TDD)

- [x] 1.1 Failing tests for `ChoiceCard` (title, subtitle, description, press, accessibility label, lock slot hidden by default and shown when given), then implement `choice-card.tsx` and `mode-accent.ts`
- [x] 1.2 Failing tests for `BackLink` (back when history exists, replace with the fallback otherwise), then implement `back-link.tsx`
- [x] 1.3 Create `copy.ts` with all Spanish copy and the player-range helper from `playerLimitsByMode`

## 2. Mode screen (TDD)

- [x] 2.1 Failing tests: both options with player line and tone line; tapping a mode sets the draft and pushes `routes.newGame.category`; back falls back to home
- [x] 2.2 Implement `mode-picker-screen.tsx`; replace `src/app/new-game/mode.tsx` with a thin route

## 3. Category screen (TDD)

- [x] 3.1 Failing tests: only the chosen mode's categories with name and description; tapping one sets the draft and pushes `routes.newGame.setup`; redirect to mode without a mode; empty list message; category without description; back falls back to mode; no lock badge
- [x] 3.2 Implement `category-picker-screen.tsx`; replace `src/app/new-game/category.tsx` with a thin route

## 4. Verification

- [x] 4.1 N — Review tests: every module in `src/features/category-picker/` covered
- [x] 4.2 N+1 — `npx jest` (coverage ≥ 90 %), `npx expo lint`, `npx tsc --noEmit`; report in `reports/`
- [x] 4.3 N+2 — Manual endpoint testing: N/A (no backend)
- [x] 4.4 N+3 — Maestro E2E: N/A on this machine (no simulator); visual check left to the coordinator on the web build
- [x] 4.5 N+4 — Documentation: story file enriched; no README/command change
- [x] 4.6 N+5 — Security gate: N/A (no auth, storage, or route exposure change)
