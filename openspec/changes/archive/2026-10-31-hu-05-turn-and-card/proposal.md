# Proposal

## Why

The game engine (HU-00) already deals cards, scores turns, escalates levels and ends the game, but `src/app/play.tsx` is a placeholder. The turn screen is the product: a group across a table must read whose turn it is, the card, the points and the penalty in one glance and move on in at most two taps (story HU-05).

## What Changes

- Replace the `play` route placeholder with the turn screen: round, level, current player's name (large) and score, a compact scoreboard, the card face, the penalty row, "Cambiar carta", and the two 72-high actions "Cumplió" / "No cumplió".
- Add card face components: individual card (Reto vs Verdad tag, level-colored strip, points badge, headline, body, consent note, outside-contact note) and the yellow group interlude card with a single "Siguiente".
- Show the refusal penalty from `lastOutcome` in an overlay the group dismisses before the next card (also when the refusal ends the game).
- "Terminar partida" in the header with a confirmation overlay; automatic navigation to the ranking when the game finishes, and to home when there is no game.
- All copy in `src/features/play/copy.ts` (Colombian Spanish, usted).

## Capabilities

### New Capabilities
- `turn-screen`: how a game turn is presented and answered on the device — card face, actions, refusal penalty, swaps, group interludes, ending and navigation out of the turn.

### Modified Capabilities
- None (the engine contract in `game-engine` is consumed as is).

## Impact

- Code: `src/app/play.tsx`, new `src/features/play/` (screen, card face, overlay, copy, tests). Reads only `useGame()` and `routes`.
- No new dependencies, no native changes, no new development build. Platforms: iOS and Android (web build used only for the coordinator's visual check).
- Security: no auth/authz impact; no data leaves the device; no route params.
