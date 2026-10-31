# Tasks

## 0. Setup

- [x] 0.1 Branch `feature/hu-07-launch-content` from `origin/main`; verify with `git branch --show-current`
- [x] 0.2 Temporary failing count test (`launch-content-temp-test.ts`): ≥ 30 per level for Entre Dos, La Previa standard, La Previa spicy, no validator errors; verify it fails with `npx jest src/features/content`

## 1. Entre Dos (playable today)

- [x] 1.1 Append `dos-031` … `dos-050` (easy: 12 challenge, 4 truth, 2 everyoneWho, 2 neverHaveIEver); verify no validator errors
- [x] 1.2 Append `dos-051` … `dos-070` (medium, same mix); verify no validator errors
- [x] 1.3 Append `dos-071` … `dos-090` (hard, same mix); verify the Entre Dos count assertions pass

## 2. La Previa Sin Filtro (reachable after HU-10)

- [x] 2.1 Append `prev-102` … `prev-131` (spicy easy: 18 challenge, 6 truth, 3 everyoneWho, 3 neverHaveIEver); verify no validator errors
- [x] 2.2 Append `prev-132` … `prev-161` (spicy medium, same mix); verify no validator errors
- [x] 2.3 Append `prev-162` … `prev-191` (spicy hard, same mix); verify the temporary test is fully green

## 3. Review note and verification

- [x] 3.1 Write `docs/content/launch-content-review.md` (counts per category / heat / level / type, flags, validation result, "Status: pending human review — no human has reviewed these cards yet.", blank reviewer and date); verify counts match a script run over the JSON
- [x] 3.2 Delete the temporary test; `npm test` green with the coverage threshold, `npx expo lint` and `npx tsc --noEmit` clean

## Workflow follow-up

- `adversarial-review`, `/opsx:archive`, commit, push, PR to `main` (human-review criterion stays open).
