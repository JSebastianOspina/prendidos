---
description: Review note for the HU-15 content batch — four new cards written for illustration keys no card fit, plus the illustration tags (batches 1 to 3) added across the launch catalog. Pending human review.
alwaysApply: false
---

# Illustration Batch Review (HU-15)

**Status: pending human review — no human has reviewed these cards or tags yet.**

| Reviewer | Date | Result |
| -------- | ---- | ------ |
|          |      |        |

Only the human who reviews the batch fills in this table. HU-15 requires every illustration key to be used by a shipped card (`openspec/changes/hu-15-illustrations-and-motion`, launch-catalog spec); four keys had no fitting card, so these cards were written with the `write-cards` skill. Earlier batches have their own notes: [`seed-batch-review.md`](./seed-batch-review.md) and [`launch-content-review.md`](./launch-content-review.md).

## New Cards

Appended to the catalog files; no existing ID changed or was reused. All are `standard` heat, with no `targetGender` and no consent or outside-contact flag.

| ID         | Category  | Type          | Level  | Points / drinks | Headline                   | Illustration         | Legacy reference |
| ---------- | --------- | ------------- | ------ | --------------- | -------------------------- | -------------------- | ---------------- |
| `prev-192` | La Previa | `everyoneWho` | easy   | — (group rule)  | ¡Que arranque la previa!   | `shot-glass-on-fire` | `start` (opening card) |
| `prev-193` | La Previa | `everyoneWho` | medium | — (group rule)  | Por la amistad, parce      | `glasses-toasting`   | `04E05904`       |
| `prev-194` | La Previa | `challenge`   | medium | 14 / 1          | Hablen ladrando            | `two-dogs`           | `B1757B35`       |
| `dos-091`  | Entre Dos | `challenge`   | medium | 13 / 1          | Kikirikí de amor           | `rooster`            | `2B0A3F96`       |

Reviewer checklist for this batch:

- **Drink props:** `shot-glass-on-fire` and `glasses-toasting` sit only on group cards, whose shared drink is the app's group rule ("El que le aplique, toma"). Neither body mentions drinking, amounts, or speed (art rules in `docs/brand/README.md`; `write-cards` policy "Drinking"). Reject the tag if a card reads as drinking fast or a lot.
- **Fun:** each card should make the group react out loud (`selfCheck.fun` was 4 for all four).
- **Gender:** all copy is invariable; "por gallina" is in the voice guide's quip list.

## Illustration Tags

**Batch 1 (24 keys):** 105 of 285 cards were tagged. Tags follow the library's "typical cards" column: the level faces by mood (relaxed Suave, smirk Picante, laugh Prendido), format keys on every "Cultura time", "Historytime", and "Momento sad" card ("Cultura chopística" trivia rounds also take `mascot-monocle`), and props by mechanic (`phone-ringing` only on `reachesOutside` calls and messages, `microphone` on singing dares).

**Batch 2 (18 more keys, 2026-11-06):** 167 more cards were tagged by theme with the sheet 2 pieces (romance and kisses `heart-arrow`; messages `chat-bubbles`; posts and likes `like-heart`; hugs and touch `mascot-hug`; ex and despecho `mascot-broken-heart`; lies and excuses `mascot-fingers-crossed`; and so on, see `docs/brand/README.md` § Card Illustration Library). Two cards moved to a better-fitting key: `prev-099` "Discurso de boda" (`mascot-pointing` → `ring-box`) and `dos-080` "La gran propuesta" (`mascot-laugh` → `ring-box`). Two singing cards (`prev-021`, `prev-061`) took `microphone`, and three dance cards (`prev-148`, `prev-167`, `dos-053`) took `mascot-dancing`.

**Batch 3 (18 more keys, 2026-11-06):** 88 cards were moved or tagged to split the largest groups by what each card asks: voice notes `voice-note`, written or dictated messages `mascot-typing`, emojis and stickers `emoji-faces`, wrong chat and notifications `mascot-phone-shock`, kisses `mascot-kissing`, first kisses and shy confessions `mascot-blushing`, photos `photo-camera`, bio and profile `profile-card`, galleries `photo-gallery`, catwalk and show `mascot-posing`, massages `mascot-spa`, staring contests `staring-eyes`, timed dares `stopwatch`, games `rock-paper-scissors`, partner dances `dance-shoes`, songs `headphones-music`, gossip `mascot-gossip`, and a birthday `confetti`. The 13 cards that showed only their level face got a key (the two calls among them take `phone-ringing`).

All 285 shipped cards now carry their own key, and no key serves more than 12 cards (before batch 3, `chat-bubbles` and `heart-arrow` served 20 each). The game also avoids showing the same illustration on two cards in a row (`game-engine`). Every key of the 60-key library is used. Review the tags with the cards: a tag that changes the meaning of a card, or a drink prop outside a group toast, is rejected.

## Validation

`validateCards` reports no errors and no warnings for the four new cards, and the shipped catalog builds (`src/features/content/__tests__/catalog-test.ts`: no errors, every key used, every level illustrated, format keys).
