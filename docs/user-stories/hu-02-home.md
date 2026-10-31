# HU-02 — Home screen

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Status     | Ready for enrichment                    |
| Priority   | P0 — playable loop                      |
| Depends on | HU-00                                   |
| Blocks     | HU-12 (adds "Continuar partida" here)   |
| Screen     | Inicio                                  |
| PRD        | §5.1, §9                                |

## User Story

**As a** player who just opened the app,
**I want** a simple home screen with the brand and one clear way to start a game,
**So that** the group can start playing in a couple of taps.

## Context

The home screen is the hub the flow always returns to. For the MVP it must do one thing well: get the group into a new game fast, with the brand front and center. It later becomes the place to resume an interrupted game (HU-12) and to reach purchases (HU-09), so it must leave room for those without redesign.

## Acceptance Criteria

- [ ] After the 18+ confirmation (or on every later open), the user lands on a home screen that shows the Prendidos logo tile and wordmark.
- [ ] A large primary button "Nueva partida" takes the user to the mode selection screen.
- [ ] The screen has a short tagline in Colombian Spanish that says what the game is in one line.
- [ ] The layout leaves an obvious place for a secondary dark "Continuar partida" button (HU-12) and a small link to restore purchases (HU-08), both hidden for now.
- [ ] The screen follows the Prendidos look and is usable one-handed: the primary button sits in the lower half of the screen.

## Out of Scope

- "Continuar partida" (HU-12).
- Restore purchases, Pase total promotion (HU-08, HU-09).
- Settings or about screens (not in MVP).

## Business Value

Shortens time-to-first-card, the moment that decides whether a group keeps playing.
