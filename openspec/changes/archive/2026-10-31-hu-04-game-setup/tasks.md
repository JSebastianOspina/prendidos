# Tasks

Branch: `feature/hu-04-game-setup` (off `main`).

## 1. Pure setup rules (TDD)

- [x] 1.1 Write failing tests in `src/features/setup/__tests__/setup-rules-test.ts` for `preparePlayersForMode`, `shufflePlayers`, `toggleDifficulty`, `hasMissingName`, `trimPlayerNames`, `endConditionOptions`, `isSameEndCondition`; verify they fail with `npx jest src/features/setup`
- [x] 1.2 Implement `src/features/setup/setup-rules.ts`; verify the tests pass

## 2. Setup screen (TDD)

- [x] 2.1 Write failing tests in `src/features/setup/__tests__/setup-screen-test.tsx` covering every scenario in `specs/game-setup/spec.md` (preload, first use, couple, guard, add/remove/limits, gender, No toma, missing name, shuffle, levels, end condition, start + remembered players, hidden slot); verify they fail
- [x] 2.2 Implement `copy.ts`, `option-chip.tsx`, `player-row.tsx`, `spicy-switch-slot.tsx`, `setup-screen.tsx`; verify the screen tests pass
- [x] 2.3 Replace `src/app/new-game/setup.tsx` with a thin route rendering `SetupScreen`; verify `npx tsc --noEmit`

## 3. Verification

- [x] 3.1 `npm test` green with global coverage ≥ 90 %
- [x] 3.2 `npx expo lint` clean
- [x] 3.3 `npx tsc --noEmit` clean
- [x] 3.4 Mark the story's acceptance criteria as covered in `docs/user-stories/hu-04-game-setup.md`

## Workflow follow-up

- Adversarial review, archive, commit, push, PR to `main`. Visual check on the web build is left to the coordinator (no simulator on this machine). No Maestro flow in this change.
