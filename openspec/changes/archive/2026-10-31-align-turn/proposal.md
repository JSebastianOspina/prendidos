# Proposal: align-turn

## Why

The turn screen shipped with the right tokens but not the approved layout (docs/design/review/README.md §5, §6, §7, §13): no avatars, a white card with a colored band, scores crowding the top, a bare "Terminar partida" link, and no level-up moment. The whole game happens on this screen, so it must match the proposal before launch.

## What Changes

- Top bar: a pause button, the round label with a progress bar split by level, and a "Cambiar (1)" swap button. The inline scoreboard and the current player's score go away (scores stay in the ranking).
- Individual card: filled with the level color and slightly rotated; chips for type and level and a round points badge; the player's avatar, "Le toca a", and the name inside the card; the penalty in a white footer strip.
- Turn actions show the points at stake: "No cumplió −N pts" and "¡Cumplió! +N pts".
- Group interlude: "Ronda X de Y · Interludio" header with the level chip, a yellow card with a "¡Todos!" chip and a white rule box, and "Seguir: le toca a {nombre}" with the due player's avatar.
- New level-up overlay, shown once when the level of the individual card goes up during a game.
- **BREAKING (UI)**: "Terminar partida" and its confirmation are replaced by a Pause dialog ("Seguir jugando", "Terminar y ver ranking").

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `turn-screen`: header, individual card face, actions, swap, group interlude, and ending the game (now through Pause); adds a level-up requirement.

## Impact

- Code: `src/features/play/**` only. No engine, content, navigation or shared UI changes.
- Platforms: iOS, Android and web. No native modules and no new development build.
- Security: no auth, authz or data-handling impact. Age gating is untouched.
- Non-drinkers keep seeing the drink penalty until HU-11 ships alternative penalties, as HU-11 states.
