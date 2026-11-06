# HU-15 — Card illustrations and mascot moments

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Status     | Implemented — pending archive (`openspec/changes/hu-15-illustrations-and-motion`; device checks and Maestro E2E pending) |
| Priority   | P2                                                        |
| Depends on | HU-02, HU-05, HU-06, HU-07                                |
| Blocks     | —                                                         |
| Screen     | Home, turn screen, ranking                                |
| PRD        | §9; `docs/brand/README.md`, `docs/brand/design-tokens.md`; legacy cards in `docs/content/legacy/` |

## Original

### User Story

**As a** player,
**I want** the cards and key moments to feel colorful and cartoonish with the Prendidos mascot,
**So that** the game feels like a party and not a form.

### Context

The brand is defined (cartoon clay, flame mascot, player avatars) and the card model already has an illustration slot. The playable build ships text-only; this story brings the visual personality.

### Acceptance Criteria

- [ ] Cards with an illustration key show the matching illustration without pushing the text or buttons off small phones.
- [ ] Players get an avatar from the brand avatar palette in setup, turn screen, and ranking.
- [ ] The mascot appears at the winner moment and on the home screen following the brand rules.
- [ ] Motion follows the design tokens and respects the system "Reduce Motion" setting.

### Out of Scope

- New brand assets beyond those in `docs/brand`.
- Animated card transitions beyond the tokens' defaults.

### Business Value

Visual delight drives word of mouth and store screenshots, the main organic acquisition channel for a party game.

## Enhanced

### Where things stand (checked against `main` on 2026-11-05)

Half of this story already shipped with the design alignment changes (`brand-art-foundation`, `player-avatar`, `align-*`, archived 2026-10-31). Those criteria are regression checks only. The work left is **card illustrations** (art and rendering) and **motion**.

| Original criterion | State on `main`                                                                                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card illustrations | **Open.** `Card.illustration` is a free `string`, the validator accepts any text, no catalog card sets it, there is no illustration library, and `CardFace` never renders it. Only 5 mascot arts are bundled (`wink`, `laugh`, `relaxed`, `smirk`, `pointing`, plus `icon`). |
| Player avatars     | **Done.** `PlayerAvatar` shows the 12 interim cats in setup (`player-row.tsx` 56 pt, `player-summary-row.tsx` 36 pt), on the turn card (`card-face.tsx` 60 pt), on the group "Seguir" button (`play-screen.tsx`), and in the ranking (`podium.tsx`, `ranking-rows.tsx`). Spec: `openspec/specs/brand-art`. |
| Mascot moments     | **Done (static).** Home logo tile (`home-screen.tsx`, `Mascot art="icon"`), crowned winking mascot on the ranking (`ranking-header.tsx` + `crown.tsx`), plus the age gate and level-up overlay.                                                                     |
| Motion             | **Open.** Nothing animates. `react-native-reanimated` 4.7 and `react-native-worklets` are installed but unused; the level-up requirement says "without motion"; `expo-haptics` is not installed.                                                                      |

### What the legacy cards set as the bar

The Flutter app's 31 designed cards (`docs/content/legacy/cards/`, transcribed in `legacy-challenges.json` → `face.illustration`) are the reference for the look this story must reach. 24 of them carry an illustration, with 21 distinct pieces: mostly the white cat in a funny expression or pose with one accessory (monocle, sunglasses, star glasses with dancing arms, reading glasses and a book, dollar eyes taking a selfie, crying, blowing a kiss), plus props (shot glass on fire, two glasses toasting, animal wheel, phone) and guest animals (rooster, two dogs). The illustration sits large below the text, and one piece is reused across a recurring format ("Cultura time" always gets the monocle). A text-only card with four mascot faces would fall short of this, so the library below carries the legacy cast into the current brand.

### Product decisions (2026-11-05)

1. **The card illustration library comes from the legacy cards**, redrawn in the current brand: the white cat **with its flat flame** (it is Prendido), `ink` outline, flat 2D, no text inside the art. All four groups are in: mascot expressions and poses, neutral props, drink props, and guest animals.
2. **HU-15 produces the art** as interim AI drafts, through the same pipeline as today's brand art: a 2000 px draft sheet in `docs/brand/references/` → `scripts/crop-brand-art.py` → transparent PNGs in `assets/images/brand/`. The vector redraw stays a later, pre-marketing task (`docs/brand/README.md` § Known Issues). This replaces the original out-of-scope line "new brand assets".
3. **Legacy pieces that break brand or store rules are redesigned or dropped:**
   - Diva lips → a gender-neutral **diva** (sunglasses pushed up, hand flip, sparkles; no lipstick or makeup).
   - Phone with "XXX" → a generic **ringing phone** (exclamation marks, blank screen).
   - Police cap ("tombo") → dropped (stereotype).
   - Spain map pin with speech bubbles → dropped (baked-in text and an insult).
   - The mascot never holds a drink. The legacy full-body wink held a shot; the existing `pointing` pose replaces it.
4. **The mascot is allowed on the game card only in the illustration slot**, below the text, and only when it fits. This amends "never place the mascot on the game card" in `design-tokens.md` (the recommendation in `docs/content/card-templates.md` § Open Decisions).
5. **Motion:** all three token moments ship: press (120 ms + light haptic), new card (spring with a small overshoot, 300–450 ms), and level up (about 600 ms), plus a small pop on the winner's crowned mascot. Every one becomes a fade under "Reduce Motion".
6. **`expo-haptics` is added** for the press haptic.

### Illustration library (launch set: 24 keys)

`Source` says where the art comes from: **bundled** = already in `assets/images/brand/`; **crop** = in an existing draft sheet, only needs a crop box; **draft** = new piece for the card-illustrations draft sheet.

| Key                     | Art                                                          | Legacy reference              | Typical cards                                         | Source  |
| ----------------------- | ------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------- | ------- |
| `mascot-wink`           | Winking face                                                 | (brand)                       | Teasing, flirty                                       | bundled |
| `mascot-relaxed`        | Relaxed, eyes closed                                         | (brand)                       | Easy-going Suave cards                                | bundled |
| `mascot-smirk`          | Raised eyebrow, side smirk                                   | (brand)                       | Picante cards                                         | bundled |
| `mascot-laugh`          | Laughing                                                     | (brand)                       | Prendido cards, funny dares                           | bundled |
| `mascot-pointing`       | Full body, winking and pointing                              | `150F2E47` (without the drink) | "Abra la jeta"-style dares aimed at someone           | bundled |
| `mascot-surprised`      | Wide-eyed, mouth open                                        | `27FBE2FA`                    | Gossip ("chisme"), reveals                            | crop (expressions #3) |
| `mascot-monocle`        | Monocle, one raised eyebrow                                  | `87AFEB01`, `0952151E`        | "Cultura time" trivia rounds                          | draft   |
| `mascot-reading-book`   | Reading glasses behind an open book                          | `BE10B9F4`                    | "Historytime", storytelling truths                    | draft   |
| `mascot-crying`         | Teary eyes, wobbly mouth                                     | `0128B710`                    | Sad or embarrassing confessions                       | draft   |
| `mascot-sad-map-pin`    | Sad face, map pin and a dotted plane path                    | `AB0271E1`                    | "Momento sad", travel questions                       | draft   |
| `mascot-blowing-kiss`   | Blowing a kiss with a small heart                            | `07E1B1B1`, `67FAA195`        | Romantic and flirty cards, `Pareja`                   | draft   |
| `mascot-sunglasses`     | Triangular sunglasses, wide grin                             | `0E00B38B`                    | "Se puso bueno esto", bold dares                      | draft   |
| `mascot-dancing`        | Star-shaped glasses, wavy dancing arms                       | `D62E0E5C`                    | Dance challenges                                      | draft   |
| `mascot-tongue-out`     | Cheeky grin, tongue out                                      | `D6F0E557`                    | Cheeky "muestre eso" dares                            | draft   |
| `mascot-annoyed`        | Side-eye, flat mouth                                         | `B8530F01`                    | "Uy re pailas", calls the group picks                 | draft   |
| `mascot-selfie`         | Dollar-sign eyes, holding up a phone for a selfie            | `FED27DA1`                    | Photo and selfie challenges                           | draft   |
| `mascot-diva`           | Sunglasses pushed up, hand flip, sparkles (gender-neutral)   | `B3352FE5`, `93E76F0C` (redesigned) | "Llegó la diva" formats                          | draft   |
| `phone-ringing`         | Phone with exclamation marks, blank screen                   | `A79D1EE1` (redesigned)       | Cards with `reachesOutside` (calls, messages)         | draft   |
| `microphone`            | Retro microphone                                             | — (new; legacy singing card `3333651F` was text-only) | Singing challenges                 | draft   |
| `animal-wheel`          | Color wheel with simple animal heads                         | `5900AD23`                    | "Todos escojan un animal"                             | draft   |
| `shot-glass-on-fire`    | Shot glass with the flat three-layer flame                   | `start`                       | Opening card, group toasts                            | draft   |
| `glasses-toasting`      | Two glasses clinking                                         | `04E05904`                    | Friendship toasts ("por la amistad")                  | draft   |
| `rooster`               | Cartoon rooster, mid-cluck                                   | `2B0A3F96`                    | Animal imitation dares                                | draft   |
| `two-dogs`              | Two dogs, one in sunglasses                                  | `B1757B35`                    | "Hablen ladrando", animal rounds                      | draft   |

**Art rules for the library** (added to `docs/brand/README.md`):

- **Mascot pieces:** white head with the flat three-layer flame (`brandRed` / `primary` / `flameYellow`) and an `ink` outline. The flame is what tells them apart from the player avatars, which reuse some legacy expressions (triangular sunglasses, star glasses, tongue out, kiss, round glasses) with colored heads and no flame.
- **Guest animals and props:** same flat style and `ink` outline, **no flame** (the flame belongs to the mascot). Guest animals never become avatars.
- **No text** inside any piece: no speech bubbles, signs, or screen text (`card-templates.md` rendering rule 1).
- **Drink props** (`shot-glass-on-fire`, `glasses-toasting`) only on group toasts or cards whose instruction is a shared drink. Never on cards about drinking fast or a lot, never with a character drinking, and always within `ai-specs/skills/write-cards/references/policy.md` and App Store guideline 1.4.3.
- **Never** drunk, dizzy, sleepy, or sick. The expressions sheet faces `4` and both `7` stay banned.
- **Frame:** each piece is cropped to its content on a transparent background. Faces are square; full-body pieces, `mascot-dancing`, and props keep their own aspect ratio.

### Acceptance criteria (refined)

**Illustration art**

- [ ] A card-illustrations draft sheet (`docs/brand/references/card-illustrations-ai-draft.jpg`, 2000 px, numbered grid) holds the 18 **draft** pieces above, reviewed against the art rules. The brand README lists it with its review status and known issues.
- [ ] `scripts/crop-brand-art.py` writes one transparent PNG per new key (`assets/images/brand/card-<key>.png`), including `mascot-surprised` from the expressions sheet, and nothing else in `assets/` changes.

**Card illustrations in the app**

- [ ] A card whose `illustration` key is set shows the matching art centered below the card text and notes (above the penalty footer on individual cards; above the rule box on group cards), at up to 120 pt tall.
- [ ] The illustration is decorative: screen readers skip it, since the text carries the card.
- [ ] Text wins: when the card text, notes, and illustration do not all fit the visible card area without scrolling, the illustration is hidden and the card renders text-only. Checked on iPhone SE (375 × 667 pt) at the default and largest Dynamic Type sizes, and the turn buttons never move.
- [ ] The content validator rejects an unknown illustration key as an error, so shipped content can never point to missing art.
- [ ] Every key in the library is used by at least one shipped card, and each level of each launch category (`la-previa`, `entre-dos`) has illustrated cards. Recurring formats always get the same key (for example, every "Cultura time" card gets `mascot-monocle`). When no existing card fits a key (for example, `rooster` or `two-dogs`), a new card is written with the `write-cards` skill and passes the HU-07 content review.

**Avatars and mascot (regression)**

- [ ] Avatars still show in setup, on the turn card and group "Seguir" button, and in the podium and ranking rows, at the sizes in `design-tokens.md` § Player Avatars in the UI.
- [ ] The home logo tile and the crowned winking mascot on the ranking are unchanged in art and size (48 pt mascot, never larger than the podium avatars).

**Motion**

- [ ] Press: every clay button (shared `Button` and the turn screen's `ClayButton`) sinks by `PressedTravel` over 120 ms on press-in, comes back on release, and fires one light haptic on native platforms.
- [ ] New card: each new card (individual or group) enters with a spring with a small overshoot that settles within 450 ms. A swapped card enters the same way.
- [ ] Level up: the mascot tile on the level-up overlay grows from small to full size with an overshoot in about 600 ms. (The interim art has no separate flame layer, so the whole face grows; flame-only growth waits for the vector redraw.)
- [ ] Winner: the crowned mascot on the ranking pops in once (spring, ≤ 450 ms) when the screen opens.
- [ ] Reduce Motion on (iOS "Reduce Motion", Android "Remove animations"): new card, level up, and winner become a 200 ms opacity fade; the press shows the sunk state instantly with no travel animation; the haptic still fires (it is not motion).
- [ ] No screen animates more than two elements at once (tokens § Motion). Animations run on the UI thread and never block a tap: the turn buttons are usable while a card is still entering.

### Technical approach

**Art pipeline**

- The agent writes the draft-sheet prompt (grid order = table order, art rules above, the existing mascot sheets as style reference) into the OpenSpec `design.md`. The product owner generates the sheet with the same image tool used for the current drafts and drops it into `docs/brand/references/`. **Human gate:** the code tasks for the draft keys start only after the sheet is reviewed.
- `scripts/crop-brand-art.py`: add a `CARD_ILLUSTRATIONS` table of crop boxes (sheet display coordinates, as the script already uses) plus the expressions-sheet crop for `mascot-surprised`. Reuse `cut()` and `fit(square=False)` for non-square pieces. Run it in a throwaway venv with Pillow, as its docstring says.

**Illustration library (content + brand art)**

- `src/features/content/card-types.ts`: add `export const illustrationKeys = [...] as const` with the 24 keys in table order, and `export type IllustrationKey = (typeof illustrationKeys)[number];`. Change `CardBase.illustration?: string` to `illustration?: IllustrationKey`.
- `src/features/content/validate-cards.ts`: replace `checkOptionalText(report, 'illustration', …)` with a check that reports a new `unknownIllustration` violation (`severity: 'error'`) when the value is not in `illustrationKeys`. Blank strings stay `missingField`, as today.
- `src/components/ui/brand-art.ts`: add `export const cardIllustrationArt: Record<IllustrationKey, { source: BundledImage; aspectRatio: number }>`. The five **bundled** keys reuse the existing `mascotArt` sources; the rest point to `card-<key>.png`. The `Record` type makes a key without art a type error.
- `src/components/ui/card-illustration.tsx`: `CardIllustration({ illustration, height })` renders the art with `expo-image` (`contentFit="contain"`, width from `aspectRatio`), decorative (`accessible={false}`, `importantForAccessibility="no-hide-descendants"`). It lives in `components/ui/` so screens never touch raw image files (`brand-art.ts` rule).
- **Incremental order (baby steps):** first ship the type, validator, slot, and fit rule with the six keys whose art exists today (`bundled` + `mascot-surprised`); then add the 18 draft keys once their PNGs exist. Each key enters `illustrationKeys` and `cardIllustrationArt` in the same commit as its PNG.

**Card slot and "text wins" (turn screen)**

- `src/features/play/illustration-fit.ts` (pure): `fitsIllustration({ cardAreaHeight, cardContentHeight, illustrationHeight, gap }): boolean`, true only when `cardContentHeight + gap + illustrationHeight <= cardAreaHeight`.
- `play-screen.tsx` measures the card `ScrollView` viewport (`onLayout`); `card-face.tsx` measures the card content laid out **without** the illustration and receives `showIllustration`. The illustration renders only once the fit check passes (default hidden), so the first frame is text-only and the text never reflows down. Re-evaluate when the card, the window size, or the font scale changes.
- Group cards (`GroupCardFace`) use the same slot and fit rule.

**Content tagging**

- Tag cards in `src/features/content/catalog/*.json` by format and mood (table above). New cards for unused keys go through `write-cards`. Update `ai-specs/skills/write-cards/SKILL.md` so the skill emits a valid `illustration` key from `illustrationKeys` instead of the free-text `illustrationIdea` note (keep `illustrationIdea` only to request art that does not exist yet).

**Motion**

- `src/constants/theme.ts`: add `Motion` tokens: `pressDurationMs: 120`, `cardEnterMaxMs: 450`, `levelUpDurationMs: 600`, `reducedFadeMs: 200`, and spring configs `cardSpring` and `celebrationSpring` (damping and stiffness chosen so they settle within the limits; documented in `design-tokens.md`).
- `src/hooks/use-reduce-motion.ts`: `useReduceMotion(): boolean`, the single seam over Reanimated's reduced-motion hook, so tests can mock one module.
- `src/components/ui/motion.ts` (pure): `entranceFor(reduceMotion): 'spring' | 'fade'` and similar helpers, so the branch logic is unit-tested without running animations.
- `src/components/ui/use-press-feedback.ts`: `usePressFeedback()` returns `onPressIn`, `onPressOut`, and an animated style (translateY to `PressedTravel` over `Motion.pressDurationMs`, shadow shrinking to 1; instant under Reduce Motion) and fires `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on native. Haptics are fire-and-forget: a rejected promise is caught and ignored. **Pattern detected:** `Button` (`components/ui/button.tsx`) and `ClayButton` (`features/play/play-pieces.tsx`) duplicate the clay press; both adopt this hook instead of their own `pressed &&` transform.
- `src/components/ui/entrance.tsx`: `Entrance` wraps children in an `Animated.View` that runs the spring or the fade on mount. Used with `key={card.id}` around `CardFace` in `play-screen.tsx`, around the mascot tile in `level-up-overlay.tsx` (`celebrationSpring`, `levelUpDurationMs`), and around the crowned mascot in `ranking-header.tsx`.
- **Docs first (CLAUDE.md §2.3):** before coding, read the Reanimated and `expo-haptics` pages for Expo SDK 58 (`https://docs.expo.dev/versions/v58.0.0/`) for the reduced-motion hook, layout animation vs. shared-value API, Jest setup, and the web behavior of haptics. Do not assume API names from memory.

**Dependency**

- `npx expo install expo-haptics` (no config plugin expected; confirm in the SDK 58 docs). No other new dependency. Pillow stays a throwaway dev tool, not a project dependency.

### Files

| Area          | Files                                                                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Art           | New `docs/brand/references/card-illustrations-ai-draft.jpg`; `scripts/crop-brand-art.py`; new `assets/images/brand/card-*.png` (19 files)                                                                                                                                                                    |
| Content       | `src/features/content/card-types.ts`, `validate-cards.ts`, `catalog/la-previa.json`, `catalog/entre-dos.json` (add `illustration` keys, plus new cards for unused keys); `ai-specs/skills/write-cards/SKILL.md`                                                                                                |
| Shared UI     | `src/components/ui/brand-art.ts`, `button.tsx`, new `card-illustration.tsx`, `use-press-feedback.ts`, `entrance.tsx`, `motion.ts`; `src/constants/theme.ts` (`Motion`); new `src/hooks/use-reduce-motion.ts`                                                                                                    |
| Turn screen   | `src/features/play/card-face.tsx`, `play-screen.tsx`, `play-pieces.tsx` (`ClayButton`), `level-up-overlay.tsx`, new `illustration-fit.ts`                                                                                                                                                                       |
| Ranking       | `src/features/results/ranking-header.tsx`                                                                                                                                                                                                                                                                    |
| Dependencies  | `package.json`, `package-lock.json` (`expo-haptics`)                                                                                                                                                                                                                                                         |
| Docs          | `docs/brand/README.md` (library, art rules, new sheet, known issues), `docs/brand/design-tokens.md` (mascot-on-card rule, `Motion` values incl. the 200 ms fade), `docs/content/card-templates.md` (close the "Mascot on the game card" and "Illustration library size" decisions; rendering-rules status), `docs/data-model.md` (`illustration: IllustrationKey`), `docs/content/README.md` (legacy → key mapping) |
| OpenSpec      | Change `hu-15-illustrations-and-motion` with deltas: `card-content` (ADDED illustration key validation and coverage), `brand-art` (ADDED card illustration library), `turn-screen` (ADDED card illustration + text-wins, ADDED new-card entrance, MODIFIED Level up: drop "without motion"), `final-ranking` (ADDED winner pop), `app-shell` (ADDED press feedback, haptics, and Reduce Motion fallback) |
| Tests         | `__tests__/` next to each module (below)                                                                                                                                                                                                                                                                    |

No home change: the logo tile stays static, so the home screen keeps zero animated elements besides button presses.

**Ownership:** HU-15 is a Phase C story, so it may edit the HU-00 shared files listed above. Run it when no other change touches `src/components/ui/`, `theme.ts`, `card-face.tsx`, or the catalog JSON, or coordinate in each `design.md`.

### Endpoints and data

- No backend, no network, no endpoints (`docs/base-standards.md` §2.4).
- Data change: `Card.illustration` narrows from `string` to `IllustrationKey`. No storage change: illustrations are not stored in `DeviceState` or `GameSession`, and `device.v1` stays as is.

### Tests (TDD: write them failing first)

- `content/__tests__/validate-cards-test.ts`: unknown key → `unknownIllustration` error; each key in `illustrationKeys` passes; blank → `missingField`.
- `content/__tests__/catalog-test.ts`: the shipped catalog has no errors; every `illustrationKeys` entry is used by at least one card; each level of each category has illustrated cards.
- `components/ui/__tests__/brand-art-test.tsx`: every `IllustrationKey` has a bundled source and a positive aspect ratio; `CardIllustration` is hidden from accessibility and sizes width from the aspect ratio.
- `components/ui/__tests__/motion-test.ts`: `entranceFor(true) === 'fade'`, `entranceFor(false) === 'spring'`; press travel is instant under Reduce Motion.
- `components/ui/__tests__/use-press-feedback-test.tsx`: press-in fires one light haptic on native and none on web; a rejected haptic does not throw; works with Reduce Motion on.
- `play/__tests__/illustration-fit-test.ts`: fits / does not fit / exact boundary / zero area.
- `play/__tests__/card-face-test.tsx`: a card with a key and room shows the illustration; without a key or without room it does not; the illustration is not in the accessibility tree; group cards follow the same rule.
- `play/__tests__/play-screen-test.tsx` and `results/__tests__/results-screen-test.tsx`: card, level-up, and winner render the same content with Reduce Motion on and off (mock `useReduceMotion`); turn buttons respond while a card enters.
- The crop script is a dev tool without unit tests; its output is checked visually in review (transparent edges, no clipped accessories).
- Coverage stays ≥ 90 % on `src/features/**`.

### Non-functional requirements

- **Performance:** all animations run on the UI thread (Reanimated worklets), no `setTimeout` or JS-driven frames. Illustration PNGs are cropped to content and sized for ≤ 120 pt at 3× (about 360 px tall); the 19 new PNGs should add under 1.5 MB to the bundle in total (check with `npx expo export` before and after). The fit check measures once per card, not per frame.
- **Accessibility:** Reduce Motion fallback as above; illustrations decorative; text never shrinks or truncates to make room for art; touch targets unchanged (≥ 44 pt / 48 dp).
- **Brand:** the art rules above; no new UI colors or fonts; no hex literals outside `theme.ts`.
- **Compliance:** no explicit imagery; drink props only as allowed above; the mascot never drinks and is never drunk or sick (`docs/brand/README.md`, App Store 1.4.3, Google Play alcohol policy).
- **Ownership of art:** purely AI-generated art may have weak copyright protection (brand README § Known Issues); the vector redraw before launch marketing covers this library too.
- **Security and privacy:** no new data, permissions, or network calls; `expo-haptics` needs no permission.
- **Observability:** nothing to log until HU-13 (anonymous analytics); no new events here.

### Definition of done

- [ ] Docs updated first: `docs/brand/README.md`, `design-tokens.md`, `card-templates.md`, `data-model.md`, and `docs/content/README.md` reflect the decisions above.
- [ ] Draft sheet generated, reviewed against the art rules, and cropped; the 19 PNGs are in `assets/images/brand/`.
- [ ] OpenSpec change `hu-15-illustrations-and-motion` proposed, applied, adversarially reviewed, and archived; spec deltas synced.
- [ ] Every refined acceptance criterion covered by a test (RNTL v14 async APIs: always `await` `render`, `renderHook`, `fireEvent`); `npm test` green with coverage ≥ 90 %.
- [ ] `npx expo lint` and `npx tsc --noEmit` clean.
- [ ] Checked in the running app on the iOS Simulator (iPhone SE and a large iPhone) and an Android emulator, with Reduce Motion / Remove animations both off and on, and at the largest font size: illustrated cards fit or fall back to text-only, the turn buttons never move, the motion matches the tokens. Screenshots attached to the PR, including a few illustrated cards per level for store screenshots.
- [ ] `docs/user-stories/README.md` story row and this file's status updated to Implemented with the archive path.

### Out of scope (refined)

- The vector redraw of the library, the mascot, and the avatars (a pre-marketing task).
- Crown art and flame-size variants for the level-up screen (`design-tokens.md` § Where the mascot appears).
- Dropped legacy pieces: police cap, Spain map pin, phone with "XXX", diva lips.
- A recurring-format key that brings a default headline and illustration (`card-templates.md` § Open Decisions); this story tags formats by hand.
- Speech bubbles and any text inside illustrations.
- Screen transitions, card swipes, or gesture-driven card dismissal.
- Home "Continuar partida" group preview (HU-12).
- Sound effects.
