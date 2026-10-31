# HU-04 — Game setup

| Field      | Value                                              |
| ---------- | -------------------------------------------------- |
| Status     | Ready for enrichment                               |
| Priority   | P0 — playable loop                                 |
| Depends on | HU-00                                              |
| Blocks     | HU-10 (adds the Sin Filtro switch here)            |
| Screen     | Setup de partida                                   |
| PRD        | §5.3, §5.7 (Fin de partida), §5.8, §5.10           |

## User Story

**As the** person holding the phone,
**I want** to add the players, set the turn order, and choose how the game ends on one screen,
**So that** we start playing quickly and the game is tuned to our group.

## Context

Setup is the densest screen in the app and the one with the most friction risk: names, gender, "No toma", order, levels, and end condition. The PRD mitigates that by preloading the last players and giving every option a sensible default, so a returning group can hit "Empezar" without touching anything.

## Acceptance Criteria

**Players**

- [ ] The screen opens with the players from the last game already filled in (name, gender, "No toma"). On a first use it shows two empty player rows.
- [ ] Each player has a name, a gender choice among "Hombre", "Mujer", "Prefiero no decir", and a "No toma" toggle. Selected toggles use the dark ink style.
- [ ] The user can add a player (up to 12 in Amigos) and remove a player (down to 2). In Pareja the screen shows exactly two players and no add/remove.
- [ ] A player without a name cannot start the game; the row shows what is missing.

**Turn order**

- [ ] Players play in the order shown. A "Barajar" button shuffles the order and the new order is visible before starting.

**Levels**

- [ ] All three levels (Suave, Picante, Prendido) are selected by default with their level colors. The user can deselect levels but never all of them.

**End of game**

- [ ] The default end is "Por rondas: 10". The user can choose rounds (5, 10, 15, 20), a points goal (100, 200, 300), or "Abierta".

**Start**

- [ ] A large "Empezar" button starts the game and goes to the turn screen; the players entered become the "last players" remembered for the next setup.
- [ ] The screen is usable one-handed and the "Empezar" button is always reachable (sticky at the bottom while the player list scrolls).
- [ ] The layout leaves a place for the "Retos Sin Filtro" switch under the options in Amigos mode (HU-10), hidden for now.

## Out of Scope

- Sin Filtro switch, its lock, and its paywall (HU-10).
- Alternative penalties themselves (HU-11) — "No toma" is stored here, applied later.
- Saving named player groups or profiles (not in MVP).

## Business Value

Preloading and defaults cut setup to one tap for returning groups, which protects retention after the first night.
