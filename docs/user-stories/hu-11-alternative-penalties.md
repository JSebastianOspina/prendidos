# HU-11 — Alternative penalties for players who don't drink

| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Status     | Draft — not scheduled for the first playable build    |
| Priority   | P1                                                    |
| Depends on | HU-00, HU-04 ("No toma" stored), HU-05               |
| Blocks     | —                                                     |
| Screen     | Turn screen (penalty line) + content                  |
| PRD        | §5.8, §8                                              |

## User Story

**As a** player who is not drinking tonight,
**I want** a fun non-alcoholic penalty instead of "toma 2 tragos",
**So that** I can play fully with my friends without being pressured to drink.

## Context

Responsible-drinking is both a value and a store requirement. The PRD gives "No toma" players a generic penalty per level and applies it to group cards too. Until this story, "No toma" players see the drink penalty.

## Acceptance Criteria

- [ ] There is a list of alternative penalties per level (at least 10 each), in Colombian Spanish, physical or silly but safe ("Haz 10 sentadillas", "Habla con acento hasta tu próximo turno").
- [ ] When a "No toma" player refuses a card, the penalty line shows an alternative penalty of the card's level instead of the drinks.
- [ ] On a group card, the text that tells who drinks also says that "No toma" players do the alternative penalty.
- [ ] Alternative penalties do not repeat within a game until the level's list runs out.

## Out of Scope

- Letting players write their own penalties.
- Per-card custom alternative penalties.

## Business Value

Keeps non-drinkers in the game (bigger groups, longer sessions) and backs the responsible-drinking stance the stores require.
