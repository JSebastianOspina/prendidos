---
description: Review note for the HU-07 launch content batch (Entre Dos fill-up and the La Previa Sin Filtro layer) — counts, flags, validation result, and human-review status.
alwaysApply: false
---

# Launch Content Review (HU-07)

**Status: pending human review — no human has reviewed these cards yet.**

| Reviewer | Date | Result |
| -------- | ---- | ------ |
|          |      |        |

Only the human who reviews the cards fills in this table. Until then, the HU-07 acceptance criterion "A human has reviewed every card before it ships" stays open. The earlier seed batch has its own note: [`seed-batch-review.md`](./seed-batch-review.md).

## What This Batch Adds

New cards were appended to the existing files; no existing card ID changed or was reused.

| File                                          | New IDs                   | Cards | Heat       |
| --------------------------------------------- | ------------------------- | ----- | ---------- |
| `src/features/content/catalog/entre-dos.json` | `dos-031` … `dos-090`     | 60    | `standard` |
| `src/features/content/catalog/la-previa.json` | `prev-102` … `prev-191`   | 90    | `spicy`    |

All copy was written with the `write-cards` skill (new cards, no legacy rewrites, so no `sourceLegacyId`). Authoring notes (`rationale`, `selfCheck`) are not shipped.

## Counts

### Catalog totals after this batch

| Category / heat         | easy | medium | hard |
| ----------------------- | ---- | ------ | ---- |
| La Previa — `standard`  | 39   | 31     | 31   |
| La Previa — `spicy`     | 30   | 30     | 30   |
| Entre Dos — `standard`  | 30   | 30     | 30   |

### Entre Dos — new cards (`dos-031` … `dos-090`)

| Difficulty | challenge | truth | everyoneWho | neverHaveIEver | Total | Points | Drinks         | Consent | Outside |
| ---------- | --------- | ----- | ----------- | -------------- | ----- | ------ | -------------- | ------- | ------- |
| easy       | 12        | 4     | 2           | 2              | 20    | 2–6    | 1 (×16)        | 2       | 1       |
| medium     | 12        | 4     | 2           | 2              | 20    | 11–17  | 1 (×12), 2 (×4) | 5       | 2       |
| hard       | 12        | 4     | 2           | 2              | 20    | 21–28  | 2 (×11), 3 (×5) | 5       | 4       |

44 cards use `{partner}`; none uses `targetGender` or gender variants.

### La Previa Sin Filtro — new cards (`prev-102` … `prev-191`)

| Difficulty | challenge | truth | everyoneWho | neverHaveIEver | Total | Points | Drinks          | Consent | Outside |
| ---------- | --------- | ----- | ----------- | -------------- | ----- | ------ | --------------- | ------- | ------- |
| easy       | 18        | 6     | 3           | 3              | 30    | 3–8    | 1 (×24)         | 2       | 3       |
| medium     | 18        | 6     | 3           | 3              | 30    | 11–19  | 1 (×16), 2 (×8) | 8       | 5       |
| hard       | 18        | 6     | 3           | 3              | 30    | 21–29  | 2 (×15), 3 (×9) | 9       | 7       |

19 cards use `{player}`; one headline uses `{m|f|n}` variants (`prev-145`, "Llegó {el seductor|la seductora|la persona más seductora}"). None uses `targetGender`, so no card targets any gender, including "Prefiero no decir".

Type mix per level in both batches: 60 % challenge, 20 % truth, 20 % group.

## Validation

`validateCards` over both shipped files merged (temporary Jest test, deleted before commit; the permanent `catalog-test.ts` check also passes): **0 errors, 0 warnings.**

## Reachability

- Entre Dos cards are playable today (the category's `freeDifficulties` is `["easy"]`, so medium and hard remain paid content).
- La Previa `spicy` cards are in the catalog but the engine deals them only when `spicyEnabled` is true (`card-selection.ts`). Nothing sets it before HU-10 (Sin Filtro switch) ships.

## What Reviewers Should Check

The validator cannot judge these (PRD §6.2, [review checklist](./README.md#review-checklist)):

- **Fun:** would the group react out loud? Easy cards are deliberately light.
- **Entre Dos stays `standard`:** flirting by words, looks, closeness, cheek or forehead kisses, slow dances, and confessions; no kisses on the lips, massages, or lap sitting (those are Sin Filtro items in `policy.md`). Is it suggestive enough for a couple without being explicit?
- **Sin Filtro stays inside "Never, in any tier":** kisses only with consent (`prev-163` "Un pico y ya" caps it at three seconds); dances and massages name hands on waist, shoulders, neck, or hands only; clothing removal is limited to shoes, socks, jacket, and accessories (`prev-103`, `prev-139`, `prev-173`); confessions ask "where / who / how many", never graphic detail.
- **Consent flags:** every touch or very-close dare has `requiresConsent: true` (including the "Cara a cara" and "Cuenta regresiva" palm-distance dares). Posts that show or name someone present (`dos-060`, `dos-074`, `dos-081`, `prev-140`, `prev-168`, `prev-172`) also set it, and so does `prev-134` ("Perreo sin tocar"), a dance aimed at one person even though nobody touches.
- **Social risk inside the group (judgment calls):** `prev-183` asks to name an ex in front of the group; `prev-185` and `prev-187` touch on feelings for people present or their partners; `prev-156` jokes about not remembering a name the next day. Keep, soften, or cut.
- **Fixed during the agent's adversarial pass:** `dos-078` no longer asks a friend of the partner to reveal what the partner confided (it now asks for a 1–10 rating of the player); `prev-134` now sets `requiresConsent`; several bodies were reworded to avoid gendered adjectives aimed at a player.
- **Outside the room:** ex, crush, and *culito* / *pétalo* contacts appear only in Sin Filtro, as the policy places them; Entre Dos calls go to family and friends. The joke is on the player; no card exposes the person outside. Check `prev-115` ("Contacto sospechoso", shows how the crush is saved on the phone) and `prev-149` (shows a selfie meant for a crush) for exposure risk; both show only the player's own content.
- **Gender:** copy was written to read right for male, female, and undisclosed players (invariable words such as "pareja", "alguien", "esa persona"; no gendered quips). Plural dance wording ("bien cerca", "cachete con cachete") avoids gendered adjectives.
- **Drinks by level** follow `policy.md` (easy 1, medium 1–2, hard 2–3) and never appear in the copy.
- **Repeated headlines** with the seed batch are kept on purpose for group cards ("¡Todos!", "Todos los que…", "¡Confiesen!"). No new individual headline repeats one already in the catalog.
