# Step N+1 Report - Unit Tests, Lint, Typecheck

- Date: 2026-11-06
- Change: hu-15-illustrations-and-motion
- Agent: Claude Code (Opus 5.5), `/opsx:apply`

## Commands Executed

- `npx jest src/features/content src/features/play src/features/results src/components/ui src/hooks`
- `npx jest --coverage`
- `npx expo lint`
- `npx tsc --noEmit`
- `npx expo export --platform ios` (before task 11.1 and after task 11.3, for the bundle budget)

## Unit Test Results

- Targeted tests: 392 passed, 0 failed, 0 skipped (22 suites)
- Full suite: 602 passed, 0 failed, 0 skipped (49 suites)
- Runtime: 2.6 s targeted, 4.6 s full with coverage
- Coverage on `src/features/**` (threshold 90 %): 99.47 % statements, 96.61 % branches, 99.46 % functions, 99.70 % lines
- Notes: no flaky tests and no retries. Reanimated 4 needed its documented Jest setup (`resolver` and `jest-setup.ts` with `setUpTests()` in the `package.json` `jest` block, design D8). Two category-picker tests now expect Entre Dos Picante to hold 31 cards, after the new HU-15 card `dos-091`.

## Spec Scenario Coverage (task 12.1)

| Spec           | Scenarios                                                                 | Tests                                                                 |
| -------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| brand-art      | Launch keys in order; every key has art; wink reuses `wink`; non-square `mascot-dancing` at 120 pt; hidden from screen readers | `components/ui/__tests__/brand-art-test.tsx` |
| card-content   | Unknown key; library key; blank key; unset or `null`                        | `content/__tests__/validate-cards-test.ts`                            |
| launch-catalog | Every key used; every category × level illustrated; format keys; drink props only on group cards | `content/__tests__/catalog-test.ts`   |
| turn-screen    | Slot below text above the footer / rule box; no key; text wins; re-check on later layouts; first frame text-only; out of layout flow; card entrance on next and swapped card; buttons outside the animation; level-up tile only | `play/__tests__/card-face-test.tsx`, `play-screen-test.tsx`, `level-up-overlay-test.tsx`, `illustration-fit-test.ts` |
| final-ranking  | Winner mascot pops at 48 pt with Reduce Motion off and on                   | `results/__tests__/results-screen-test.tsx`, `components/ui/__tests__/entrance-test.tsx` |
| ui-motion      | Press travel and one haptic (iOS, Android), none on web, failed haptic; Reduce Motion fade and instant press; live setting change; tap during entrance; at most two animated elements | `components/ui/__tests__/use-press-feedback-test.tsx`, `entrance-test.tsx`, `motion-test.ts`, `ui-primitives-test.tsx`, `hooks/__tests__/use-reduce-motion-test.ts`, `play-screen-test.tsx` |

All touched tests use the async RNTL v14 APIs (`await render`, `await renderHook`, `await fireEvent`, `await act`).

## Lint and Typecheck

- `npx expo lint`: PASS (exit 0, no errors or warnings)
- `npx tsc --noEmit`: PASS (no errors)

## Bundle Size (task 11.4)

`npx expo export --platform ios`, measured with `du -sk`:

| Measure            | Before 11.1 | After 11.3 | Change  |
| ------------------ | ----------- | ---------- | ------- |
| Whole export       | 8,468 KB    | 8,784 KB   | +316 KB |
| `assets/`          | 4,508 KB    | 4,816 KB   | +308 KB |

The 19 card PNGs total 401 KB (256-color palette PNGs, 384 px tall), under the 1.5 MB budget. "Before" already held the Phase A `card-mascot-surprised.png`.

## Data safety

- Direct DB / device-storage access used: No
- Human mutating grant required: No — on-device data only, no shared live data (task 13.4)
- Isolation / teardown (if grant used): not applicable; tests clear the in-memory `expo-sqlite/kv-store` mock per test
- Cleanup outcome: none needed

## Security / Schema Gate (tasks 14.1, 17.1)

- Network and API surface: none added (no `fetch`, sockets, URLs, or network modules in the diff); Step N+2 endpoint testing stays N/A.
- Auth, authz, age gate, secrets, storage schema: unchanged (`src/features/device`, `src/features/age-gate`, `src/features/game` untouched; `device.v1` unchanged), so no `SECURITY REVIEW NEEDED` applies.
- Android permissions (`npx expo config --type introspect`): `expo-haptics` adds `VIBRATE`, and `app.json` `android.blockedPermissions` removes it (`tools:node="remove"`); the rest of the list is unchanged. `app.json` holds no secrets.
- `/security-scan` and `migration-review`: not applicable (no security surface or schema change); to be stated in the PR description (task 17.2).

## Outcome

- Step N+1 status: PASS
- Blocking issues: none for this step. Device checks (task 9.2) and Maestro E2E (group 15) are blocked on this machine: no Xcode (only Command Line Tools), no Android SDK, no Maestro. A web-build check in the browser pane (375 × 667 and 430 × 932) confirmed the illustration fit and fallback, still turn buttons, the card entrance, the level-up overlay, and the crowned ranking mascot; it found and led to the fix in design D4.
