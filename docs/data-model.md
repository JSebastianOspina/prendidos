---
description: Domain entities, relationships, and database schema reference. Customize before implementation.
alwaysApply: false
---

# Data Model

## Status

| Field              | Value                                                               |
| ------------------ | ------------------------------------------------------------------- |
| Customized         | Yes (domain only — storage not decided)                             |
| Database engine    | None server-side. On-device storage, library to be decided via ADR  |
| ORM / access layer | Repository adapters in `src/features/<feature>/` over local storage |
| Product source     | [`docs/prd.md`](./prd.md) (Spanish) — this model must stay aligned  |

---

## Domain Overview

- Primary bounded contexts:
  - **Content** — categories, cards, and generic alternative penalties bundled with the app (read-only at runtime; updated through app releases or EAS Update).
  - **Game** — a play session: settings, players, card sequence, scoring, and end condition.
  - **Device state** — age confirmation, last players, seen-card history, and the resumable session, persisted on the device. No historical statistics.
  - **Purchases** — content unlocked through App Store / Google Play non-consumable in-app purchases.
- Ubiquitous language (code in English, product copy in Spanish):

| Term (code)           | Product term (ES)              | Meaning                                                                 |
| --------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| `GameMode`            | Modo                           | `friends` (Amigos) or `couple` (Pareja)                                 |
| `Category`            | Categoría                      | Themed content set; belongs to exactly one mode; one per session        |
| `Difficulty`          | Nivel                          | `easy` (Suave), `medium` (Picante), `hard` (Prendido)                   |
| `Card`                | Carta                          | A unit of content shown on screen                                       |
| `CardType`            | Tipo de carta                  | `challenge` (Reto), `truth` (Verdad), `everyoneWho` (Todos los que…), `neverHaveIEver` (Yo nunca) |
| Individual card       | Reto / Verdad                  | `challenge` or `truth`: targets the current player, has points, consumes the turn |
| Group card            | Carta grupal                   | `everyoneWho` or `neverHaveIEver`: interlude, no points, does not consume a turn |
| `Penalty`             | Castigo                        | What a player does when refusing a card                                 |
| `AlternativePenalty`  | Castigo alternativo            | Generic non-alcoholic penalty per difficulty, for players who don't drink |
| `Player`              | Jugador                        | A local participant (no accounts)                                       |
| `GameSession`         | Partida                        | One play-through from setup to final ranking                            |
| Round                 | Ronda                          | One turn per player                                                     |
| `Product`             | Pack / Pase total              | A store product that unlocks content                                    |
| `Entitlement`         | Compra                         | Cached ownership of a product                                           |

---

## Entities

### Category

**Description:** Themed set of cards (bundled content).

| Field             | Type         | Required | Description                                                                  |
| ----------------- | ------------ | -------- | ---------------------------------------------------------------------------- |
| `id`              | string       | Yes      | Stable slug, e.g. `la-previa`                                                |
| `name`            | string       | Yes      | Display name (Spanish copy)                                                  |
| `description`     | string       | No       | Short description shown in the picker                                        |
| `mode`            | GameMode     | Yes      | The single mode this category belongs to                                     |
| `freeDifficulties` | Difficulty[] | Yes     | Difficulties playable without a purchase (`[]` = fully paid, all three = fully free) |

**Relationships:** has many `Card`; unlocked by one or more `Product`.

**Launch catalog (provisional names, see PRD §6.1):**

| `id`         | `mode`    | `freeDifficulties`       |
| ------------ | --------- | ------------------------ |
| `la-previa`  | `friends` | `easy`, `medium`, `hard` |
| `sin-filtro` | `friends` | — (none)                 |
| `entre-dos`  | `couple`  | `easy`                   |

### Card

**Description:** A single piece of content. Replaces the former `Challenge` entity; `challenge` is now one `CardType`.

| Field          | Type             | Required             | Description                                                                                   |
| -------------- | ---------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `id`           | string           | Yes                  | Stable ID, unique across categories                                                           |
| `categoryId`   | string           | Yes                  | Owning `Category.id` (mode is derived from the category)                                      |
| `type`         | CardType         | Yes                  | `challenge` \| `truth` \| `everyoneWho` \| `neverHaveIEver`                                   |
| `difficulty`   | Difficulty       | Yes                  | `easy` \| `medium` \| `hard`                                                                  |
| `text`         | GenderedText     | Yes                  | Spanish copy; may contain player placeholders and gender variants (see below)                 |
| `points`       | number           | Individual cards     | Points awarded on completion; must fall within the difficulty range. Absent for group cards   |
| `penalty`      | GenderedText     | Individual cards     | Alcohol penalty written for this card (e.g. "Toma 2 tragos"). Absent for group cards          |
| `targetGender` | PlayerGender     | No                   | When set, the card targets (or mentions) a player of that gender; skipped if none is eligible |

**`GenderedText`:** the card text with placeholders (e.g. `{player}`, `{partner}`) and gender variants resolved at render time from the target player's `gender`. Players with `undisclosed` get the neutral variant. Exact placeholder/variant syntax is a technical design decision (PRD §12).

**Validation rules:**

- `points` ranges per difficulty: `easy` 1–10, `medium` 11–20, `hard` 21–30.
- `points` and `penalty` are required for `challenge` and `truth`, and forbidden for `everyoneWho` and `neverHaveIEver`.
- `penalty` asks for **at most 3 drinks** and never asks to finish a drink ("fondo blanco") — App Store guideline 1.4.3.
- `targetGender` never equals `undisclosed`.
- `categoryId` must reference an existing category.
- IDs are never reused once shipped (seen-card history depends on them).
- Launch target: 90 cards per category, 30 per difficulty, mixed ~60 % `challenge`, ~20 % `truth`, ~20 % group cards.

### AlternativePenalty

**Description:** Generic non-alcoholic penalty shown to players who don't drink, for individual and group cards.

| Field        | Type         | Required | Description                         |
| ------------ | ------------ | -------- | ----------------------------------- |
| `id`         | string       | Yes      | Stable ID                           |
| `difficulty` | Difficulty   | Yes      | Level the penalty matches           |
| `text`       | GenderedText | Yes      | Spanish copy, e.g. "Haz 10 sentadillas" |

### Player

**Description:** A local participant in a session.

| Field    | Type         | Required | Description                                          |
| -------- | ------------ | -------- | ---------------------------------------------------- |
| `id`     | string       | Yes      | Generated locally                                    |
| `name`   | string       | Yes      | Display name                                         |
| `gender` | PlayerGender | Yes      | `male` \| `female` \| `undisclosed` (Prefiero no decir) |
| `drinks` | boolean      | Yes      | `false` = gets alternative penalties instead of drinks |

**Privacy:** player names and genders never leave the device and are never sent to analytics.

### GameSettings

**Description:** Configuration chosen in the setup screen.

| Field                  | Type          | Required | Description                                                                 |
| ---------------------- | ------------- | -------- | --------------------------------------------------------------------------- |
| `mode`                 | GameMode      | Yes      | `friends` or `couple`                                                       |
| `categoryId`           | string        | Yes      | Must belong to `mode`                                                       |
| `players`              | Player[]      | Yes      | Turn order = array order (can be shuffled before starting)                  |
| `selectedDifficulties` | Difficulty[]  | Yes      | Defaults to all three; escalation walks only through the selected ones      |
| `endCondition`         | EndCondition  | Yes      | Defaults to `{ type: 'rounds', rounds: 10 }`                                |

**`EndCondition`** (discriminated union):

| `type`   | Extra field                    | Rule                                                                                 |
| -------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| `rounds` | `rounds`: 5 \| 10 \| 15 \| 20  | Ends after the last round                                                            |
| `points` | `target`: 100 \| 200 \| 300    | When a player reaches `target`, the current round finishes, then the game ends       |
| `open`   | —                              | Ends when the group closes it                                                        |

**Validation rules:** `friends` requires 2–12 players; `couple` requires exactly 2; `selectedDifficulties` is non-empty.

### GameSession

**Description:** State of a play-through. Persisted so an interrupted game can be resumed.

| Field                 | Type                       | Required | Description                                                          |
| --------------------- | -------------------------- | -------- | -------------------------------------------------------------------- |
| `id`                  | string                     | Yes      | Generated locally                                                    |
| `settings`            | GameSettings               | Yes      | Snapshot of the setup                                                |
| `status`              | `inProgress` \| `finished` | Yes      |                                                                      |
| `currentRound`        | number                     | Yes      | 1-based                                                              |
| `currentPlayerIndex`  | number                     | Yes      | Index into `settings.players`                                        |
| `scores`              | Record<playerId, number>   | Yes      | Can be negative                                                      |
| `playedCardIds`       | string[]                   | Yes      | Prevents repeats within the session                                  |
| `swapsUsed`           | Record<playerId, boolean>  | Yes      | One free card swap per player per session                            |
| `couplePaywallShown`  | boolean                    | Yes      | The couple-mode soft paywall is shown at most once per session       |
| `startedAt`           | ISO date                   | Yes      |                                                                      |

**Game rules (domain logic, see PRD §5):**

- Completing an individual card adds `points`. Refusing subtracts `ceil(points / 2)` and shows the card's `penalty` (or an `AlternativePenalty` when `drinks` is `false`).
- Group cards are interludes: no points, no turn consumed.
- Escalation: by session progress (thirds for `rounds` / `points`; every N rounds for `open`), and by ascending `points` within a difficulty.
- Locked difficulties (no free access and no entitlement) are skipped; in couple mode the soft paywall appears once when escalation reaches a locked level, then play continues with the unlocked levels.
- Cards are not repeated within a session; unseen cards (per `DeviceState.seenCardIds`) are preferred; an exhausted difficulty pool resets.
- Ties share the rank.

### DeviceState

**Description:** Per-device persisted data outside a session. Replaces the former `Progress` entity — there are no cumulative points or historical statistics.

| Field            | Type     | Required | Description                                      |
| ---------------- | -------- | -------- | ------------------------------------------------ |
| `ageConfirmedAt` | ISO date | No       | When the "Soy mayor de 18" gate was accepted     |
| `lastPlayers`    | Player[] | Yes      | Preloads the next setup                          |
| `seenCardIds`    | string[] | Yes      | Cards shown in previous sessions                 |
| `activeSession`  | GameSession | No    | The resumable in-progress session, if any        |

### Product

**Description:** Bundled catalog of store products and what they unlock. Prices are set in App Store Connect / Google Play Console.

| Field       | Type                 | Required | Description                                                         |
| ----------- | -------------------- | -------- | ------------------------------------------------------------------- |
| `productId` | string               | Yes      | Store product ID (same on both stores when possible)                |
| `kind`      | `categoryPack` \| `difficultyPack` \| `allAccess` | Yes | What the product unlocks                           |
| `unlocks`   | ContentUnlock[]      | Unless `allAccess` | `{ categoryId, difficulties }` pairs                      |

`allAccess` (Pase total) unlocks every current **and future** category and difficulty.

**Launch products (PRD §7):**

| `kind`           | Unlocks                                  | Price    |
| ---------------- | ---------------------------------------- | -------- |
| `categoryPack`   | `sin-filtro`: all difficulties           | USD 1.99 |
| `difficultyPack` | `entre-dos`: `medium`, `hard`            | USD 1.99 |
| `allAccess`      | Everything, including future content     | USD 2.99 |

**Access rule:** a card is playable when its `difficulty` is in `Category.freeDifficulties`, or an active `Entitlement` unlocks that `(categoryId, difficulty)`, or an active `allAccess` entitlement exists.

### Entitlement

**Description:** Cached result of store purchases; the store SDK is the source of truth. Allows offline unlocks.

| Field        | Type     | Required | Description                        |
| ------------ | -------- | -------- | ---------------------------------- |
| `productId`  | string   | Yes      | References `Product.productId`     |
| `active`     | boolean  | Yes      | Last verified state                |
| `verifiedAt` | ISO date | Yes      | Last successful store verification |

---

## Entity-Relationship Diagram

```mermaid
erDiagram
  CATEGORY ||--o{ CARD : contains
  CATEGORY ||--o{ GAME_SESSION : "selected in"
  GAME_SESSION ||--|{ PLAYER : has
  GAME_SESSION }o--o{ CARD : plays
  DEVICE_STATE |o--o| GAME_SESSION : "resumes"
  DEVICE_STATE }o--o{ CARD : "has seen"
  PRODUCT }o--o{ CATEGORY : unlocks
  ENTITLEMENT }o--|| PRODUCT : "owns"
```

---

## Schema Conventions

- Primary key strategy: stable string slugs for bundled content; locally generated IDs for sessions and players.
- Timestamps: ISO 8601 strings in UTC.
- Soft delete: not applicable (no server-side user data). Content removal must keep old IDs reserved.
- Naming: camelCase fields and enum values in TypeScript types; storage keys namespaced per feature (e.g. `device.v1`), with a version suffix for migrations.

---

## Migration Notes


- All schema changes go through **versioned migrations** of the project ORM (none today; applies if a database or backend is added) — never ad-hoc SQL execution by agents
- Prefer backwards-compatible expand/contract changes; run `migration-review` before merge
- Agents must not execute `db:seed`, `db:wipe`, `migrate reset`, or equivalent — when seeding/wiping is required for verification, hand the **exact command** to the human (HITL), wait for confirmation, then continue (see `docs/security-standards.md` § Agent operational constraints)
- Soft delete: document fields/strategy here when the project uses soft delete

- On-device storage: when a persisted shape changes, bump the storage key version and write a migration function from the previous version — never silently drop user progress.
