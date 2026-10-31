# HU-12 — Resume an interrupted game

| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Status     | Draft — not scheduled for the first playable build    |
| Priority   | P1                                                    |
| Depends on | HU-00 (game is already saved), HU-02, HU-05          |
| Blocks     | —                                                     |
| Screen     | Home ("Continuar partida") + turn screen              |
| PRD        | §5.1, §5.10                                           |

## User Story

**As a** group whose phone died or who got distracted mid-game,
**I want** to pick the game up exactly where we left it,
**So that** we don't lose the scores and the night keeps going.

## Context

Party phones get locked, calls come in, apps get closed. The game state is already saved by HU-00; this story exposes it on the home screen and makes the hand-off seamless.

## Acceptance Criteria

- [ ] When a game is in progress, the home screen shows a dark "Continuar partida" button above "Nueva partida", with the players' names or count and the current round.
- [ ] Tapping it returns to the turn screen with the same player, card, scores, round, and level as when the app was left.
- [ ] Starting a new game while one is in progress asks for confirmation that the current game will be abandoned.
- [ ] After a game ends, the button disappears.

## Out of Scope

- Keeping more than one game in progress.
- History of past games (never).

## Business Value

Protects the session from the most common interruption and avoids the frustration of a lost ranking.
