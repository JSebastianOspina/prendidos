# HU-05 — Turn and card screen

| Field      | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| Status     | Ready for enrichment                                         |
| Priority   | P0 — playable loop                                           |
| Depends on | HU-00                                                        |
| Blocks     | HU-09 (couple soft paywall), HU-11 (alternative penalties)   |
| Screen     | Turno: carta al jugador                                      |
| PRD        | §5.4–§5.9, §6.3, §9; card layouts in `docs/content/card-templates.md` |

## User Story

**As the** player whose turn it is,
**I want** to see my card big and clear, with my name, the level, the points, and the penalty, and mark whether I did it,
**So that** the group plays fast, out loud, with few taps between turns.

## Context

This is where the game lives: a party-sized card, three decisions (Cumplió, No cumplió, Cambiar), and the phone passes to the next person. The rules (points, penalties, escalation, swaps, interludes) already exist in HU-00; this story is about showing them so a group across a table can read them in one glance.

## Acceptance Criteria

**Card**

- [ ] The screen shows whose turn it is (player name, large), the current round and level, and the card: headline, instruction text, points badge, and penalty line ("Toma 2 tragos — por aguafiestas").
- [ ] Reto and Verdad are visually distinguishable; Verdad is clearly a question to answer, Reto an action to do.
- [ ] The card text speaks to the current player with their gender agreement; mentions of another player show a real name from the table (the partner in Pareja).
- [ ] A card that involves touch shows "Solo si la otra persona acepta". A card that reaches outside the room shows the short outside-contact reminder.
- [ ] The level color (Suave green, Picante orange, Prendido red with white text) is visible on the card.

**Actions**

- [ ] Two large buttons, "Cumplió" and "No cumplió". Cumplió adds the points and moves to the next player. No cumplió subtracts half the points rounded up, shows the penalty clearly for a moment, then moves to the next player.
- [ ] A "Cambiar carta" action replaces the card without penalty once per player per game; after it is used, the action is visibly unavailable for that player.
- [ ] A running score is visible without leaving the screen (for example a compact scoreboard or the current player's score next to their name).
- [ ] An "Terminar partida" action, out of the way of the main buttons, asks for confirmation and goes to the ranking.

**Group cards**

- [ ] "Todos los que…" and "Yo nunca" appear as a yellow interlude card addressed to the whole group, with no points and a single "Siguiente" button; afterwards the turn continues with the player who was due.

**End**

- [ ] When the end condition is met, the screen goes to the ranking automatically.

**Feel**

- [ ] Big type readable from across a table, large buttons, no more than two taps per turn, portrait, one-handed.

## Out of Scope

- The couple soft paywall when escalation reaches Picante (HU-09).
- Alternative penalties for "No toma" players (HU-11) — they see the drink penalty for now.
- Card illustrations and mascot reactions (HU-15).
- In-app voting on whether a challenge was done (never; PRD §5.7).

## Business Value

The turn screen is the product; its clarity and pace decide whether the group finishes the game and comes back.
