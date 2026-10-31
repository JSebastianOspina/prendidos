# Design

## Context

- `src/` is still the Expo Router template; there is no game code and no test runner. This change adds the first feature module and the Jest setup.
- Card copy is written by the `write-cards` skill (`ai-specs/skills/write-cards/`) as JSON and reviewed by humans. The validator must accept that JSON as-is — including the skill's authoring notes and `null` for unset fields — so it cannot rely on TypeScript types alone.
- The card shape and its rationale come from `docs/content/card-templates.md`; motivation is in `proposal.md`, behavior in `specs/card-content/spec.md`.
- Expo SDK 58: `jest-expo` requires Jest 30 (verified at https://docs.expo.dev/develop/unit-testing/).

## Goals / Non-Goals

**Goals:**

- One typed model for cards that later changes (card face, game engine, content files) import from a single place.
- A pure validator that can run in Jest today and in a content-check script or CI step later, and that the skill's output passes when its copy is right.
- Rendering one card's copy for one gender, which both the length check and the future card face need.

**Non-Goals:**

- Loading, bundling, or selecting cards at runtime.
- Choosing which player fills `{player}` or rendering copy for several players at once — that belongs to the game engine change.
- Store products, entitlements, or the Sin Filtro switch in code; they change in `docs/data-model.md` only.
- Catching every disguise of a banned phrase (leetspeak such as `f0ndo`): the matcher handles the common ones; human review (PRD §6.2) stays mandatory.

## Decisions

### 1. Module layout in `src/features/content/`

| File                  | Responsibility                                                                 |
| --------------------- | ------------------------------------------------------------------------------ |
| `card-types.ts`       | Domain types: `Card`, `Category`, `DrinkPenalty`, enums, points ranges, limits |
| `gendered-text.ts`    | Parse copy into text, placeholders, and variants; render per gender; measure length |
| `banned-phrases.ts`   | The maintained banned-phrase list and the normalizing matcher                  |
| `validate-cards.ts`   | `validateCards(catalog)` → `ContentViolation[]`, one small check per rule      |
| `__tests__/*-test.ts` | Jest tests, one file per module (Expo's `__tests__` + `-test` convention); fixtures in `__tests__/fixtures/`, excluded from test discovery |

No React or Expo imports, per `docs/frontend-standards.md` (game rules are pure TypeScript).

### 2. Strict domain types, total validator

`Card` is a discriminated union on `type`: `IndividualCard` (`challenge` | `truth`, with `headline`, `points`, `penalty` required) and `GroupCard` (`everyoneWho` | `neverHaveIEver`, without them). The game and UI get compile-time safety.

`validateCards(catalog: unknown)` is total over JSON values: whatever the shape, it returns violations and never throws. (Exotic JavaScript objects such as throwing getters or revoked proxies are out of scope; content is always parsed JSON.)

Each violation carries a `severity`. Structural rules are `error`s and block shipping. The two text heuristics — banned phrases (§5) and drink amounts in copy (§6) — are `warning`s: they flag copy for the mandatory human review (PRD §6.2) instead of blocking it, because no word list can be both complete and free of false positives ("una historia con fondo blanco" is a legitimate dare). `hasErrors(violations)` tells a caller whether the catalog can ship.

- The catalog, each category, and each card are checked for being plain objects before any field is read; failures report `catalog`, `categories[i]`, or `cards[i]`.
- Categories are validated too (non-blank unique ID, `mode` exactly `friends` | `couple`, `freeDifficulties` from the difficulty list). Cards are only checked against the mode of a valid category, so a malformed mode never passes the heat or placeholder rules by accident.
- Fields are read with own-property checks only, so keys such as `constructor` or `toString` never resolve to prototype values.
- Optional fields set to `null` count as unset (the skill writes `"targetGender": null`). Required fields set to `null` are missing.
- Unknown card fields are reported (`unknownField`) so a typo cannot silently disable a rule. The skill's authoring notes (`rationale`, `selfCheck`, `illustrationIdea`) are on an allowlist.
- A rule that depends on another field still checks what it can: a non-number `points` is `invalidField` even when `difficulty` is invalid, and a placeholder unknown in every mode is reported even when the category is unknown.

- *Alternative:* a schema library such as Zod. Rejected for now: a new dependency needs an ADR, and the rules are few and mostly cross-field (heat × category mode, points × difficulty) where schemas add little.

### 3. `GenderedText` is an inline string format

Copy stays a plain string: `{player}` and `{partner}` are placeholders; `{masculine|feminine|neutral}` is a variant (exactly three non-blank options). This settles the open question in PRD §12 and matches what the skill already writes.

Semantics, for the game engine to implement: the copy speaks to the **current player** (usted), and variants agree with the current player's gender. `{player}` is **another** player the app picks (PRD §5.6 `{jugador}`); `{partner}` is the other player in couple mode. Copy must not need agreement with `{player}`'s gender — write that part neutrally. Group cards speak to the whole group: they render the neutral option of every variant and cannot use placeholders (the validator rejects them).

- *Alternative:* an object per field (`{ male, female, neutral }`). Triples every string for the common case where only one word changes, and is harder to write and review.
- *Alternative:* ICU MessageFormat `select`. Needs a library and is unreadable for content writers.

A `{…}` token with pipes is a variant; a single word is a placeholder; anything else is malformed. `renderGenderedText` resolves placeholders from own properties of the value map only.

### 4. Length and blankness

- Each field is rendered once per gender; the longest rendering is checked against the limit in `copyLengthLimits`: headline 45, body 240, quip 30. Placeholders count as 12 characters, a typical long first name.
- Length is counted in Unicode code points after NFC normalization, so decomposed accents and most emoji count as one character.
- Blank means empty after removing whitespace and invisible format characters (`\p{Cf}`, e.g. zero-width spaces); this applies to required text, IDs, and variant options.

The limits are constants in `card-types.ts` so the card-face change can tune them after seeing real layouts.

### 5. Banned phrases match normalized renderings (warnings)

The matcher runs on **each gender rendering**, so a phrase split across a variant (`fondo {blanco|…}`) is caught. Normalization: NFKD (folds full-width and compatibility letters), remove combining marks and format characters, lower-case. Matching:

- Words of a multi-word phrase may be separated by spaces, `-`, `_`, `.`, or nothing ("fondoblanco").
- Each entry may be followed by repeated **final** letters and a plural ending (`mka` → "mkaaa", `puto` → "putos", `marica` → "maricas"), but not by other letters ("computo", "Maricarmen" stay clean). Letters repeated mid-word ("puuuto") are not caught.
- The list covers the PRD and skill policy: "fondo blanco", "hasta el fondo", and the legacy slurs found in `docs/content/legacy/legacy-challenges.json` plus their feminine and common Colombian forms: "puss", "pussy", "puto", "puta", "hpt", "hpta", "hijueputa", "hijo de puta", "gilipollas", "pelotudo", "pelotuda", "marica", "maricon", "mka", "mk", "morrongo". `mk` also flags "MK" in "Mortal Kombat"; as a warning that is acceptable. A regression test runs every legacy slur form through the matcher.

### 6. Drink amounts in copy (warnings)

After stripping format characters, a heuristic flags, in the body or quip:

- an amount (digits, `un`/`una`/`uno`…`diez`, `doble`, `media`) followed within two words by a drink unit (`trago`, `shot`, `copa`, `piscinero`, `pola`, `guaro`, `aguardiente`, `cerveza`, `chupito`, `vaso`, `botella`, singular or plural), with or without a space ("5tragos");
- a drinking verb (`tomar`, `beber` and forms such as "se toma", "tómese", "tómate", "beba") followed within two words by an amount ("Si no, se toma 2").

"nada de trago" passes. A regression test checks that the legacy deck's penalty phrasings are flagged. It is a backstop for the skill rule "drinking appears only in `penalty.drinks`", not a parser, and idioms such as "dos copas del mundo" will be flagged for a human to clear.

### 7. Card IDs

IDs are slugs (`^[a-z0-9]+(-[a-z0-9]+)*$`). The `write-cards` skill emits draft IDs (`draft-<category>-<nnn>`) so its output is validatable; the final ID is assigned when a human approves the card, and shipped IDs are never reused.

### 8. Jest setup follows the Expo SDK 58 guide

- Install: `npx expo install jest-expo jest @types/jest --dev`. React Native Testing Library is deferred to the first component test.
- `package.json`: `"test": "jest --watchAll=false"`, `"jest": { "preset": "jest-expo" }`, fixtures excluded from test discovery, coverage collected from `src/features/**/*.{ts,tsx}` with a 90 % threshold. This deliberately overrides the "all layers" coverage rule for template code outside `src/features/`; `docs/frontend-standards.md` records it.
- `tsconfig.json`: `compilerOptions.types: ["jest"]`. `@types/node` is a dev dependency, referenced with `/// <reference types="node" />` by the test that reads the skill file. One `tsc` program covers app and tests, so Jest and Node global types are visible to app code at type-check time. Accepted for now: Metro does not provide Node globals at runtime, and a separate test `tsconfig` would add a second type-check command to every task. Revisit if app code starts relying on them by mistake.

### 9. `docs/data-model.md` changes

- `Card`: fields from proposal.md; validation rules point to the `card-content` spec instead of repeating them; `GenderedText` semantics from §3.
- Launch catalog: drop `sin-filtro`; `la-previa` and `entre-dos` remain.
- `Product.kind`: `categoryPack | difficultyPack | spicyLayer | allAccess`; the Sin Filtro pack is a `spicyLayer` that applies to every `friends` category.
- `GameSettings.spicyEnabled: boolean` (false when the layer is locked); `DeviceState.lastSpicyEnabled` remembers the last choice.
- Access rule: a `spicy` card also needs an active `spicyLayer` or `allAccess` entitlement and `spicyEnabled`.

## Risks / Trade-offs

- [Setting `types: ["jest"]` stops TypeScript from auto-including other `@types` packages] → run `npx tsc --noEmit` right after the change; add any missing type package explicitly.
- [Rules duplicated between the skill's `policy.md` and the validator drift apart] → the validator owns mechanical rules; `policy.md` lists exactly which and keeps judgment calls (fun, kernel, consent wording).
- [Looser matching flags a legitimate word (plural or no-space forms)] → tests pin known look-alikes; entries stay specific; human review decides edge cases.
- [The drink-amount heuristic misses phrasings or flags a non-instruction] → it is a backstop; the skill and human review stay primary.
- [The 12-character placeholder estimate is wrong for long names] → the card face must still handle overflow (card-templates rule 4); the constant is easy to tune.

## Migration Plan

No shipped data or persisted state uses the old shape, so there is nothing to migrate. Rollback is reverting the change.

## Open Questions

- A command-line runner (`npm run validate-cards -- <file.json>`) so the `write-cards` skill can validate a batch without a Jest test. Until then the skill validates through a temporary test or asks a developer; the next content change adds the runner.
- Stricter category checks (required `name`, slug IDs, unknown fields, banned phrases in `name` / `description`). Categories are authored in code by developers today, so this can wait for the first content-catalog change.
