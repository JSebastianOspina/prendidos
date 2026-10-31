# Design

## Context

`src/features/results/` renders a `WinnerCard` and a `RankingList` from `groupRankingByPosition(ranking)`. The engine already ranks players with shared positions (1, 1, 3). Sources: `docs/design/prototype/ranking.dc.html` and `empate.dc.html`. No SVG library is installed, and `src/components/ui/`, `src/features/game/`, and `src/features/content/` are not ours to edit.

## Goals / Non-Goals

**Goals:** match the proposal boards at 375 × 667 and 390 × 844, using tokens and the `Mascot` / `PlayerAvatar` primitives only.

**Non-Goals:** the upsell (HU-09, slot stays empty), motion or confetti, and any change to the play screen's final-refusal-penalty flow.

## Decisions

1. **Podium = the first three ranking entries; rows = the rest.** Positions come from the engine, so rows keep shared numbers (1, 2, 2, 2 → podium 1, 2, 2 and a row "2"). Alternative: put every player with position ≤ 3 on the podium; rejected because a big tie would make columns too narrow.
2. **Podium order.** With a sole winner, the winner stands in the middle (2nd, 1st, 3rd; two players: 2nd, 1st). With a tie for first, columns follow ranking order (1, 1, 3), as in `empate.dc.html`.
3. **Step look by position.** Height 140 / 96 / 72, fill `primary` / `surfaceSoft` / `surface`, number in `title` (1st) or `card` (others) Fredoka. Ink 3 pt border, radius `md` top and 6 pt bottom, and a 5 pt hard `ink` shadow drawn as an offset layer (Android cannot draw it with elevation).
4. **Avatar sizes.** Sole winner 64 with a crown above it, co-winners 60 without crowns (as in `empate.dc.html`; the header crown carries the tie), others 52. All within the 52–64 range of design tokens § Player Avatars in the UI.
5. **Crown drawn with views, not SVG.** `react-native-svg` is not installed and dependencies are out of scope. The crown is a `points` band with an `ink` border plus three `points` diamonds (rotated squares with an `ink` border) whose lower halves hide behind the band, so the visible outline is ink all around. It is decorative (`importantForAccessibility="no-hide-descendants"`). Alternatives: an SVG data URI in `expo-image` (unverified on native, hex in strings) or a new PNG asset (outside owned paths).
6. **Eyebrow wording.** Rounds and open games: "{Categoría} · {N} rondas" with the rounds played (`rounds-played.ts`). The engine moves to round + 1 and the first player as soon as a round wraps, so a game ended there reports `currentRound - 1`; otherwise `currentRound` (a rounds game that ends on its own reports its configured count). Plain `currentRound` was rejected: it overstates by one after a full round. Points games: "{Categoría} · Meta {meta} pts". The category name comes from `categoriesForMode` (content catalog), as the category picker does; when not found, only the length part is shown. The `label` text style uppercases it.
7. **Score color on the `primary` step.** `negative` on `primary` fails contrast, so a negative winner score on the orange step is drawn in `ink`; the minus sign stays. Rows and the other steps use `negative`.
8. **Buttons 2 : 3 instead of 1 : 2.** At 375 pt the 1 : 2 split leaves "Inicio" too narrow for the shared button's 24 pt padding. Accessible names: "Volver al inicio" and "Jugar otra partida" (they contain the visible labels, WCAG 2.5.3).
9. **Accessibility.** Each podium column and row is one accessible element labeled "Puesto {n}: {nombre}, {puntos}" with the full name; visible names use `numberOfLines={1}`. The title is the screen header; the tie line is plain text.

## Risks / Trade-offs

- [Crown made of views looks a bit blockier than the SVG] → Replace with vector art when the brand redraw ships.
- [A round where only group cards were played before ending counts as unplayed] → Acceptable; the eyebrow is a summary, not a stat.
- [`roundsPlayed` assumes at least two players (a one-player game would never move past the first player)] → Setup requires two or more players in both modes.
