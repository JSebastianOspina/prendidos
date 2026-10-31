# Tasks

Branch: `feature/hu-05-turn-and-card` (off `main`). TDD: write the failing test, see it fail, implement, see it pass.

## 1. Copy and formatters

- [x] 1.1 Write failing tests in `src/features/play/__tests__/copy-test.ts` for `roundLabel`, `drinksLabel`, `penaltyLine`, `pointsLabel`, `signedPointsLabel`
- [x] 1.2 Implement `src/features/play/copy.ts` and verify the copy tests pass

## 2. Card face components

- [x] 2.1 Write failing tests in `src/features/play/__tests__/card-face-test.tsx`: Reto vs Verdad tag, points badge, headline/body, penalty row, consent and outside notes shown only when flagged, group card headline fallback
- [x] 2.2 Implement `src/features/play/card-face.tsx` (`IndividualCardFace`, `GroupCardFace`) with tokens and `CardFrame`; verify tests pass

## 3. Turn screen

- [x] 3.1 Write failing tests in `src/features/play/__tests__/play-screen-test.tsx` through `DeviceStateProvider` → `GameProvider` (injected catalog and environment) and a mocked `expo-router`: header, Cumplió, No cumplió overlay then next turn, swap once, group interlude, end with confirm/cancel, auto-navigation to results (completed and refused last turn), no session → home
- [x] 3.2 Implement `src/features/play/play-overlay.tsx` and `src/features/play/play-screen.tsx`; verify the screen tests pass
- [x] 3.3 Replace `src/app/play.tsx` with a thin route rendering `PlayScreen`; verify `npx tsc --noEmit`

## 4. Verification

- [x] 4.1 Run `npm test -- --coverage` and verify all suites pass and global coverage stays ≥ 90 %
- [x] 4.2 Run `npx expo lint` and verify it is clean
- [x] 4.3 Run `npx tsc --noEmit` and verify it is clean

## Workflow follow-up

- Adversarial review, archive the change, commit, push, open PR to `main` (do not merge).
- Visual check on the web build is left to the coordinator (no simulator on this machine).
