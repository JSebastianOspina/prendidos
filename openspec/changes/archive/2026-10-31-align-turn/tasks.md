# Tasks: align-turn

## 0. Branch

- [x] 0.1 Work on `feat/align-turn` (cut from `origin/feat/player-avatar`, merged with `origin/main` before push) and verify with `git branch --show-current`

## 1. Copy and progress helpers

- [x] 1.1 Update `copy-test.ts` first (round label per end condition, interlude label, swap label, "Seguir: le toca a", level-up line), see it fail, then update `copy.ts` and see it pass
- [x] 1.2 Write `turn-progress-test.ts` (segments per level in play; rounds, points and open progress), see it fail, then add `turn-progress.ts` and see it pass

## 2. Turn layout

- [x] 2.1 Update `card-face-test.tsx` for the level-filled card (chips, avatar, name, footer) and the group card (¡Todos!, rule box), see it fail, then implement with local clay pieces and see it pass
- [x] 2.2 Update `play-screen-test.tsx` for the top bar (pause, round, progress, "Cambiar (1)" / "Cambiar (0)"), no scoreboard, actions with points, and "Seguir: le toca a {nombre}"; see it fail, implement, see it pass

## 3. Pause and level up

- [x] 3.1 Add Pause dialog tests (Seguir jugando keeps the card, Terminar y ver ranking ends the game), see them fail, implement, see them pass
- [x] 3.2 Add level-up tests (shows once on a level rise with range and scale, not at start, not over a group card, after the refusal penalty), see them fail, implement, see them pass

## 4. Verification

- [x] 4.1 `npm test` green with global coverage ≥ 90 %
- [x] 4.2 `npx expo lint` and `npx tsc --noEmit` clean

## Workflow follow-up

- adversarial-review, then `/opsx:archive`, commit, merge `origin/main`, push, open PR.
