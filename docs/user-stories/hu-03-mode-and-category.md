# HU-03 — Choose mode and category

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Status     | Ready for enrichment                                      |
| Priority   | P0 — playable loop                                        |
| Depends on | HU-00                                                     |
| Blocks     | HU-09 (adds locks and paywall entry here)                 |
| Screen     | Elegir modo → Elegir categoría (two steps, one story)     |
| PRD        | §5.2, §6.1, §7.1                                          |

## User Story

**As a** player starting a game,
**I want** to pick whether we play as a group of friends or as a couple, and then pick a category,
**So that** the cards match who is in the room and the mood we want.

## Context

Mode decides the number of players and the tone of the content; the category decides the theme. At launch there is one category per mode, but the picker must already behave as a list so new packs can be added without redesign. The two steps are one story because their hand-off (mode filters categories) is easier to get right in one piece.

## Acceptance Criteria

**Mode**

- [ ] From "Nueva partida" the user sees two large options: "Amigos" (2 to 12 players) and "Pareja" (exactly 2), each with a one-line description of the content tone.
- [ ] Pareja uses the pink couple accent; Amigos uses the primary flame accent.
- [ ] Choosing a mode goes to the category list for that mode.

**Category**

- [ ] The user sees only the categories of the chosen mode, each as a large card with name and short description (La Previa for Amigos, Entre Dos for Pareja at launch).
- [ ] Choosing a category goes to the game setup screen with that mode and category already applied.
- [ ] Category names and descriptions are in Colombian Spanish and are marked provisional in the content, not in the UI.
- [ ] The user can go back from the category list to the mode screen, and from the mode screen to home.

**Shared**

- [ ] Both screens follow the Prendidos look and are usable one-handed.
- [ ] The category cards leave an obvious place for a lock badge on paid content (HU-09), hidden for now.

## Out of Scope

- Locked categories, lock badge behavior, and opening the paywall (HU-09).
- Sin Filtro (it is a switch in setup, HU-10, not a category).
- More than one category per mode (future packs).

## Business Value

Routes each group to content that fits them, which is the main lever for the "fun on the first try" promise.
