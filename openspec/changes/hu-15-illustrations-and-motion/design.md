# Design: HU-15 card illustrations and motion

## Context

See `proposal.md` (Why) and the specs in this change (What). The enriched story `docs/user-stories/hu-15-illustrations-and-mascot.md` holds the full library table, art rules, and product decisions of 2026-11-05; this design does not repeat them.

Current state on `main` (read 2026-11-05):

- `CardBase.illustration?: string` (`src/features/content/card-types.ts:55`); the validator only checks it is non-blank text (`validate-cards.ts:354`, `checkOptionalText`). No catalog card sets it; `CardFace` never renders it.
- Brand art lives behind `src/components/ui/brand-art.ts` (`mascotArt` with `source`, `label`, `aspectRatio`; `avatarArt`). Screens never `require` PNGs directly. Interim PNGs are cropped from 2000 px AI sheets by `scripts/crop-brand-art.py` (`cut()`, `fit(square=…)`, boxes in 1932 px display coordinates).
- Turn screen: `play-screen.tsx` puts `CardFace` in a `ScrollView` whose content container has `flexGrow: 1`; `PlayCard` (`play-pieces.tsx`) grows to fill it, and its body (`cardBody`, `flexGrow: 1`) sits above an optional footer. `GroupCardFace` already has a `flexGrow` spacer above its rule box.
- Press: `Button` (`components/ui/button.tsx`) and `ClayButton` (`features/play/play-pieces.tsx`) duplicate the same clay press, `pressed && { transform: [{ translateY: PressedTravel }] }` on the `Pressable` face, with an absolute ink shadow layer behind it.
- `react-native-reanimated` 4.7.1 and `react-native-worklets` 0.13.0 are installed but unused. `expo-haptics` is not installed. Jest uses the plain `jest-expo` preset (config in `package.json`); coverage is collected from `src/features/**`.
- `LevelUpOverlay` mascot tile is 150 pt; `RankingHeader` crowned mascot is 48 pt.

Docs checked for Expo SDK 58 (`docs.expo.dev/versions/v58.0.0`):

- `expo-haptics` ~58.0.7: `impactAsync(ImpactFeedbackStyle.Light)` on iOS/Android/web; on Android `impactAsync` is simulated with `Vibrator`, which the docs advise against in favor of `performAndroidHapticsAsync(AndroidHaptics.*)`, which "does not require `VIBRATE` permission". The module adds `VIBRATE` automatically. Web uses the Vibration API.
- Reanimated (4.7.1 recommended, no extra config; Babel plugin via `babel-preset-expo`). `useReducedMotion()` returns a synchronous `boolean` read **at app launch**; changing the setting does not re-render. Jest: `resolver: 'react-native-reanimated/jest/resolver'`, `require('react-native-reanimated').setUpTests()` in a setup file, fake timers to advance animations, `toHaveAnimatedStyle` matcher.

## Goals / Non-Goals

**Goals:**

- One closed, typed illustration key set shared by content, validator, and art, so a missing piece is a type error or a validation error, never a blank slot at runtime.
- A fit rule decided inside the card from real layout, with no text reflow and no change to the turn buttons.
- One press implementation and one entrance implementation used by every screen, with the Reduce Motion branch in a pure, unit-tested function.
- Ship in two safe steps: everything with the six keys whose art exists, then the 18 drawn keys after the human art review.

**Non-Goals:**

- Measuring or animating anything per frame on the JavaScript thread.
- A `format` field on cards (formats are tagged by hand; see story § Out of scope).
- Home screen motion (the logo tile stays static).
- Live Reanimated layout animations for list reorders, screen transitions, or gestures.

## Decisions

### D1. Closed key set in the content module

`card-types.ts` exports `illustrationKeys` (`as const`, library order) and `IllustrationKey`. `CardBase.illustration?: IllustrationKey`. The validator adds a `ViolationRule` `'unknownIllustration'` (severity `error`): blank stays `missingField` via the existing path, a non-blank value outside `illustrationKeys` reports `unknownIllustration` naming the value.

- *Why in content, not in `brand-art.ts`:* the validator and catalog types must not import UI or image modules (`brand-art.ts` already imports from content, not the other way round).
- *Alternative:* keep `string` and check at render time. Rejected: content could ship pointing to missing art and fail silently.

### D2. Art map typed by the key set

`brand-art.ts` adds `cardIllustrationArt: Record<IllustrationKey, { source; aspectRatio }>`. The five mascot keys reuse the `mascotArt` sources and ratios (`mascot-wink` → `wink`, …, `mascot-pointing` → `pointing`); the rest `require` `assets/images/brand/card-<key>.png`. The `Record` makes adding a key without art a `tsc` error. No `label`: illustrations are decorative.

`components/ui/card-illustration.tsx` exports `CardIllustration({ illustration, height })`: an `expo-image` `Image` with `contentFit="contain"`, `height`, `width = height × aspectRatio`, `accessible={false}`, `accessibilityElementsHidden`, and `importantForAccessibility="no-hide-descendants"`.

### D3. Incremental key rollout (two phases)

- **Phase A:** the type, validator rule, art map, slot, fit rule, motion, and tagging with the six keys whose art exists (`mascot-wink`, `mascot-relaxed`, `mascot-smirk`, `mascot-laugh`, `mascot-pointing`, plus `mascot-surprised` cropped from `mascot-expressions-ai-draft.jpg` face #3).
- **Human gate:** the product owner generates `docs/brand/references/card-illustrations-ai-draft.jpg` from the prompt in D11 and reviews it against the art rules.
- **Phase B:** each draft key enters `illustrationKeys`, `cardIllustrationArt`, its PNG, and its catalog tags **in the same commit**, so the "every key used" catalog test and the `Record` type stay green after every commit.

*Alternative:* declare all 24 keys up front with placeholder art. Rejected: placeholder art could reach a build, and "every key used" would force tagging cards with art nobody has reviewed.

### D4. "Text wins" measured inside the card, not in the play screen

The card body already fills the visible card area (`flexGrow` chain from the `ScrollView` content container to `cardBody`). Each card face ends its text column with a `flexGrow: 1` **slot** view (individual cards: after the notes, before the footer; group cards: the existing spacer above the rule box). With the illustration hidden, the slot's measured height (`onLayout`) is exactly the free space left in the visible card area; when the text overflows, the body grows past the viewport and the slot measures 0.

A pure helper `features/play/illustration-fit.ts` decides: `fitsIllustration({ slotHeight, illustrationHeight, gap }) → slotHeight >= illustrationHeight + gap`, with `illustrationHeight = 120` and `gap = Spacing.md`. The illustration renders inside the slot only after a passing measurement (default hidden), so the first frame is text-only and the text never moves. It is drawn **absolutely positioned** inside the slot, out of the layout flow, so the slot's measured height is always the free space whether the illustration shows or not: every slot layout re-checks the fit, with no show/hide oscillation and nothing for the art to push. A window-size or font-scale change that affects the fit changes the slot's layout, so `onLayout` re-checks it; the slot is keyed by card id, so a new card remounts it hidden until measured.

*Revised during apply (2026-11-05):* the first version reset the decision on a `useWindowDimensions` / font-scale key and ignored slot layouts while the art was shown. In the web build the slot's `onLayout` for a resize could arrive before the re-render that reset the key, so it was ignored and the card stayed text-only with room to spare. Measuring an out-of-flow illustration removes both the reset key and the ignore rule.

- *Why not the story's approach* (`play-screen` measures the `ScrollView` viewport and `card-face` measures content without the illustration, then compares): it needs both measurements plumbed across two components and an estimate of padding and footer heights. The slot measures the same quantity directly, in one component. The behavior in the spec is unchanged.
- The turn buttons sit outside the `ScrollView`, so neither the slot nor the illustration can move them.

### D5. Motion primitives on Reanimated shared values

- **Tokens** (`constants/theme.ts`): `Motion = { pressDurationMs: 120, cardEnterMaxMs: 450, levelUpDurationMs: 600, reducedFadeMs: 200, cardSpring, celebrationSpring }`. Springs use Reanimated's duration-based config (`duration` + `dampingRatio` < 1 for a small overshoot) so the settle time is the token itself; confirm the exact option names against the Reanimated 4.7 API before coding and fall back to `damping`/`stiffness` tuned to the same settle time if needed. *Confirmed during apply:* Reanimated 4.7 `SpringConfig` takes `duration` + `dampingRatio`, but `duration` is perceptual and the spring settles in 1.5 × it, so the tokens set `duration = settle time / 1.5` (`cardSpring` 300 → 450 ms, `dampingRatio` 0.75; `celebrationSpring` 400 → 600 ms, `dampingRatio` 0.55). Reanimated animations default to `ReduceMotion.System`, which would skip the 200 ms fade, so `Entrance` passes `ReduceMotion.Never` and keeps the Reduce Motion decision in `useReduceMotion`.
- **Pure branch logic** (`components/ui/motion.ts`): `entranceFor(reduceMotion): 'spring' | 'fade'` and `pressTravelDurationFor(reduceMotion): number` (0 or `pressDurationMs`). Unit-tested without animating.
- **`Entrance`** (`components/ui/entrance.tsx`): wraps children in an `Animated.View`; on mount runs either the spring (props: `from: 'below' | 'small'`, spring config) or a `withTiming` opacity fade of `reducedFadeMs`. Used with `key={card.id}` around `CardFace` in `play-screen.tsx` (`from: 'below'`, `cardSpring`: translateY 24 → 0, opacity 0 → 1), around the mascot tile in `level-up-overlay.tsx` (`from: 'small'`, `celebrationSpring`, scale 0.4 → 1), and around the crowned mascot in `ranking-header.tsx` (`from: 'small'`, `cardSpring`, scale 0.6 → 1). Transforms do not change layout, so the D4 measurement is unaffected.
- *Alternative:* Reanimated layout animations (`entering={ZoomIn.springify()}`). Rejected: less control over the exact token values, and harder to assert in Jest.

### D6. One Reduce Motion seam, live

`hooks/use-reduce-motion.ts` exports `useReduceMotion(): boolean`: initial value from Reanimated's synchronous `useReducedMotion()` (no first-frame flash), then kept current with `AccessibilityInfo.addEventListener('reduceMotionChanged', …)` (React Native core), because Reanimated's value is frozen at launch. Every motion consumer reads this one hook, so tests mock one module.

### D7. Shared press feedback and haptics

`components/ui/use-press-feedback.ts` exports `usePressFeedback({ travel })` → `{ onPressIn, onPressOut, animatedFaceStyle }`. `onPressIn` animates translateY to `travel` over `pressTravelDurationFor(reduceMotion)` and calls `playPressHaptic()`; `onPressOut` animates back. `Button` and `ClayButton` keep their `Pressable` as the static hit area (accessibility props unchanged) and move only an inner `Animated.View` face, replacing their `pressed &&` transforms (**pattern detected** and removed).

`components/ui/haptics.ts` exports `playPressHaptic()`:

- iOS: `Haptics.impactAsync(ImpactFeedbackStyle.Light)`.
- Android: `Haptics.performAndroidHapticsAsync(AndroidHaptics.Virtual_Key)` (the docs' recommended engine API, the standard key-press feel).
- Web: no call.
- Fire-and-forget: the promise is not awaited and its rejection is caught and ignored.

`app.json` adds `android.blockedPermissions: ["android.permission.VIBRATE"]`, since nothing uses `Vibrator`; this keeps the store permission list unchanged. Confirm the `blockedPermissions` key in the SDK 58 app config docs during apply.

- *Alternative:* `impactAsync` everywhere. Rejected on Android: it uses the discouraged `Vibrator` path and needs `VIBRATE`.

### D8. Jest setup for Reanimated and haptics

First write a component test that renders `Entrance` and fails. Only if the `jest-expo` preset does not already handle Reanimated 4, apply the documented setup: `resolver: 'react-native-reanimated/jest/resolver'` and a `jest-setup.ts` with `setUpTests()` in `setupFilesAfterEnv` (in the `package.json` `jest` block). `expo-haptics` is mocked per test file with `jest.mock`. *Applied:* the plain preset cannot load Reanimated 4 (`loadUnpackersWithCode` is undefined), so the setup above is in place; `jest-setup.ts` also imports the matcher's global typing, which ships only in Reanimated's native declarations. Motion tests mock `@/hooks/use-reduce-motion` to cover both branches.

### D9. Crop script

`scripts/crop-brand-art.py` gains a `CARD_ILLUSTRATIONS` list of `(key, box, square)` for the draft sheet (raw pixel coordinates, since `cut()` only rescales 2000 px-wide sheets and the Flow sheet is 16:9) plus the `mascot-surprised` box on the expressions sheet. Faces use `fit(square=True)`; full-body pieces, `mascot-dancing`, and props use `fit(square=False)`. Output is sized so 120 pt at 3× (about 360 px tall) is never upscaled. It writes only `assets/images/brand/card-<key>.png`; the existing outputs are re-written byte-identical or the run is limited to the new table with a flag (decide by checking `git status` after a run: nothing else in `assets/` may change). *Applied:* a `--cards-only` flag limits the run to the card table; cells are the 6 × 3 grid in raw pixels (labels excluded); pieces are padded and scaled to 384 px tall in one step without upscaling, then saved as 256-color palette PNGs (19 files, about 0.4 MB instead of 2.3 MB as RGBA); the sheet itself is stored at JPEG quality 85 (about 460 KB) for the 500 KB pre-commit limit, and the PNGs are cropped from that stored sheet; `mascot-selfie` and `mascot-diva`, whose bodies are open at the bottom, are cropped where their outline ends and flood-filled without bottom seeds so the white body is kept.

### D10. Content tagging and the skill

Tags are added to `catalog/la-previa.json` and `catalog/entre-dos.json` by format and mood (story § Illustration library, "Typical cards"). Recurring formats map to one key everywhere ("Cultura time" → `mascot-monocle`, "Historytime" → `mascot-reading-book`, "Momento sad" → `mascot-sad-map-pin`). Keys with no fitting card (likely `rooster`, `two-dogs`, `microphone`) get new cards via the `write-cards` skill; they are added with "pending human review" in the batch review note (launch-catalog review gate). `ai-specs/skills/write-cards/SKILL.md` emits `illustration` from `illustrationKeys` and keeps `illustrationIdea` only to request art that does not exist yet; `write-cards-skill-test.ts` is updated to match.

### D11. Draft-sheet generation (Google Flow, Nano Banana Pro)

The sheet is generated in **Google Flow** (the product owner's "Prendidos" project, where the existing brand drafts were made) with **Nano Banana Pro**, **16:9**, **4 candidates per run**. The product owner signs in; the agent drives the browser: it attaches the project's mascot expressions sheet and the favorited cat turnaround sheet as references, enters the prompt below, compares the 4 candidates against the review checklist, picks a winner, and downloads it to `docs/brand/references/card-illustrations-ai-draft.jpg`. The product owner confirms the pick (the human gate, task 10.2). If no candidate passes, the agent re-runs, or regenerates single pieces in a follow-up run.

- *Why 16:9 instead of a square 2000 px sheet:* a 6 × 3 grid on a square leaves each piece about 330 px wide, below the ~360 px needed for 120 pt at 3×; a wide sheet gives each cell more pixels. The crop script already takes raw pixel boxes for sheets that are not 2000 px wide (D9).

> A wide 16:9 sticker sheet on a plain white background: a 6 x 3 grid of 18 separate illustrations with generous white space between them, nothing touching its neighbors, and a small grey number (1-18) under each, numbered left to right, top to bottom. Match the style of the attached reference sheets exactly: flat 2D cartoon, thick dark-brown outline (#2A1608), no gradients, no shadows, no text or letters inside any drawing. The mascot is the same white cat from the reference sheets with the same flat three-layer flame on its head (red #C01E1B, orange, yellow #FFC93C). Props and animals use the same style and outline and have no flame. Nobody drinks, and nobody looks drunk, dizzy, sleepy, or sick.
> 1 cat with a monocle and one raised eyebrow · 2 cat with reading glasses peeking over an open book · 3 cat with teary eyes and a wobbly mouth · 4 sad cat next to a map pin with a dotted plane path · 5 cat blowing a kiss with a small heart · 6 cat with triangular sunglasses and a wide grin · 7 cat dancing with star-shaped glasses and wavy arms · 8 cheeky cat with its tongue out · 9 annoyed cat with side-eye and a flat mouth · 10 cat with dollar-sign eyes holding up a phone for a selfie · 11 gender-neutral diva cat with sunglasses pushed up, a hand flip, and sparkles, no lipstick or makeup · 12 phone ringing with exclamation marks and a blank screen · 13 retro microphone · 14 color wheel with simple animal heads · 15 shot glass with the flat three-layer flame on top · 16 two glasses clinking · 17 cartoon rooster mid-cluck · 18 two dogs, one in sunglasses.

Grid number = order of the draft keys in the library. Review checklist: art rules (brand-art spec), clean white gaps for the flood-fill crop, accessories not touching neighbors.

### D12. Docs before code

`docs/brand/README.md` (library table, art rules, new sheet with review status and known issues), `docs/brand/design-tokens.md` (mascot only in the illustration slot; `Motion` values including the 200 ms fade; haptics per platform), `docs/content/card-templates.md` (close "Mascot on the game card" and "Illustration library size"; rendering-rules status), `docs/data-model.md` (`illustration: IllustrationKey`), `docs/content/README.md` (legacy → key mapping).

## Risks / Trade-offs

- [AI art quality or style drift across the sheet] → human gate before Phase B; pieces that fail review are regenerated individually or dropped with their key (and the spec's key list updated through this change's artifacts first).
- [`onLayout` gives a one-frame text-only state before the art appears] → intended: text never moves; the illustration appears below finished text, inside the card's entrance animation window.
- [Slot measurement on group cards differs because the rule box sits below the slot] → the slot is above the rule box on both faces, so the same helper applies; covered by group-card tests.
- [Spring config names differ in Reanimated 4.7] → verify against its API docs during apply; tokens keep the same meaning either way.
- [Reduce Motion read at launch only in Reanimated] → D6 listener keeps it live.
- [Android haptic constant feels weak or does nothing on old API levels] → acceptable: haptics are best-effort and never block the press; checked on the emulator and noted in the report.
- [Bundle growth] → PNGs cropped to content and capped at ~360 px tall; check total added size with `npx expo export` before and after Phase B (budget under 1.5 MB).
- [Store review of drink imagery] → drink props only on group toasts or shared-drink cards; tag review is part of the content review.
- [Shared files touched by other changes] (`components/ui/`, `theme.ts`, `card-face.tsx`, catalog JSON) → no other change is open today; re-check `openspec list` before apply.

## Migration Plan

1. Phase A ships behind no flag: cards without keys render as today, so it is safe on its own.
2. Phase B adds keys one commit at a time.
3. Release requires a new native build (`expo-haptics`). `app.json` has no `updates` / `runtimeVersion` today, so no OTA channel can receive this by mistake; if EAS Update is configured before release, never publish this change to a runtime version built without `expo-haptics`.
4. Rollback: revert the change; no stored data depends on illustrations.
