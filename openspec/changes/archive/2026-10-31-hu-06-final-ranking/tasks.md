# Tasks

## 1. Pure helpers and copy (TDD)

- [x] 1.1 Write failing tests `src/features/results/__tests__/ranking-groups-test.ts` for `groupRankingByPosition` (single winner, tie for first, tie in the middle, empty); verify they fail with `npx jest src/features/results`
- [x] 1.2 Implement `src/features/results/ranking-groups.ts`; verify 1.1 passes
- [x] 1.3 Write failing tests `results-copy-test.ts` for `joinPlayerNames` (1, 2, 3 names, "y" → "e"), `formatPoints`, `spokenPoints`, accessibility labels, then implement `src/features/results/results-copy.ts`; verify they pass

## 2. Screen (TDD)

- [x] 2.1 Write failing screen tests `src/features/results/__tests__/results-screen-test.tsx` (real providers, mocked `expo-router`): winner highlight, tie row, negative score color, "Jugar otra vez" fills the draft and dismisses to setup, "Volver al inicio" dismisses to home, redirect home with no finished game, no active session saved, no upsell content
- [x] 2.2 Implement `score-text.tsx`, `winner-card.tsx`, `ranking-list.tsx`, `upsell-slot.tsx`, `results-screen.tsx`; verify 2.1 passes
- [x] 2.3 Replace `src/app/results.tsx` with a thin route rendering `ResultsScreen`; verify with `npx tsc --noEmit`

## 3. Verification

- [x] 3.1 `npm test` green with global coverage ≥ 90 %
- [x] 3.2 `npx expo lint` clean
- [x] 3.3 `npx tsc --noEmit` clean
- [x] 3.4 Visual check on device / web build — left to the coordinator (no simulator on this machine); record in the PR under "Not verified"

## Workflow follow-up

- `adversarial-review`, `/opsx:archive`, commit, push `feature/hu-06-final-ranking`, open PR to `main`.
