---
description: Review note for the first playable seed batch of cards (La Previa and Entre Dos) — counts, validation result, and review status.
alwaysApply: false
---

# Seed Batch Review

**Status: pending human review — no human has reviewed these cards yet.**

## What This Is

The first playable batch of game cards, written for HU-00 (game foundation) so the game loop has real content to play. HU-07 completes the catalog (more categories, more cards, and the opt-in `spicy` / Sin Filtro layer).

| File                                         | Category                                |
| -------------------------------------------- | --------------------------------------- |
| `src/features/content/catalog/la-previa.json` | `la-previa` — La Previa (`friends`)     |
| `src/features/content/catalog/entre-dos.json` | `entre-dos` — Entre Dos (`couple`)      |

All cards are `heat: "standard"`. There are no `spicy` cards in this batch.

## Counts

### La Previa (`prev-001` … `prev-101`, 101 cards)

| Difficulty | Individual (challenge / truth) | Group (everyoneWho / neverHaveIEver) | Total |
| ---------- | ------------------------------ | ------------------------------------ | ----- |
| easy       | 32                             | 7                                    | 39    |
| medium     | 26                             | 5                                    | 31    |
| hard       | 26                             | 5                                    | 31    |

By type: 65 challenge, 19 truth, 10 neverHaveIEver, 7 everyoneWho. Ten cards use `{player}`, four of them with `targetGender` (two `male`, two `female`). Nine cards set `requiresConsent`, nineteen set `reachesOutside`.

### Entre Dos (`dos-001` … `dos-030`, 30 cards)

| Difficulty | Individual (challenge / truth) | Group (everyoneWho / neverHaveIEver) | Total |
| ---------- | ------------------------------ | ------------------------------------ | ----- |
| easy       | 8                              | 2                                    | 10    |
| medium     | 8                              | 2                                    | 10    |
| hard       | 8                              | 2                                    | 10    |

By type: 17 challenge, 7 truth, 3 neverHaveIEver, 3 everyoneWho. Sixteen cards use `{partner}`. Seven set `requiresConsent`, two set `reachesOutside`. No card uses `targetGender`.

The category's `freeDifficulties` is `["easy"]`, so the medium and hard cards are the paid content.

## Validation

`validateCards` was run over both files together (temporary Jest test, since deleted): **0 errors, 0 warnings**.

Validator warnings: none.

## What Reviewers Should Check

The validator cannot judge these, so a human pass is still required (PRD §6.2):

- Fun: would the group react out loud? Several easy cards are deliberately gentle.
- Consent and outside-contact flags: every card that touches someone, sits very close, or posts someone else's photo has `requiresConsent: true`; every call, message, or post has `reachesOutside: true`.
- Gender: copy was written to read right for male, female, and undisclosed players (invariable words, `{masculine|feminine|neutral}` variants in headlines, no gendered quips).
- Drinks by level follow `policy.md`: easy 1, medium 1–2, hard 2–3.
- Hard cards push social risk (audience, eye contact, closeness, confessions) rather than explicit content.
- Group cards intentionally use the shared headlines "¡Todos!", "Todos los que…", "¡Confiesen!" as framing labels.
