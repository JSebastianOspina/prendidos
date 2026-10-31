# Design: align-turn

## Context

See proposal.md (Why). The screen reads the game only through `useGame()` and may edit only `src/features/play/**`. `Button` has one label and no `levelEasy` fill, and `CardFrame` only knows white and yellow faces with fixed padding, so neither fits the proposal as is.

## Goals / Non-Goals

- Goals: match proposal boards 05, 06, 07 and 13 with existing tokens and primitives; keep every game behavior and the stale-tap protection.
- Non-Goals: alternative penalties (HU-11), "Salir al inicio" and resuming (HU-12), level-up animation, any engine change.

## Decisions

1. **Local clay pieces.** `play-pieces.tsx` holds a `ClayButton` (ink outline, hard shadow, sinks on press, same 600 ms repeated-press guard as `Button`, any fill and any children) and a `PlayCard` frame (any fill, rotation, edge-to-edge footer). Alternative: extend `Button` / `CardFrame` — not allowed from this folder; requested as a shared change instead.
2. **Progress bar = one segment per level in play.** Segments follow the selected levels in order (three by default), each in its `LevelColors` fill. Segments before the current card's level are full, later ones empty, and the current one shows the progress inside its share: rounds → `(round − 1) / rounds`, points → `best score / target`, open → the current segment full (no end to measure). The current level comes from `currentDifficulty`, so the bar never disagrees with the card. Alternative: always three segments — wrong when a level was deselected.
3. **Round label per end condition.** Rounds: "Ronda X de Y"; points: "Ronda X · Meta N pts"; open: "Ronda X". The level-up pill and the Pause dialog reuse it.
4. **Level-up detection in the screen.** The screen remembers the highest level of the individual cards it showed (state adjusted during render, React's "storing information from previous renders" pattern). When a new individual card has a higher level, it opens the overlay for that level, so each level is celebrated at most once even if a fallback draw ever dips back. The first individual card only seeds the value, so game start and a remount never trigger it; group cards are ignored, so the overlay waits for the next individual card. It renders only after a pending refusal penalty is dismissed. No motion at all, so reduce motion is respected by construction.
5. **Level-up title per level.** Picante: "¡Subió la temperatura!"; Prendido: "¡Esto se prendió!" (Suave can never be reached by going up but has a title for type completeness). The scale shows reached levels in their fill, the new level on white in bold, later levels in their fill.
6. **Next player on the interlude** is `currentPlayer`: the engine keeps the due player's index during a group card, so no shared change is needed.
7. **Pause on the interlude too.** The interlude header keeps the pause button so the game can always be ended. The proposal board omits it; safety wins.
8. **Non-drinkers** see the drink penalty until HU-11 (its stated interim behavior). The footer takes its line from one function so HU-11 can swap it.
9. **Group rule box** has no per-card drink count in the content model, so it reads "El que le aplique, toma." and "Sin puntos. No cuenta para el ranking."
10. **Icons**: the pause glyph is two drawn bars; the swap and penalty icons are dropped (no icon set is used on this screen and `expo-symbols` does not render on web).

## Risks / Trade-offs

- [Clay pieces duplicate `Button` / `CardFrame` styling] → listed under shared changes; easy to fold back later.
- [Rotation could hurt readability] → 1.5° only, text stays horizontal enough; card scrolls when long.
- [Long names or cards at 375 × 667] → name shrinks to fit on one line; the card area scrolls; actions stay fixed.

## Migration Plan

UI only. Rollback is reverting the commit.
