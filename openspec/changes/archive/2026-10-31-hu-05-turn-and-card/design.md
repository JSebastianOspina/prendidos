# Design

## Context

HU-00 exposes the game through `useGame()` (session, current player and card, rendered copy, `canSwap`, `isGroupInterlude`, `lastOutcome`, actions that ignore stale taps). The placeholder `src/app/play.tsx` only shows the copy and a "Cumplió" button. HU-05 owns `src/app/play.tsx` and `src/features/play/`; everything else is read-only.

## Goals / Non-Goals

**Goals:** a turn screen readable across a table, ≤ 2 taps per turn, the refusal penalty shown before the next card, card face components reusable by later stories (HU-09, HU-11, HU-15).

**Non-goals:** couple paywall (HU-09), alternative penalties (HU-11, non-drinkers still see drinks), illustrations/mascot and avatars (HU-15), animations.

## Decisions

1. **Thin route.** `src/app/play.tsx` re-exports `PlayScreen` from `src/features/play/play-screen.tsx`.
2. **Local UI state only for presentation.** The screen keeps `refusingPlayerId` (set when "No cumplió" is pressed, cleared on dismiss) and `isEndConfirmVisible`. The penalty overlay renders only when `lastOutcome.kind === 'refused'` and `lastOutcome.playerId === refusingPlayerId`, so an older outcome is never shown. No copy of game state.
3. **Navigation effect.** No session → `router.replace(routes.home)`. `session.status === 'finished'` and no penalty pending → `router.replace(routes.results)`. A refusal that ends the game keeps the overlay up until it is dismissed (HU-00 contract).
4. **Overlays in the tree, not `Alert` / `Modal`.** An absolute-fill scrim (`Colors.scrim`) with a white panel, `accessibilityViewIsModal`. Works the same on iOS, Android and the web check, and is straightforward to test. The penalty overlay waits for a tap ("Siguiente") instead of a timer, so the whole group sees it and nobody is rushed; that keeps a refusal at 2 taps.
5. **Card face.** `IndividualCardFace` uses `CardFrame` (surface) with a strip filled with `LevelColors[difficulty]` holding the type tag and points badge; the level color is therefore on the card, Prendido gets white text from the token. Reto vs Verdad: different tag text and hint ("Reto · Hágalo" / "Verdad · Responda con la verdad") and the tag style (Reto: `ink` chip with white text; Verdad: white chip with `ink` border). `GroupCardFace` uses `CardFrame tone="group"` and falls back to a fixed headline by type ("¡Todos los que…!" / "Yo nunca…") when the card has none.
6. **Points badge** is a `points`-filled chip with `ink` text (8:1 contrast per design tokens).
7. **Penalty copy.** "Toma N trago(s)" follows the literal wording of the story and PRD (the rest of the copy uses usted). The quip is appended with " — ". The refusal overlay shows "−N pts" from `lastOutcome.pointsDelta`.
8. **Swap** is a pill below the card (min 48 high); after use it is disabled and reads "Ya cambió su carta". It is hidden on group cards.
9. **"Terminar"** is a small text-style pressable in the header (top, away from the thumb zone), min 48 touch target; it opens a confirmation overlay ("Sí, terminar" / "Seguir jugando").
10. **Layout.** `ScreenContainer` with the header and actions fixed and the card area in a `ScrollView`, so long copy or large font scales never push the actions off-screen. Turn name uses `display` with `adjustsFontSizeToFit` and one line.
11. **Copy** lives in `src/features/play/copy.ts` with small pure formatters (`roundLabel`, `drinksLabel`, `penaltyLine`, `pointsLabel`, `signedPointsLabel`).

## Shared changes requested

None required. Nice-to-have for later (not blocking): a `size="compact"` variant of `Button` in `src/components/ui/button.tsx` for secondary actions such as "Cambiar carta" and the overlay buttons; for now the screen uses a local pressable pill styled with tokens.

## Risks / Trade-offs

- Many players (up to the friends limit) make the scoreboard wrap to several lines → it uses `label` type and wraps; acceptable for the MVP.
- In-tree overlay does not block the hardware back button on Android → back leaves the screen the same way it would without overlay; the game is kept in the provider, so nothing is lost.
- Visual verification is not possible on this machine (no simulator); the coordinator checks the web build.
