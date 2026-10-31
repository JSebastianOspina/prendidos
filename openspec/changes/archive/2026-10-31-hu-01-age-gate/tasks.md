# Tasks

## 0. Setup

- [x] 0.1 Branch `feature/hu-01-age-gate` from `origin/main`; verify with `git branch --show-current`

## 1. Age gate screen (TDD)

- [x] 1.1 Failing test then `age-gate-copy.ts` + `AgeGateScreen` rendering brand, question (header), notice, confirm and decline buttons — verify `npx jest src/features/age-gate`
- [x] 1.2 Failing test then confirm calls `confirmAge()` and persists `ageConfirmedAt` (device storage) — verify by test
- [x] 1.3 Failing test then decline shows the adults-only alert, stores nothing, keeps confirm available — verify by test
- [x] 1.4 Replace `src/app/age-gate.tsx` placeholder with a thin default export of `AgeGateScreen`; verify by a route-file test
- [x] 1.4a Flow test with `expo-router/testing-library` over the real root layout: first open shows the gate, decline stays on `/age-gate`, confirm lands on `/`, restart skips the gate — verify `npx jest src/features/age-gate`
- [x] 1.4b The adults-only message lives in the fixed footer with the buttons so it is never scrolled out of view — verify by the decline test
- [x] 1.5 SECURITY REVIEW NEEDED — auth/authz/security impact: age gating; code comment in `age-gate-screen.tsx` and review by `adversarial-review`

## 2. E2E and docs

- [x] 2.1 Add `.maestro/age-gate.yaml` (clear state → decline → confirm → Inicio); not run here (no simulator) — state in report
- [x] 2.2 Mark the story `docs/user-stories/hu-01-age-gate.md` as implemented

## 3. Verification

- [x] 3.1 `npm test` green with `src/features/**` coverage ≥ 90 %
- [x] 3.2 `npx expo lint` clean
- [x] 3.3 `npx tsc --noEmit` clean

## Workflow follow-up

- `adversarial-review`, `/opsx:archive`, commit, push, PR to `main` (visual check left to the coordinator)
