# HU-06 — Final ranking

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Status     | Ready for enrichment                    |
| Priority   | P0 — playable loop                      |
| Depends on | HU-00                                   |
| Blocks     | HU-09 (adds the upsell here), HU-14     |
| Screen     | Ranking y ganador                       |
| PRD        | §5.7 (Fin de partida), §7.1, §9         |

## User Story

**As a** player at the end of a game,
**I want** to see who won and the full ranking, and start another game right away,
**So that** the night has a clear winner and the group keeps playing.

## Context

The ending is what the group remembers. A clear winner moment and a one-tap "play again" keep the session going; this screen is also where the PRD places a soft, non-intrusive upsell later (HU-09).

## Acceptance Criteria

- [ ] When a game ends, the user sees the winner highlighted (name, score, crown or points accent) and below it the full ranking with each player's final score.
- [ ] Tied players show the same position and are visibly tied (for example "1. Ana y Luis").
- [ ] Negative scores are shown in the negative color.
- [ ] A large primary button "Jugar otra vez" goes to setup with the same players, mode, and category already filled in.
- [ ] A secondary action "Volver al inicio" goes home.
- [ ] Once the ranking is shown, the game is no longer "in progress": reopening the app does not try to resume it.
- [ ] The layout leaves room for a small non-intrusive upsell block for locked content of the mode just played (HU-09), hidden for now.
- [ ] Follows the Prendidos look; the winner moment feels celebratory within the brand (flame palette, points color).

## Out of Scope

- Upsell content (HU-09).
- Responsible-drinking reminder at the end of the game (HU-14).
- Sharing the result, screenshots, or statistics (not in MVP).

## Business Value

A strong ending and an instant replay raise games per session, the retention metric the MVP is validating.
