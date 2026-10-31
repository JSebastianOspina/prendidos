# HU-13 — Anonymous analytics

| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Status     | Draft — not scheduled for the first playable build    |
| Priority   | P2                                                    |
| Depends on | HU-00 … HU-06, HU-08                                  |
| Blocks     | —                                                     |
| Screen     | None                                                  |
| PRD        | §3, §8 (Privacidad), §10.1                            |

## User Story

**As the** Prendidos team,
**I want** anonymous usage signals for the MVP success metrics,
**So that** we can decide whether to invest in more content and markets.

## Context

The MVP exists to measure retention and conversion. The PRD forbids accounts and any personal data leaving the phone, so analytics must be event-level and anonymous: never player names or genders.

## Acceptance Criteria

- [ ] The events needed for the PRD §3 metrics are recorded: game started (mode, category, player count, end condition, levels, Sin Filtro on/off), game finished or abandoned (rounds played), card completed/refused/swapped (level, type), paywall shown, purchase completed, restore.
- [ ] No event ever contains a player name, gender, or free text.
- [ ] Events queue offline and send when online.
- [ ] Analytics never block or slow the game flow.

## Out of Scope

- Dashboards (handled in the analytics tool).
- Crash reporting and performance monitoring (separate decision).

## Business Value

Without it the MVP cannot answer the question it was built to answer.
