# Design

## Context

- `src/` is still the Expo Router template; there is no game code and no test runner. This change adds the first feature module and the Jest setup.
- Card copy is written by the `write-cards` skill (`ai-specs/skills/write-cards/`) as JSON and reviewed by humans. The validator must accept that JSON as-is, so it cannot rely on TypeScript types alone.
- The card shape and its rationale come from `docs/content/card-templates.md`; motivation is in `proposal.md`, behavior in `specs/card-content/spec.md`.
- Expo SDK 58: `jest-expo` requires Jest 30 (verified at https://docs.expo.dev/develop/unit-testing/).

## Goals / Non-Goals

**Goals:**

- One typed model for cards that later changes (card face, game engine, content files) import from a single place.
- A pure validator that can run in Jest today and in a content-check script or CI step later.

**Non-Goals:**

- Loading, bundling, or selecting cards at runtime.
- Rendering copy (resolving placeholders and gender variants for a real player) — only parsing it for validation.
- Store products, entitlements, or the Sin Filtro switch in code; they change in `docs/data-model.md` only.

## Decisions

### 1. Module layout in `src/features/content/`

| File                  | Responsibility                                                                 |
| --------------------- | ------------------------------------------------------------------------------ |
| `card-types.ts`       | Domain types: `Card`, `Category`, `DrinkPenalty`, enums, points ranges         |
| `gendered-text.ts`    | Parse copy into text, placeholders, and variants; list renderings; measure length |
| `banned-phrases.ts`   | The maintained banned-phrase list and the accent-insensitive matcher           |
| `validate-cards.ts`   | `validateCards(catalog)` → `ContentViolation[]`, one small check per rule      |
| `__tests__/*-test.ts` | Jest tests, one file per module (Expo's `__tests__` + `-test` convention)      |

No React or Expo imports, per `docs/frontend-standards.md` (game rules are pure TypeScript).

### 2. Strict domain types, loose validator input

`Card` is a discriminated union on `type`: `IndividualCard` (`challenge` | `truth`, with `headline`, `points`, `penalty` required) and `GroupCard` (`everyoneWho` | `neverHaveIEver`, without them). The game and UI get compile-time safety.

`validateCards` takes `CatalogInput`, where every card field is optional and loosely typed, because its input is untrusted JSON from the skill or a person. It never throws on bad data; every problem becomes a `ContentViolation { subjectId, rule, message }`.

- *Alternative:* a schema library such as Zod for both. Rejected for now: a new dependency needs an ADR, and the rules are few and mostly cross-field (heat × category mode, points × difficulty) where schemas add little.

### 3. `GenderedText` is an inline string format

Copy stays a plain string: `{player}` and `{partner}` are placeholders; `{masculine|feminine|neutral}` is a variant (exactly three options). This settles the open question in PRD §12 and matches what the skill already writes.

- *Alternative:* an object per field (`{ male, female, neutral }`). Triples every string for the common case where only one word changes, and is harder to write and review.
- *Alternative:* ICU MessageFormat `select`. Needs a library and is unreadable for content writers.

A `{…}` token with pipes is a variant; without pipes it is a placeholder. Any other token is a violation.

### 4. Length is measured on the longest rendering

The validator renders each field once per gender (masculine, feminine, neutral) and checks the longest against the limit: headline 45 characters, body 240. Placeholders count as 12 characters, a typical long first name, since real names are unknown at validation time. The limits are constants in `card-types.ts` so the card-face change can tune them after seeing real layouts.

### 5. Banned phrases match normalized words

Copy and phrases are lower-cased and stripped of accents (Unicode NFD, remove combining marks) before matching on word boundaries, so "FONDO BLANCO" and "fondo blancó" match but "computo" does not match "puto". The initial list covers the PRD and the skill's policy: excessive-drinking phrases ("fondo blanco", "hasta el fondo") and the legacy slurs ("puss", "puto", "gilipollas", "pelotudo", "marica", "mka", "morrongo").

### 6. Jest setup follows the Expo SDK 58 guide

- Install: `npx expo install jest-expo jest @types/jest --dev`. React Native Testing Library is deferred to the first component test.
- `package.json`: `"test": "jest --watchAll=false"` (non-watch so agents and CI can run it), `"jest": { "preset": "jest-expo" }`, coverage collected from `src/features/**/*.ts` with a 90 % threshold. Template code outside `src/features/` is excluded so the threshold reflects real game code.
- `tsconfig.json`: `compilerOptions.types: ["jest"]`.

### 7. `docs/data-model.md` changes

- `Card`: fields from proposal.md; validation rules point to the `card-content` spec instead of repeating them.
- Launch catalog: drop `sin-filtro`; `la-previa` and `entre-dos` remain.
- `Product.kind`: `categoryPack | difficultyPack | spicyLayer | allAccess`; the Sin Filtro pack is a `spicyLayer` that applies to every `friends` category.
- `GameSettings.spicyEnabled: boolean` (false when the layer is locked); `DeviceState.lastSpicyEnabled` remembers the last choice.
- Access rule: a `spicy` card also needs an active `spicyLayer` or `allAccess` entitlement and `spicyEnabled`.

## Risks / Trade-offs

- [Setting `types: ["jest"]` stops TypeScript from auto-including other `@types` packages] → run `npx tsc --noEmit` right after the change; add any missing type package explicitly.
- [Rules duplicated between the skill's `policy.md` and the validator drift apart] → the validator owns mechanical rules; `policy.md` points to it for those and keeps judgment calls (fun, kernel, consent wording).
- [The banned list misses new slurs or blocks a legitimate word] → keep it in one file with tests per entry; human review stays mandatory (PRD §6.2).
- [The 12-character placeholder estimate is wrong for long names] → the card face must still handle overflow (card-templates rule 4); the constant is easy to tune.

## Migration Plan

No shipped data or persisted state uses the old shape, so there is nothing to migrate. Rollback is reverting the change.
