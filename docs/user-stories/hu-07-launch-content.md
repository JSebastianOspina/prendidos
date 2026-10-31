# HU-07 — Launch card content

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Status     | Ready for enrichment                                          |
| Priority   | P0 — playable loop (content, no screen)                       |
| Depends on | HU-00 (catalog location and loader)                           |
| Blocks     | —                                                             |
| Screen     | None                                                          |
| PRD        | §5.6, §6.1–§6.4; `docs/content/README.md`, `write-cards` skill |

## User Story

**As a** group playing Prendidos,
**I want** enough fresh, funny, well-written cards in each category and level,
**So that** a whole night of play never repeats a card and every level feels different.

## Context

The content model and validator exist, but there are no real cards. The legacy corpus is reference only and must be rewritten through the `write-cards` skill with human review. This story can run in parallel with the screens because it only adds content, never code.

## Acceptance Criteria

- [ ] La Previa (Amigos) has at least 30 standard cards per level (Suave, Picante, Prendido), mixed roughly 60 % retos, 20 % verdades, 20 % group cards ("Todos los que…", "Yo nunca").
- [ ] La Previa has at least 30 Sin Filtro cards per level, kept in the catalog but only reachable once HU-10 ships.
- [ ] Entre Dos (Pareja) has at least 30 cards per level, flirty and suggestive, never explicit.
- [ ] Every card passes the content validator (points within its level, 1–3 drinks, headline and body length, no banned phrases, well-formed mentions and gender variants).
- [ ] Every card follows the voice and policy in `docs/content/README.md` and the skill: Colombian Spanish, inclusive wording, consent flagged where there is touch, outside-the-room flagged where it reaches outside.
- [ ] A human has reviewed every card before it ships (reviewer and date noted in the content folder).
- [ ] Cards aimed at a gender are a minority and never target "Prefiero no decir".

## Out of Scope

- Alternative penalties list (HU-11).
- Illustrations (HU-15).
- Future categories or packs.

## Business Value

Content volume and quality are the product; this directly drives the "I'd play this again" and conversion metrics.
