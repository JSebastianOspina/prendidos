# Tasks

## 0. Branch

- [x] 0.1 Work on `feat/align-home-and-categories` cut from `origin/feat/brand-art-and-design-review`; verify with `git branch --show-current`

## 1. Home merges mode selection (home-screen)

- [x] 1.1 Update `src/features/home/__tests__/home-screen-test.tsx` first (header row, heading, mode cards, footer, mode tap resets the draft and opens categories, no "Nueva partida"); verify it fails
- [x] 1.2 Add the token-drawn illustrations and `ModeCard`, rewrite `home-screen.tsx` and `copy.ts`; verify the home tests pass

## 2. Category screen (category-picker)

- [x] 2.1 Write failing tests for `standardCardCounts` and the square `BackLink` (fallback `routes.home`); implement; verify they pass
- [x] 2.2 Update `category-picker-screen-test.tsx` first (mode heading, subtitles, couple chip, La Previa count/bars/GRATIS, Entre Dos level rows and "Jugar Entre Dos", redirect and back fallback to Inicio); verify it fails
- [x] 2.3 Implement `CategoryCard`, `CoupleCategoryCard`, level bars, and the new header; replace `ChoiceCard`/`PickerLayout` and their tests; verify the category tests pass

## 3. Mode route

- [x] 3.1 Turn `src/app/new-game/mode.tsx` into a redirect to `routes.home`; delete `mode-picker-screen.tsx`, its test, and unused copy; verify `grep -r ModePicker src` is empty

## 4. Verification

- [x] 4.1 `npm test` green with global coverage ≥ 90 %
- [x] 4.2 `npx expo lint` and `npx tsc --noEmit` clean

## Workflow follow-up

- Adversarial review, archive, commit, merge `origin/main`, re-run checks, push, open the PR.
- Shared changes requested: remove `routes.newGame.mode` (routes.ts + test), its `_layout.tsx` entry, the age-gate flow test stub, and point the setup redirect at `routes.home`.
