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
- [ ] Every card passes the content validator with no errors (points within its level, 1–3 drinks, headline, body, and quip length, no banned phrases, well-formed mentions and gender variants, no mentions in group cards); warnings are resolved or justified in the review notes.
- [ ] Every card follows the voice and policy in `docs/content/README.md` and the skill: Colombian Spanish, inclusive wording, consent flagged where there is touch, outside-the-room flagged where it reaches outside.
- [ ] A human has reviewed every card before it ships (reviewer and date noted in the content folder).
- [ ] Cards aimed at a gender are a minority and never target "Prefiero no decir".

## Out of Scope

- Alternative penalties list (HU-11).
- Illustrations (HU-15).
- Future categories or packs.

## Business Value

Content volume and quality are the product; this directly drives the "I'd play this again" and conversion metrics.

## Original

The sections above (User Story, Context, Acceptance Criteria, Out of Scope, Business Value) are the original story, kept unchanged.

## Enhanced

### Ownership

| Story | Route | Feature folder | Owns                                                                                                   |
| ----- | ----- | -------------- | ------------------------------------------------------------------------------------------------------ |
| HU-07 | —     | —              | `src/features/content/catalog/*.json` only, plus `docs/content/` review notes; also its OpenSpec change |

No code changes. `src/features/content/catalog.ts`, the validator, the tests, and the engine belong to HU-00.

### Starting point (main after HU-00)

| Category / heat      | easy | medium | hard |
| -------------------- | ---- | ------ | ---- |
| La Previa — standard | 39   | 31     | 31   |
| La Previa — spicy    | 0    | 0      | 0    |
| Entre Dos — standard | 10   | 10     | 10   |

The gap is **Entre Dos +20 per level (60 cards, playable today)** and **La Previa spicy +30 per level (90 cards, reachable after HU-10)**. La Previa standard already meets ≥ 30 per level.

### Implementation

1. Append the new cards to the existing `cards` arrays of `la-previa.json` and `entre-dos.json`, so the loader (`catalog.ts`) needs no change.
2. IDs continue the sequences: `dos-031 … dos-090`, `prev-102 … prev-191`. No existing ID changes or is reused (seen-card history depends on them).
3. Fields follow `Card` in `src/features/content/card-types.ts`; authoring notes (`rationale`, `selfCheck`, `illustrationIdea`) are not shipped.
4. Mix per level and category: ~60 % `challenge`, ~20 % `truth`, ~20 % group (`everyoneWho` / `neverHaveIEver`). For 20 new Entre Dos cards per level that is 12 / 4 / 4; for 30 spicy per level, 18 / 6 / 6.
5. Points within the level range (easy 1–10, medium 11–20, hard 21–30); drinks by level per `policy.md` (easy 1, medium 1–2, hard 2–3).
6. Entre Dos is `couple` mode: every card is `heat: "standard"` (the validator rejects spicy in couple categories); `{player}` and `{partner}` placeholders are allowed in individual cards; flirty and suggestive, never explicit.
7. La Previa spicy cards use the Sin Filtro tier in `policy.md` (kisses with consent, lap sitting, sensual dance without intimate touch, non-graphic sexual confessions, flirty messages to an ex or crush) and stay inside "Never, in any tier". The engine already filters `heat: "spicy"` unless `spicyEnabled`, so they are unreachable before HU-10.
8. `requiresConsent: true` on every touch or very-close dare; `reachesOutside: true` on every call, message, or post. Consent and outside-contact rules are not repeated in `body`.
9. `targetGender` only when the dare depends on it: a minority of each batch (≤ 10 %), only `male` / `female`, never `undisclosed`.

### Validation and definition of done

- `validateCards` over both files merged: 0 errors; warnings 0 or justified in the review note. Checked continuously while writing with a temporary Jest test that also asserts the per-level counts (deleted before commit because tests are HU-00-owned; a permanent count test is a requested shared change).
- `npx jest src/features/content` green (`catalog-test.ts` validates the shipped JSON); full `npm test` green with the global coverage threshold met; `npx expo lint` and `npx tsc --noEmit` clean.
- `docs/content/launch-content-review.md` lists counts per category / heat / level / type, consent / outside / gender-target counts, the validation result, and the line "Status: pending human review — no human has reviewed these cards yet." Reviewer and date stay blank.
- The human-review acceptance criterion stays open in the PR: only a person can close it.

### Non-functional

- Security: no code and no new dependency; nothing leaves the device. App Store 1.1.4 / 1.4.3 and Google Play content rules apply to every card (policy checklist).
- Performance: ~150 more cards in bundled JSON (tens of KB); validation runs once at load and is cached.
- Accessibility: copy limits (headline ≤ 45, body ≤ 240, quip ≤ 30) keep cards readable at large text sizes.
