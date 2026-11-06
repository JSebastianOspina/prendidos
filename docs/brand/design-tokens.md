---
description: Prendidos visual design tokens (color, typography, shape, elevation, motion) and mascot usage rules for the app UI. Read before building or reviewing any screen.
alwaysApply: false
---

# Design Tokens

Final visual tokens for the Prendidos app UI. The style is **cartoon clay**: chunky rounded pieces, a thick ink outline, and a hard offset shadow on a light background (`docs/prd.md` §9).

- **Mascot and brand assets:** character rules, reference files, and known issues live in [`README.md`](./README.md). This file only adds the rules that tie the mascot to the UI.
- **Origin:** generated with the `ui-ux-pro-max` skill (style *Claymorphism*, font pairing *Playful Creative*, stack `react-native`), then merged with the brand identity. The skill's generic blue accent was dropped in favor of the mascot's flame palette. Visual proposal: [Prendidos design canvas](https://claude.ai/artifact/MvyXoMrzhHxkWfbQq2ptCG) (private; share it from the canvas before linking it elsewhere).
- **Implementation:** these values go in `src/constants/theme.ts` and are read through `useTheme()` (`docs/frontend-standards.md`). Never hardcode them in components.
- **Theme:** light only. A dark theme is not defined yet.

## Color

| Token           | Hex                    | Use                                                                 |
| --------------- | ---------------------- | ------------------------------------------------------------------- |
| `ink`           | `#2A1608`              | Outlines, hard shadows, primary text. Never use pure black.         |
| `background`    | `#FFF7ED`              | Screen background                                                   |
| `surface`       | `#FFFFFF`              | Cards, inputs, secondary buttons                                    |
| `surfaceSoft`   | `#FED7AA`              | Soft chips, input borders, dividers, locked content                 |
| `textSecondary` | `#7C2D12`              | Subtitles and text links                                            |
| `textMuted`     | `#475569`              | Helper text and small labels                                        |
| `primary`       | `#F97316`              | Action buttons (text in `ink`)                                      |
| `brandRed`      | `#C01E1B`              | Brand surfaces (app icon, splash, "¡Esto se prendió!"), the home logo tile and "Prendidos" wordmark, paid content (Pase total, unlock cards, paywall, ranking upsell), and the `Prendido` level. As a surface, always with white text and white buttons; as a text color, only for the wordmark on `background` (5.8:1). Never the fill of an action button. |
| `flameYellow`   | `#FACC15`              | Group interlude card ("Yo nunca", "Todos los que…"), flame core (text in `ink`) |
| `points`        | `#F59E0B`              | Point badges, crowns, rewards. On `flameYellow`, use a white chip with an `ink` border. |
| `couple`        | `#EC4899`              | `Pareja` mode accents                                               |
| `negative`      | `#B91C1C`              | Negative scores (text only)                                         |
| `scrim`         | `rgba(42, 22, 8, 0.6)` | Overlay behind dialogs and sheets                                   |

The palette comes from the mascot's flame: `brandRed`, `primary`, `flameYellow`, and `ink`, plus `couple` and `levelEasy`. There is no blue accent. Dark surfaces such as "Continuar partida" and selected toggles ("No toma") use `ink` with white text. Player avatars have their own palette (see [Player Avatars in the UI](#player-avatars-in-the-ui)).

### Level scale

The three levels differ in lightness as well as hue, so they never rely on hue alone.

| Token         | Level    | Hex       | Text on it |
| ------------- | -------- | --------- | ---------- |
| `levelEasy`   | Suave    | `#6EE7B7` | `ink`      |
| `levelMedium` | Picante  | `#F97316` | `ink`      |
| `levelHard`   | Prendido | `#C01E1B` | **white**  |

### Flame

The mascot's flame is flat, in three outlined layers: `brandRed` outside, `primary` in the middle, and `flameYellow` at the core. No gradients.

### Contrast (WCAG 2.1 AA)

Checked with the WCAG relative-luminance formula. Body text needs 4.5:1; outlines and icons need 3:1.

| Pair                                | Ratio  | Result                           |
| ----------------------------------- | ------ | -------------------------------- |
| `ink` on `background`               | 16.3:1 | Pass                             |
| `ink` on `primary` / `levelMedium`  | 6.2:1  | Pass                             |
| `ink` on `levelEasy`                | 11.3:1 | Pass                             |
| White on `brandRed` / `levelHard`   | 6.1:1  | Pass                             |
| `ink` on `brandRed`                 | 2.8:1  | **Fail**: always use white text  |
| `ink` on `flameYellow`              | 11.3:1 | Pass                             |
| White on `ink`                      | 17.3:1 | Pass                             |
| `ink` on white (button on `brandRed`) | 17.3:1 | Pass                           |
| White button against `brandRed`     | 6.1:1  | Pass (non-text)                  |
| `ink` on `points`                   | 8.0:1  | Pass                             |
| `points` against `flameYellow`      | 1.4:1  | **Fail** (non-text): use a white chip with an `ink` border |
| `flameYellow` against `background`  | 1.4:1  | **Fail** (non-text): the 3 px `ink` border (11.3:1) carries the edge |
| `ink` on `couple`                   | 4.9:1  | Pass                             |
| `textSecondary` on `background`     | 8.8:1  | Pass                             |
| `textMuted` on `surface`            | 7.6:1  | Pass                             |
| `brandRed` on `background`          | 5.8:1  | Pass                             |

## Typography

Fredoka for titles and card text; Nunito for everything else. Load them with `@expo-google-fonts/fredoka` and `@expo-google-fonts/nunito`, installed with `npx expo install` when implemented.

| Role        | Font    | Weight | Size / line height | Example                    |
| ----------- | ------- | ------ | ------------------ | -------------------------- |
| Display     | Fredoka | 700    | 48–56 / 1.0        | "Prendidos", player name   |
| Title       | Fredoka | 700    | 32–40 / 1.1        | Screen titles              |
| Card text   | Fredoka | 600    | 28–30 / 1.2        | Challenge and truth text   |
| Button      | Fredoka | 600    | 19–24              | "¡Cumplió!"                |
| Body        | Nunito  | 700    | 15–17 / 1.45       | Descriptions               |
| Label       | Nunito  | 800    | 13, uppercase, letter spacing 0.08 em | "RONDA 4 DE 10" |

Support Dynamic Type and font scaling; card text must stay readable at arm's length.

**Card text steps** (`CardTextSteps` in `src/constants/theme.ts`): the turn card fits the visible area between the top bar and the turn actions without scrolling. Its body uses the largest of three sizes that fits, 29 / 35, 24 / 29, or 20 / 25 (size / line height, each scaled by the system font size), and steps down only when the card would otherwise scroll, or once more for an illustrated card when that gives its illustration at least 72 pt. Below 20 pt the card scrolls instead of shrinking further, which only happens at the largest accessibility sizes. The illustration takes the space left (72–160 pt); a card's own illustration may cost the body at most one step, never below 20 pt, while the default level face never does.

## Shape and Elevation

| Token               | Value                                   |
| ------------------- | --------------------------------------- |
| `borderWidth`       | 3 (2 for small controls inside a card)  |
| `radiusSm`          | 12                                      |
| `radiusMd`          | 16                                      |
| `radiusLg`          | 20 (buttons)                            |
| `radiusXl`          | 24–28 (cards and panels)                |
| `radiusCard`        | 34 (the game card)                      |
| `radiusPill`        | 999                                     |
| `shadowButton`      | `ink`, offset y 5, no blur              |
| `shadowCard`        | `ink`, offset y 6, no blur              |
| `shadowGameCard`    | `ink`, offset y 8, no blur              |
| `pressedOffset`     | The piece moves down 4 and the shadow shrinks to 1 |

Android elevation cannot draw a hard offset shadow. Build it as an `ink` layer behind the element, offset on the y axis, on both platforms.

## Spacing and Touch

- 4 / 8 spacing rhythm; 20 screen gutter; respect safe areas on every fixed bar.
- Minimum touch target 44 × 44 pt (iOS) / 48 × 48 dp (Android). Turn actions ("Cumplió" / "No cumplió") are 72 high, at the bottom, within thumb reach. Each carries a round 36 pt points badge on its top-right corner that does not sink with the press: `points` amber with "+N" on "¡Cumplió!", `negative` red with white "−N" on "No cumplió". "No cumplió" shows the penalty as its second line ("Toma 2 tragos"); the individual card has no penalty footer and no hint line (HU-15, decision of 2026-11-06).

## Motion

| Moment          | Spec                                                                                         | Token (`Motion` in `src/constants/theme.ts`) |
| --------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Press           | Clay face sinks by `PressedTravel` over 120 ms on press-in, comes back on release, one light haptic | `pressDurationMs: 120`                |
| New card        | Spring with a small overshoot (rises 24 pt, fades in) that settles within 450 ms; swapped cards too | `cardEnterMaxMs: 450`, `cardSpring`   |
| Level up        | Mascot tile grows from small to full size with an overshoot, about 600 ms; the emotional peak of a game. The interim art has no separate flame layer, so the whole face grows | `levelUpDurationMs: 600`, `celebrationSpring` |
| Winner          | Crowned ranking mascot pops in once (spring, ≤ 450 ms), stays 48 pt                          | `cardSpring`                                 |
| Reduced motion  | Every entrance becomes a 200 ms opacity fade with no movement or scaling; the press shows its sunk state instantly | `reducedFadeMs: 200`        |

Springs use Reanimated's duration-based config, whose `duration` is perceptual: the spring settles in 1.5 × it. `cardSpring` is `{ duration: 300, dampingRatio: 0.75 }` (settles in 450 ms, small overshoot) and `celebrationSpring` is `{ duration: 400, dampingRatio: 0.55 }` (settles in 600 ms, bigger overshoot). A new card rises 24 pt; the level-up mascot tile grows from 0.4 and the winner mascot from 0.6 of its size.

Animate at most one or two elements per screen. Animations run on the UI thread (Reanimated) and never delay a tap: controls outside an animating element stay usable while it moves.

**Reduce Motion** follows the system setting (iOS "Reduce Motion", Android "Remove animations") live, through one hook (`useReduceMotion`). Screens show the same content with it on or off.

**Haptics** (press only, never a motion substitute, so they still fire under Reduce Motion):

| Platform | Call                                                        |
| -------- | ----------------------------------------------------------- |
| iOS      | `impactAsync(ImpactFeedbackStyle.Light)`                    |
| Android  | `performAndroidHapticsAsync(AndroidHaptics.Virtual_Key)` (no `VIBRATE` permission; it is blocked in `app.json`) |
| Web      | None                                                        |

A haptic is fire-and-forget: if the device cannot play it (Low Power Mode, haptics off, an error), the press still runs.

## Mascot Usage in the UI

Character traits come from [`README.md`](./README.md). UI-specific rules:

- **Outline:** vectorize the cat with the UI `ink` color `#2A1608`, not pure black, so the mascot and the interface read as one system.
- **Flame:** use the flat three-layer flame described above.
- **Brand red:** the cat sits on `brandRed` in the app icon, the splash, the home logo tile, and the level-up screen. The home header itself stays on `background`: a full-width red band was tried and rejected as too heavy.
- **Attitude:** never use the drowsy or drunk-looking expressions (`4` and both `7` in `references/mascot-expressions-ai-draft.jpg`).
- **Small sizes:** at 48 px the silhouette (ears, flame, white head) still reads, but the wink and whiskers do not. Request a simplified icon for 48 px and below.
- **Interim art:** the AI drafts ship in the app as interim art until the vector redraw (`README.md`, decision of 2026-10-31). Show them through `Mascot` (art `wink`, `laugh`, `relaxed`, `smirk`, `pointing`, `icon`) and card illustrations through `CardIllustration` (the 60 library keys), never as raw image files. The "PLACEHOLDER IA" tags in the proposal are annotations, not UI.

### Flame by level (level-up screen)

| Level    | Face                         | Flame                  |
| -------- | ---------------------------- | ---------------------- |
| Suave    | Relaxed, eyes closed         | Small                  |
| Picante  | Raised eyebrow, side smirk   | Medium                 |
| Prendido | Laughing                     | Whole head on fire     |

### Where the mascot appears

| Screen                   | Art                                         | Status                         |
| ------------------------ | ------------------------------------------- | ------------------------------ |
| Splash                   | App icon cat on `brandRed`                  | Reference exists               |
| Home header              | App icon as a 64 px logo tile on `background` | Reference exists             |
| Age gate (18+)           | Winking cat showing an ID card              | New pose needed                |
| Level up                 | Cat whose flame grows with the level        | New flame sizes needed         |
| Final ranking            | Small winking cat with a crown (48 px); never larger than the podium avatars | Crown art needed |
| `Pareja` paywall         | Smirking face                               | Reference exists               |
| Game card                | Card illustration library piece, in the illustration slot only | Interim art (HU-15)  |

On the game card the mascot appears **only in the illustration slot**: centered below the card text and notes, 72–160 pt tall in the space the text leaves (the card's illustration, or its level's face when it has none), decorative, and only when it fits the visible card area. When it does not fit, the card renders text-only: the card text and the player's name always come first (HU-15, decision of 2026-11-05; library in [`README.md`](./README.md#card-illustration-library)).

## Player Avatars in the UI

Each player is shown with a cat avatar instead of an initial. The set, each cat's feature, its head color, and the assignment rules live in [`README.md` § Player Avatars](./README.md#player-avatars). The avatar head colors are a separate palette and are not UI tokens.

- **Name:** always shown next to the avatar; the avatar never replaces it.
- **Frame:** the same square frame with padding for all 12, on `surface`, with a 2 px `ink` border and a radius of about a quarter of the side. Never crop to a circle: hats, headphones, and caps extend past the head.
- **Change:** in setup the avatar is a button (`accessibilityLabel` "Cambiar avatar de {nombre}") with a small `primary` swap badge in the corner.
- **Interim art:** until the SVGs exist, the app shows crops of `references/player-avatars-ai-draft.jpg` through `PlayerAvatar`, which draws this frame.

### Sizes

At least 48 px wherever the player has to be recognized; 32–36 px only as a companion to the name.

| Screen                          | Size     | Role                         |
| ------------------------------- | -------- | ---------------------------- |
| Setup player row (`Amigos` and `Pareja`) | 56 px | Recognize and change     |
| Setup collapsed row             | 36 px    | Next to the name             |
| Turn card, "Le toca a {nombre}" | 60 px    | Recognize who plays          |
| Group interlude, "Seguir: le toca a {nombre}" | 36 px | Next to the name       |
| Ranking podium                  | 52–64 px | Recognize; the winner is the largest |
| Ranking rows                    | 32 px    | Next to the name             |
| Home, "Continuar partida"       | 32 px, overlapping by 8 px, white 2 px border on `ink` | Group preview |

The crowned mascot on the ranking (48 px) is never larger than the podium avatars.

### Outline contrast

Non-text elements need 3:1. The `ink` outline passes on every head color; the two darkest are the tightest.

| Pair                              | Ratio  | Result |
| --------------------------------- | ------ | ------ |
| `ink` outline on `#0D9488` (DJ headphones) | 4.6:1 | Pass |
| `ink` outline on `#B45309` (round glasses) | 3.4:1 | Pass, with little margin: keep facial lines at full outline weight when vectorizing |
| `ink` outline on `background`     | 16.3:1 | Pass   |
| `ink` outline on `surface` (frame) | 17.3:1 | Pass  |

### Storage

The avatar is stored on `Player.avatarId` and remembered with the last players (`docs/data-model.md` § Player). A new player gets the first free avatar in brand order; changing it in setup moves to the next free one.
