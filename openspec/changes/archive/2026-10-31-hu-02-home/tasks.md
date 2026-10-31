# Tasks

## 0. Branch

- [x] 0.1 Create `feature/hu-02-home` from `origin/main` and verify `git log -1` shows the HU-00 merge

## 1. Home screen (TDD)

- [x] 1.1 Write `src/features/home/__tests__/home-screen-test.tsx` covering the spec scenarios (heading + tagline, decorative tile hidden, "Nueva partida" pushes `routes.newGame.mode`, draft reset keeps remembered players, no "Continuar partida" / "Restaurar compras") and verify it fails
- [x] 1.2 Add `src/features/home/copy.ts` and `src/features/home/home-screen.tsx` (tokens and primitives only, reserved slot comments) and verify the tests pass
- [x] 1.3 Replace `src/app/index.tsx` with a thin route rendering `HomeScreen` and verify `npx tsc --noEmit` passes

## 2. Verification

- [x] 2.1 Run `npm test -- --coverage` and verify all suites pass with global coverage ≥ 90 %
- [x] 2.2 Run `npx expo lint` and verify it is clean
- [x] 2.3 Run `npx tsc --noEmit` and verify it is clean

## Workflow follow-up

- Visual check on the running app is left to the coordinator (no simulator on the agent machine).
- Run `adversarial-review`, archive the change, commit, push, and open the PR to `main`.
