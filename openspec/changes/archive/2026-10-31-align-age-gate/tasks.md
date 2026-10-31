# Tasks

## 0. Setup

- [x] 0.1 Branch `feat/align-age-gate` from `origin/feat/brand-art-and-design-review` (coordinator naming); verify with `git branch --show-current`

## 1. Age gate layout (TDD)

- [x] 1.1 Failing test then `mascotHeightFor` in `age-gate-layout.ts` (240 cap, 140 floor, smaller at 667 than at 844) — verify `npx jest src/features/age-gate`
- [x] 1.2 Update the screen tests first (mascot image, new header, subtitle, moderation card text, decline link button with ≥ 48 pt target, footnote, no wordmark) and see them fail — verify `npx jest src/features/age-gate`
- [x] 1.3 Update `age-gate-copy.ts` and `AgeGateScreen` with `Mascot`, `ModerationCard` + `ShieldGlyph`, text-link decline, footnote; tests pass — verify `npx jest src/features/age-gate`
- [x] 1.4 Confirm and decline behavior unchanged (existing confirm / decline / flow tests still pass) — verify by test
- [x] 1.5 SECURITY REVIEW NEEDED — auth/authz/security impact: age gating; keep the code comment in `age-gate-screen.tsx`; review by `adversarial-review`

## 2. E2E

- [x] 2.1 Update `.maestro/age-gate.yaml` selectors to the new copy; not run here (no simulator) — state in report

## 3. Verification

- [x] 3.1 `npm test` green with global coverage ≥ 90 %
- [x] 3.2 `npx expo lint` clean
- [x] 3.3 `npx tsc --noEmit` clean

## Workflow follow-up

- `adversarial-review`, `/opsx:archive`, merge `origin/main`, commit, push, PR to `main` (visual check left to the coordinator)
