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
- [x] 1.4 `docs/brand/design-tokens.md`: add the card body steps (29 / 24 / 20 pt) and the rule that the card fits the visible area, scrolling only as the last resort; `docs/content/card-templates.md` rendering rule 4 and `docs/brand/README.md` art rules: illustrations take the space left, 72–160 pt, and cards without a key show their level's mascot face (design D13); verify against the turn-screen spec delta

## 2. Illustration key set and validator (card-content)

- [x] 2.1 Write failing tests in `src/features/content/__tests__/validate-cards-test.ts`: unknown key (`police-cap`) → one `unknownIllustration` error naming it; each key in `illustrationKeys` passes; blank → `missingField`; `null`/unset → no violation
- [x] 2.2 Add `illustrationKeys` (`as const`, Phase A keys in library order: `mascot-wink`, `mascot-relaxed`, `mascot-smirk`, `mascot-laugh`, `mascot-pointing`, `mascot-surprised`) and `IllustrationKey` to `card-types.ts`; narrow `CardBase.illustration`; add `'unknownIllustration'` to the violation rules and the check in `validate-cards.ts`; verify `npx jest src/features/content` and `npx tsc --noEmit` pass

## 3. Card illustration art (brand-art)

- [x] 3.1 Extend `scripts/crop-brand-art.py` with `CARD_ILLUSTRATIONS` and the `mascot-surprised` box (expressions sheet face #3); run it in a throwaway venv with Pillow; verify `assets/images/brand/card-mascot-surprised.png` exists, has transparent edges and no clipped parts, and `git status assets/` shows no other change
- [x] 3.2 Write failing tests in `src/components/ui/__tests__/brand-art-test.tsx`: every `IllustrationKey` has a source and a positive aspect ratio; `mascot-wink` reuses the `wink` source; `CardIllustration` sets width = height × aspect ratio and is hidden from accessibility
- [x] 3.3 Add `cardIllustrationArt` to `brand-art.ts` and `components/ui/card-illustration.tsx` (design D2); verify the tests in 3.2 pass

## 4. Card illustration slot, card fit, and "text wins" (turn-screen)

- [x] 4.1 Write failing tests in `src/features/play/__tests__/illustration-fit-test.ts` for `illustrationHeightFor`: plenty of room → 160; 100 pt free → 88; exactly 72 + gap → 72; just under → `null`; zero slot → `null`; and `defaultIllustrationFor`: easy → `mascot-relaxed`, medium → `mascot-smirk`, hard → `mascot-laugh`
- [x] 4.2 Implement `illustrationHeightFor` (72–160 pt) and `defaultIllustrationFor` in `src/features/play/illustration-fit.ts` (design D4, D13); verify 4.1 passes
- [x] 4.3 Write failing tests in `src/features/play/__tests__/card-face-test.tsx`: an individual card with a key shows the illustration after a slot layout with room, above the penalty footer; no key → none; a layout without room → none; the illustration is not in the accessibility tree; a group card follows the same rule above the rule box; a new card id resets to hidden until measured; a later slot layout re-checks the fit both ways (less room hides, more room shows); the illustration is out of the layout flow
- [x] 4.4 Add the measured slot and `CardIllustration` to `IndividualCardFace` and `GroupCardFace` in `card-face.tsx`: the illustration absolutely positioned inside the slot, the slot keyed by card id, and every slot layout re-checking the fit (window size and font scale changes reach it through `onLayout`); verify 4.3 and the existing `card-face-test.tsx` / `play-screen-test.tsx` pass
- [x] 4.5 Write failing tests in `src/features/play/__tests__/card-fit-test.ts` for `nextCardFit`: overflow (slot 0) → next smaller step while `fitting`; overflow at the smallest step → stays (scroll is the last resort); fits with room for the art → settled at that step; an illustrated card that fits with less than 72 pt for its art → one extra step (`artTrial`); the trial keeps the step when the art then gets 72 pt and returns to the step that fit otherwise; no trial at 20 pt or for a card without an illustration; and that `CardTextSteps` holds 29 / 24 / 20 pt in that order
- [x] 4.6 Add `CardTextSteps` to `src/constants/theme.ts` and implement `nextCardFit` in `src/features/play/card-fit.ts` (design D13); verify 4.5 passes
- [x] 4.7 Write failing tests in `card-face-test.tsx`: the body starts at 29 pt; each overflowing slot layout steps it down to 24 then 20 and stops there; a card without an illustration that fits keeps 29 pt; an illustrated card that fits at 29 pt with 40 pt free tries 24 pt and keeps it with the art when 24 pt leaves room, or returns to 29 pt text-only when it does not; the illustration is sized to the free space (100 pt free → 88 pt tall); a group card body steps the same way; a new card starts again at 29 pt; the compact header keeps the avatar (48 pt), "Le toca a", the name, both chips, and the points badge
- [x] 4.8 Apply the compact header and the card fit to `IndividualCardFace` and `GroupCardFace` (`card-face.tsx`, `play-pieces.tsx`), and size `CardIllustration` from `illustrationHeightFor`; verify 4.7, the existing card-face and play-screen tests, lint, and typecheck pass
- [x] 4.9 Write failing tests in `card-face-test.tsx`: a card without a key shows its level's mascot face when the slot has room (Suave relaxed, Picante smirk, Prendido laugh, group cards included) and nothing below 72 pt; the level face never makes the body step down (fits at 29 pt with 40 pt free → stays 29 pt); with 400 pt free the illustration is 160 pt tall
- [x] 4.10 Show `card.illustration ?? defaultIllustrationFor(card.difficulty)` in both card faces, keeping the one-step trial for cards with their own key only; verify 4.9, the existing card-face and play-screen tests, lint, and typecheck pass
- [x] 4.11 Write failing tests in `card-face-test.tsx`: an individual card shows the chips, "N pts", headline, and body, with no hint line and no "Si no cumple" footer; the illustration slot is the card's last element
- [x] 4.12 Write failing tests in `play-screen-test.tsx`: "¡Cumplió!" shows a "+N" badge and keeps the label "¡Cumplió! +N pts"; "No cumplió" shows "Toma N trago(s)" (no quip) and a "−N" badge, labeled "No cumplió −N pts, Toma N trago(s)"; a player who does not drink still sees the drink penalty; the refusal overlay still shows the quip
- [x] 4.13 Remove the hint and the footer from `IndividualCardFace` (design D15); add the `badge` slot to `ClayButton` and the badges and penalty line to the turn actions in `play-screen.tsx`; verify 4.11, 4.12, the existing tests, lint, and typecheck pass

## 4b. Card variety (game-engine)

- [x] 4.14 Write failing tests: `src/features/content/__tests__/shown-illustration-test.ts` (`shownIllustrationFor` returns the key, or the level face by difficulty) and `card-selection-test.ts` (with `avoidIllustration`, the first ranked candidate with a different shown illustration comes out; the level face counts; when all candidates share it, the first comes out; no `avoidIllustration` keeps today's order)
- [x] 4.15 Move `defaultIllustrationFor` to `src/features/content/shown-illustration.ts` with `shownIllustrationFor` (design D16); add `avoidIllustration` to `drawCard` and pass the on-screen card's shown illustration from `withNextCard`; verify 4.14, the game reducer and provider tests, and the play tests pass

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
- [ ] 9.2 Check in the running app — web build in the browser pane at 375 × 667 (iPhone SE) and 430 × 932 (large iPhone): illustrated cards fit or fall back to text-only, turn buttons never move, card entrance, level-up, and winner motion; and Expo Go on the product owner's phone: one haptic per press, Reduce Motion / Remove animations off and on, largest font size; save screenshots for the PR (decision 2026-11-06: no Xcode, Android SDK, or Maestro on the dev machine, so simulators are replaced by web + Expo Go)

## 10. Human gate: draft sheet (BLOCKS group 11)

- [x] 10.1 With the product owner signed in to Google Flow, generate 4 candidates with Nano Banana Pro (16:9, the two reference sheets attached, prompt in design D11); compare them against the review checklist, pick a winner, and download it to `docs/brand/references/card-illustrations-ai-draft.jpg` (numbered 1–18); verify the file opens and record its pixel size — done 2026-11-05: candidate 3 of 4 (Flow media `fdd9a5d0`), 2K upscale, 2752 × 1536 px
- [x] 10.2 Product owner confirms the winner against the art rules (brand-art spec, design D11 checklist); record the result, rejected pieces, and known issues in `docs/brand/README.md`; any dropped key goes back to the specs and this file first (CLAUDE.md §8)

## 11. Phase B: the 18 drawn keys (one commit per key or small batch)

- [x] 11.1 Add the 18 crop boxes to `CARD_ILLUSTRATIONS`, run the script, and verify each `card-<key>.png` visually (transparent edges, no clipped accessories) and that `git status assets/` lists only new `card-*.png` files
- [x] 11.2 Mascot keys (`mascot-monocle`, `mascot-reading-book`, `mascot-crying`, `mascot-sad-map-pin`, `mascot-blowing-kiss`, `mascot-sunglasses`, `mascot-dancing`, `mascot-tongue-out`, `mascot-annoyed`, `mascot-selfie`, `mascot-diva`): for each, add to `illustrationKeys` and `cardIllustrationArt` and tag its cards in the same commit (format keys on every "Cultura time", "Historytime", "Momento sad" card); verify `npx jest src/features/content src/components/ui` and `npx tsc --noEmit` pass after each commit
- [x] 11.3 Prop and animal keys (`phone-ringing` on `reachesOutside` calls/messages, `microphone`, `animal-wheel`, `shot-glass-on-fire` and `glasses-toasting` only on group toasts or shared-drink cards, `rooster`, `two-dogs`): same rule as 11.2; where no card fits, write new cards with the `write-cards` skill, add them to the batch review note as "pending human review", and verify `catalog-test.ts` and the launch-catalog volume tests still pass
- [x] 11.4 Measure the bundle: `npx expo export` before 11.1 and after 11.3; verify the added PNGs total under 1.5 MB and record both numbers in the Step N+1 report
- [x] 11.5 Update `docs/brand/README.md` (sheet status, every key's source now bundled) and `docs/content/README.md` (final legacy → key mapping); verify the brand-art spec key list matches `illustrationKeys` exactly (test from 3.2)

## 11b. Human gate: draft sheet 2 (BLOCKS group 11c)

- [x] 11.6 With the product owner signed in to Google Flow (browser pane visible), generate 4 candidates with Nano Banana Pro (16:9, the two reference sheets attached, prompt in design D14); compare them against the review checklist, pick a winner, and save it as `docs/brand/references/card-illustrations-2-ai-draft.jpg` (JPEG quality 85, under 500 KB); verify the file opens and record its pixel size
- [x] 11.7 Product owner confirms the winner against the art rules; record the result, rejected pieces, and known issues in `docs/brand/README.md` (Files table and Known Issues); any dropped key goes back to the specs and this file first (CLAUDE.md §8)

## 11c. Phase C: the 18 batch-2 keys

- [x] 11.8 Re-measure the grid of sheet 2 with the probe, add its 18 boxes to `CARD_ILLUSTRATIONS`, run the script with `--cards-only`, and verify each new `card-<key>.png` visually (transparent edges, no clipped parts) and that `git status assets/` lists only new `card-*.png` files
- [x] 11.9 Extend the key-list test in `brand-art-test.tsx` to the 42 keys of the brand-art spec (failing first); add the 18 keys to `illustrationKeys` and `cardIllustrationArt`
- [x] 11.10 Tag the catalog with the batch-2 keys by theme (design D14 table), moving a card from a Phase A/B key only when the new key fits it clearly; keep format keys and drink-prop rules; verify `catalog-test.ts` (every key used, every level illustrated, format keys, drink props) and the launch-catalog volume tests pass
- [x] 11.11 Update `docs/brand/README.md` (library table to 42 keys with sheet 2 sources), `docs/content/illustration-batch-review.md` (batch-2 tags, pending human review), and the bundle measurement in the Step N+1 report (`npx expo export`; the 37 card PNGs stay under 1.5 MB in total)
- [x] 11.12 Re-run the group 13 checks (targeted and full Jest with coverage, lint, typecheck) and update the Step N+1 report

## 11d. Human gate: draft sheet 3 (BLOCKS group 11e)

- [x] 11.13 With the product owner signed in to Google Flow (browser pane visible), generate 4 candidates with the prompt in design D17 and the two reference sheets; compare them against the review checklist, pick a winner, and save it as `docs/brand/references/card-illustrations-3-ai-draft.jpg` (JPEG quality 85, under 500 KB)
- [x] 11.14 Product owner confirms the winner; record the result and known issues in `docs/brand/README.md`

## 11e. Phase D: the 18 batch-3 keys

- [x] 11.15 Probe sheet 3, add its 18 boxes (and `SEALS` for half-body pieces) to `CARD_ILLUSTRATIONS`, run the script with `--cards-only`, and check every new PNG at full size on a strong background; `git status assets/` lists only new `card-*.png` files
- [x] 11.16 Extend the key-list test to the 60 keys (failing first); add the 18 keys to `illustrationKeys` and `cardIllustrationArt` (the aspect-ratio test guards the sizes)
- [x] 11.17 Retag the cards of the largest groups with the batch-3 keys by what each card asks (design D17), keeping format keys and drink-prop rules; verify the catalog tests pass and no key serves more than about 12 cards
- [x] 11.18 Update `docs/brand/README.md` (60-key table, sheet 3), `docs/content/illustration-batch-review.md` (batch-3 tags, pending human review), the bundle numbers in the Step N+1 report, and re-run the group 13 checks

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

## 15. E2E Testing — web build + Expo Go (MANDATORY - AGENT MUST EXECUTE)

Decision 2026-11-06 (product owner): the dev machine has no Xcode, Android SDK, or Maestro, so E2E runs on the web build (agent, browser pane) plus an Expo Go check on a real phone (product owner). Running the Maestro flow on a simulator, emulator, or USB Android device is deferred until that tooling exists.

- [x] 15.1 Start the web build (`expo-web` in `.claude/launch.json`) in the browser pane and Metro for Expo Go (`npx expo start`); record in the report that `maestro`, `xcrun simctl`, and `adb` are unavailable
- [x] 15.2 Declare isolation: local browser storage and on-phone data only; no shared-data grant needed
- [x] 15.3 Run the play-turn workflow on the web build at 375 × 667 and 430 × 932: pass the age gate, pick Amigos and La Previa, add players, start, assert a card is visible, press "¡Cumplió!", then press "No cumplió" right after the next card appears (still entering; ui-motion "Tap during a card entrance") and assert that player's refusal penalty, then the following player's turn ("¡Cumplió!" twice within `repeatedPressWindowMs` is the HU-05 double-tap guard, not an entrance problem), swap a card, open Pause and end, assert the ranking with the winner header; capture passed / failed per step and screenshots
- [x] 15.4 Add `.maestro/play-turn.yaml` with the same steps and `id:` selectors (add `testID`s where missing), ready to run once a simulator, emulator, or USB Android device with Maestro is available; verify it parses as YAML and the `testID`s exist in the app
- [ ] 15.5 Product owner runs the Expo Go checklist on a phone: one light haptic per press, Reduce Motion / Remove animations off and on, largest font size; content and taps behave the same, illustrated cards fit or fall back to text-only; record the result and screenshots
- [ ] 15.6 Restore: end the web game through the app, stop the preview server and Metro, and reset the phone's accessibility settings; leave no running sessions
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
