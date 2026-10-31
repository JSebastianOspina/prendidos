# Design

## Context

`AgeGateScreen` already has the right structure for behavior: a scrolling body and a fixed footer that holds the decline message and the actions (see the archived `hu-01-age-gate`). Only the body content, the decline control and the copy change. Screens may not edit `src/components/ui/` or `src/constants/theme.ts`.

## Goals / Non-Goals

**Goals:** match proposal board 01 with existing tokens and primitives; keep the confirm / decline behavior and its tests unchanged.

**Non-Goals:** the proposal's "PLACEHOLDER IA" tag and the 18+ ID card drawn over the cat (a placeholder for a future pose, not UI); any new shared primitive.

## Decisions

1. **Mascot size.** `mascotHeightFor(windowHeight)` (pure, in `age-gate-layout.ts`) returns `round(windowHeight × 0.28)` clamped to 140–240 pt: 236 pt at 844, 187 pt at 667. Read from `useWindowDimensions()`. A fixed 240 pt would push the question low on a 667 pt phone once the footer is fixed.
2. **Shield icon: token-drawn glyph.** `expo-symbols` is a dependency but no screen uses it yet, and its web / Android fallbacks are unverified here, so per the coordinator brief the card draws a small outlined shield with `View`s (ink border, rounded bottom, a check made of two borders) in `shield-glyph.tsx`. It is decorative and hidden from screen readers; the card text carries the meaning. Swap it for `expo-symbols` when a shared icon approach exists.
3. **Moderation card is local.** `CardFrame` is the game card (radius 34, 8 pt shadow, 24 pt padding); the proposal card is smaller (radius ~22, 5 pt shadow, 16 pt padding). The card lives in `moderation-card.tsx` with `Radius.lg`, `ShadowOffset.button`, `BorderWidth.regular`, `Spacing.lg`. **Pattern detected:** the hard-shadow layer (an absolute `ink` view offset under an outlined face) now repeats in `Button`, `CardFrame` and this card; a shared clay-surface primitive is requested from the coordinator.
4. **Decline as text link.** A `Pressable` with `accessibilityRole="button"`, `minHeight: TouchTarget.minimum`, `textSecondary` Nunito ExtraBold 16, and lower opacity while pressed. `Button` has no link variant and is shared, so the link stays local.
5. **Copy (usted).** "¿Ya es mayor de edad?"; "Prendidos es un juego para tomar con amigos. Es solo para mayores de 18 años."; "Tome con moderación: ningún castigo pasa de 3 tragos. Si tomó, no maneje."; "Soy mayor de 18 años"; "Soy menor de edad"; "Se lo preguntamos una sola vez." The adults-only message is kept. The brief's "one-line subtitle" is read as one short line of copy; it wraps to two lines at 390 pt, as on the board.
6. **Footer order.** Adults-only message (when shown) → confirm → decline link → footnote, all fixed; the mascot, title, subtitle and card scroll and are centered vertically when they fit.

## Risks / Trade-offs

- [The pointing pose has no ID card] → accepted; the card is a "PLACEHOLDER IA" annotation for future art.
- [Large font scaling makes the footer taller] → the footnote is short and the body scrolls; the confirm button stays visible.
- [Visual result not checked here] → the coordinator verifies on the web build.
