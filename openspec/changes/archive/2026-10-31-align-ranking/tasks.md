# Tasks

## 0. Branch

- [x] 0.1 Work on `feat/align-ranking` (cut from `origin/feat/player-avatar`); verify with `git branch --show-current`.

## 1. Copy and layout helpers

- [x] 1.1 Add failing tests for the eyebrow ("La Previa · 10 rondas", "1 ronda", "Meta 100 pts", no category), the title and tie line, and the podium entry label in `results-copy-test.ts`; implement them in `results-copy.ts`. Add `rounds-played.ts` with its tests (round wrapped with nobody playing yet). Verify with `npm test -- results-copy rounds-played`.
- [x] 1.2 Add failing tests for splitting the ranking into podium and rows and ordering the podium (sole winner centered, two players, tie for first in ranking order) in `ranking-layout-test.ts`; implement `ranking-layout.ts` and drop the unused grouping module. Verify with `npm test -- ranking-layout`.

## 2. Screen

- [x] 2.1 Update `results-screen-test.tsx` first (header, eyebrow, podium labels, step numbers and colors, 2-player podium, rows with avatars, negative color, long names, new button labels with the same navigation); see it fail.
- [x] 2.2 Build the crown, the header, the podium, and the rows, and lay out the side-by-side buttons in `results-screen.tsx`; remove `WinnerCard` and `RankingList`. Verify with `npm test -- results`.

## 3. Checks

- [x] 3.1 Run `npm test` (global coverage ≥ 90 %), `npx expo lint`, and `npx tsc --noEmit`, all clean.

## Workflow follow-up

- Adversarial review, archive the change, commit, merge `origin/main`, push, and open the PR.
