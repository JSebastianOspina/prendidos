# Tasks

Phase A (groups 1–9) ships with the six keys whose art exists. Group 10 is a human gate. Phase B (group 11) adds the 18 drawn keys. Groups 12–17 are the mandatory verification steps. TDD: in every group, write the listed test first, see it fail, then implement.

No auth, authz, age-gate, secrets, or storage change: no `SECURITY REVIEW NEEDED` item applies (re-check in group 17).

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create branch `feature/hu-15-illustrations-and-motion` from an up-to-date `main`; verify with `git branch --show-current`
- [x] 0.2 Confirm no other open change touches `src/components/ui/`, `src/constants/theme.ts`, `card-face.tsx`, or the catalog JSON (`openspec list --json` shows only this change)

## 1. Docs first: brand, tokens, content model

- [x] 1.1 `docs/brand/README.md`: add § Card Illustration Library (24-key table with source column), the art rules, and the planned `card-illustrations-ai-draft.jpg` sheet as "pending generation"; verify the table matches `specs/brand-art/spec.md` key order
- [x] 1.2 `docs/brand/design-tokens.md`: replace "never place the mascot on the game card" with the illustration-slot rule; add `Motion` values (120 ms press, card spring ≤ 450 ms, level up ~600 ms, 200 ms reduced fade) and haptics per platform (iOS light impact, Android `Virtual_Key`, web none); verify by re-reading against design D5–D7
- [x] 1.3 `docs/content/card-templates.md`: close the "Mascot on the game card" and "Illustration library size" open decisions and update the rendering-rules status; `docs/data-model.md`: `illustration?: IllustrationKey`; `docs/content/README.md`: legacy id → key mapping; verify links resolve

## 2. Illustration key set and validator (card-content)

- [x] 2.1 Write failing tests in `src/features/content/__tests__/validate-cards-test.ts`: unknown key (`police-cap`) → one `unknownIllustration` error naming it; each key in `illustrationKeys` passes; blank → `missingField`; `null`/unset → no violation
- [x] 2.2 Add `illustrationKeys` (`as const`, Phase A keys in library order: `mascot-wink`, `mascot-relaxed`, `mascot-smirk`, `mascot-laugh`, `mascot-pointing`, `mascot-surprised`) and `IllustrationKey` to `card-types.ts`; narrow `CardBase.illustration`; add `'unknownIllustration'` to the violation rules and the check in `validate-cards.ts`; verify `npx jest src/features/content` and `npx tsc --noEmit` pass

## 3. Card illustration art (brand-art)

- [x] 3.1 Extend `scripts/crop-brand-art.py` with `CARD_ILLUSTRATIONS` and the `mascot-surprised` box (expressions sheet face #3); run it in a throwaway venv with Pillow; verify `assets/images/brand/card-mascot-surprised.png` exists, has transparent edges and no clipped parts, and `git status assets/` shows no other change
- [x] 3.2 Write failing tests in `src/components/ui/__tests__/brand-art-test.tsx`: every `IllustrationKey` has a source and a positive aspect ratio; `mascot-wink` reuses the `wink` source; `CardIllustration` sets width = height × aspect ratio and is hidden from accessibility
- [x] 3.3 Add `cardIllustrationArt` to `brand-art.ts` and `components/ui/card-illustration.tsx` (design D2); verify the tests in 3.2 pass

## 4. Card illustration slot and "text wins" (turn-screen)

- [x] 4.1 Write failing tests in `src/features/play/__tests__/illustration-fit-test.ts`: fits, does not fit, exact boundary (slot = height + gap), zero slot
- [x] 4.2 Implement `src/features/play/illustration-fit.ts` (design D4); verify 4.1 passes
- [x] 4.3 Write failing tests in `src/features/play/__tests__/card-face-test.tsx`: an individual card with a key shows the illustration after a slot layout with room, above the penalty footer; no key → none; a layout without room → none; the illustration is not in the accessibility tree; a group card follows the same rule above the rule box; a new card id resets to hidden until measured; a later slot layout re-checks the fit both ways (less room hides, more room shows); the illustration is out of the layout flow
- [x] 4.4 Add the measured slot and `CardIllustration` to `IndividualCardFace` and `GroupCardFace` in `card-face.tsx`: the illustration absolutely positioned inside the slot, the slot keyed by card id, and every slot layout re-checking the fit (window size and font scale changes reach it through `onLayout`); verify 4.3 and the existing `card-face-test.tsx` / `play-screen-test.tsx` pass

## 5. Motion foundation (ui-motion)

- [x] 5.1 Write failing tests `src/components/ui/__tests__/motion-test.ts`: `entranceFor(true) === 'fade'`, `entranceFor(false) === 'spring'`, `pressTravelDurationFor(true) === 0`, `pressTravelDurationFor(false) === Motion.pressDurationMs`
- [x] 5.2 Read the Reanimated 4.7 API for `withSpring` duration-based config and `withTiming`; add `Motion` tokens to `src/constants/theme.ts` and `src/components/ui/motion.ts`; verify 5.1 passes
- [x] 5.3 Write a failing test for `src/hooks/use-reduce-motion.ts` (initial value from Reanimated's `useReducedMotion`, updates on `AccessibilityInfo` `reduceMotionChanged`, listener removed on unmount); implement the hook (design D6); verify it passes
- [x] 5.4 Write a failing render test for `Entrance` (renders children with Reduce Motion on and off); if it fails because of Reanimated in Jest, apply the documented setup (`react-native-reanimated/jest/resolver`, `jest-setup.ts` with `setUpTests()`) in the `package.json` `jest` block (design D8); implement `src/components/ui/entrance.tsx`; verify with fake timers that the final style is reached within `Motion.cardEnterMaxMs` and the fade within `Motion.reducedFadeMs`

## 6. Press feedback and haptics (ui-motion)

- [x] 6.1 Run `npx expo install expo-haptics`; read the SDK 58 app config docs for `android.blockedPermissions` and add `android.permission.VIBRATE` to it in `app.json`; verify `package.json` has `expo-haptics` ~58 and `npx expo config --type introspect` (or prebuild-free config check) shows `VIBRATE` blocked
- [x] 6.2 Write failing tests `src/components/ui/__tests__/use-press-feedback-test.tsx`: press-in calls `impactAsync(Light)` once on iOS, `performAndroidHapticsAsync(Virtual_Key)` once on Android, nothing on web; a rejected haptic promise does not throw and the press still runs; with Reduce Motion on the travel duration is 0 and the haptic still fires
- [x] 6.3 Implement `src/components/ui/haptics.ts` and `use-press-feedback.ts` (design D7); verify 6.2 passes
- [x] 6.4 Move `Button` (`components/ui/button.tsx`) and `ClayButton` (`features/play/play-pieces.tsx`) to `usePressFeedback`, with the `Pressable` as the static hit area and an animated inner face; remove both `pressed &&` transforms; verify `ui-primitives-test.tsx`, `play-screen-test.tsx`, and the repeated-press guard tests still pass

## 7. Card entrance, level up, winner pop (turn-screen, final-ranking)

- [x] 7.1 Write failing tests in `play-screen-test.tsx` (mock `useReduceMotion` both ways): the same card content renders with Reduce Motion on and off; completing a card renders the next card inside an `Entrance` keyed by card id; a swapped card re-enters; "No cumplió" responds while the new card is still entering (fake timers not advanced)
- [x] 7.2 Wrap `CardFace` in `Entrance` (`key={card.id}`, `from: 'below'`) in `play-screen.tsx`; verify 7.1 passes and the turn buttons are outside the animated view
- [x] 7.3 Write a failing test for `LevelUpOverlay`: same content with Reduce Motion on and off; only the mascot tile is inside `Entrance`. Wrap the tile (`from: 'small'`, `celebrationSpring`); update the component doc comment that says it has no motion; verify the test and the existing level-up tests pass
- [x] 7.4 Write a failing test in `src/features/results/__tests__/results-screen-test.tsx`: same header content with Reduce Motion on and off; the crowned mascot stays 48 pt inside `Entrance`. Wrap it in `ranking-header.tsx`; verify the test passes

## 8. Content tagging and write-cards skill (launch-catalog)

- [x] 8.1 Write failing tests in `src/features/content/__tests__/catalog-test.ts`: the shipped catalog has no errors; every `illustrationKeys` entry is used at least once; each category × difficulty of `la-previa` and `entre-dos` has an illustrated card; every "Cultura time", "Historytime", and "Momento sad" card has its format key once those keys exist (skip keys not yet in `illustrationKeys`)
- [x] 8.2 Tag cards in `catalog/la-previa.json` and `catalog/entre-dos.json` with the six Phase A keys by mood and level (relaxed → Suave, smirk → Picante, laugh → Prendido, wink → teasing, pointing → dares aimed at someone, surprised → gossip/reveals); no drink prop yet; verify 8.1 passes
- [x] 8.3 Update `ai-specs/skills/write-cards/SKILL.md` to emit `illustration` from `illustrationKeys` and keep `illustrationIdea` only for art that does not exist; update `write-cards-skill-test.ts`; verify it passes and the `.claude/skills` / `.cursor/skills` symlinks still resolve (`find .claude/skills .cursor/skills -xtype l` prints nothing)

## 9. Phase A checkpoint

- [x] 9.1 Run `npx jest`, `npx expo lint`, `npx tsc --noEmit`; all pass with coverage ≥ 90 % on `src/features/**`
- [ ] 9.2 Check in the running app (iOS Simulator iPhone SE and a large iPhone, Android emulator; Reduce Motion off and on; largest font size): illustrated cards fit or fall back to text-only, turn buttons never move, motion matches the tokens, haptic on device press; save screenshots for the PR

## 10. Human gate: draft sheet (BLOCKS group 11)

- [x] 10.1 With the product owner signed in to Google Flow, generate 4 candidates with Nano Banana Pro (16:9, the two reference sheets attached, prompt in design D11); compare them against the review checklist, pick a winner, and download it to `docs/brand/references/card-illustrations-ai-draft.jpg` (numbered 1–18); verify the file opens and record its pixel size — done 2026-11-05: candidate 3 of 4 (Flow media `fdd9a5d0`), 2K upscale, 2752 × 1536 px
- [x] 10.2 Product owner confirms the winner against the art rules (brand-art spec, design D11 checklist); record the result, rejected pieces, and known issues in `docs/brand/README.md`; any dropped key goes back to the specs and this file first (CLAUDE.md §8)

## 11. Phase B: the 18 drawn keys (one commit per key or small batch)

- [x] 11.1 Add the 18 crop boxes to `CARD_ILLUSTRATIONS`, run the script, and verify each `card-<key>.png` visually (transparent edges, no clipped accessories) and that `git status assets/` lists only new `card-*.png` files
- [x] 11.2 Mascot keys (`mascot-monocle`, `mascot-reading-book`, `mascot-crying`, `mascot-sad-map-pin`, `mascot-blowing-kiss`, `mascot-sunglasses`, `mascot-dancing`, `mascot-tongue-out`, `mascot-annoyed`, `mascot-selfie`, `mascot-diva`): for each, add to `illustrationKeys` and `cardIllustrationArt` and tag its cards in the same commit (format keys on every "Cultura time", "Historytime", "Momento sad" card); verify `npx jest src/features/content src/components/ui` and `npx tsc --noEmit` pass after each commit
- [x] 11.3 Prop and animal keys (`phone-ringing` on `reachesOutside` calls/messages, `microphone`, `animal-wheel`, `shot-glass-on-fire` and `glasses-toasting` only on group toasts or shared-drink cards, `rooster`, `two-dogs`): same rule as 11.2; where no card fits, write new cards with the `write-cards` skill, add them to the batch review note as "pending human review", and verify `catalog-test.ts` and the launch-catalog volume tests still pass
- [x] 11.4 Measure the bundle: `npx expo export` before 11.1 and after 11.3; verify the added PNGs total under 1.5 MB and record both numbers in the Step N+1 report
- [x] 11.5 Update `docs/brand/README.md` (sheet status, every key's source now bundled) and `docs/content/README.md` (final legacy → key mapping); verify the brand-art spec key list matches `illustrationKeys` exactly (test from 3.2)

## 12. Review and Update Existing Unit Tests (MANDATORY)

- [x] 12.1 Review tests touched by this change (`content`, `components/ui`, `play`, `results`); add any missing case for every scenario in this change's specs; every test uses the async RNTL v14 APIs (`await render`, `await renderHook`, `await fireEvent`)

## 13. Run Unit Tests, Lint, and Typecheck (MANDATORY - AGENT MUST EXECUTE)

- [x] 13.1 Run targeted tests: `npx jest src/features/content src/features/play src/features/results src/components/ui src/hooks` (no direct DB or device-storage access)
- [x] 13.2 Run the full suite: `npx jest --coverage`; coverage ≥ 90 % on `src/features/**`
- [x] 13.3 Run `npx expo lint` and `npx tsc --noEmit`; both must pass
- [x] 13.4 No shared live data is involved (on-device only); record "no grant needed" in the report
- [x] 13.5 Create `openspec/changes/hu-15-illustrations-and-motion/reports/YYYY-MM-DD-step-N+1-unit-test-verification.md` (template in `docs/openspec-tasks-mandatory-steps.md`), including the bundle-size numbers from 11.4
- [x] 13.6 Mark this step complete only after tests, lint, and typecheck pass and the report exists

## 14. Manual Endpoint Testing with curl — N/A (no backend)

- [x] 14.1 N+2 — Manual endpoint testing: N/A (no backend); confirm the change adds no network or API surface

## 15. E2E Testing with Maestro (MANDATORY - AGENT MUST EXECUTE)

- [ ] 15.1 Build and start a development build on the iOS Simulator and the Android emulator (`npx expo run:ios`, `npx expo run:android`; `expo-haptics` is native); confirm `maestro --version` and `.maestro/` flows
- [ ] 15.2 Declare isolation: local simulator/emulator with on-device data only; no shared-data grant needed
- [ ] 15.3 Run `maestro test .maestro/`; capture passed / failed / skipped
- [ ] 15.4 Add `.maestro/play-turn.yaml`: pass the age gate, pick a mode and La Previa, add players, start, assert a card is visible, press "¡Cumplió!" immediately after the next card appears and assert the following player's turn, swap a card, open Pause and end, assert the ranking with the winner header; use `id:` selectors (add `testID`s where missing)
- [ ] 15.5 Run the flow with Reduce Motion / Remove animations off and on (simulator / emulator accessibility settings) and at the largest font size; record that content and taps behave the same
- [ ] 15.6 Restore the environment with `launchApp: clearState: true` and reset the accessibility settings; leave no running sessions
- [ ] 15.7 Create `openspec/changes/hu-15-illustrations-and-motion/reports/YYYY-MM-DD-step-N+3-e2e-verification.md`

## 16. Update Technical Documentation (MANDATORY)

- [x] 16.1 Re-check every doc from groups 1, 8.3, and 11.5 against the shipped code (keys, tokens, haptics, `blockedPermissions`); fix any drift
- [x] 16.2 `docs/development_guide.md`: note that `expo-haptics` needs a development build for haptics and any Jest setup added in 5.4; `README.md`: mention illustrated cards and motion in the features list if it lists features
- [x] 16.3 `docs/user-stories/hu-15-illustrations-and-mascot.md` and `docs/user-stories/README.md`: status "Implemented — pending archive"

## 17. Security / schema gate (MANDATORY when applicable)

- [x] 17.1 Confirm no auth, authz, age-gate, secrets, storage schema, or network change, so no `SECURITY REVIEW NEEDED` comment applies; confirm the Android permission list did not grow (`VIBRATE` blocked) and no secrets were added to `app.json`
- [ ] 17.2 `/security-scan` and `migration-review`: not applicable (no security surface or schema change); record that in the PR description

## Workflow follow-up

- Run the `adversarial-review` skill against this change before archiving.
- Open a GitHub PR to `main` with the Phase A and Phase B screenshots (a few illustrated cards per level for store screenshots).
- Archive with `/opsx:archive` after review and merge, syncing the spec deltas.
- A new native build is required to ship (`expo-haptics`).
