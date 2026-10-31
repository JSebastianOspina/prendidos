# card-content Specification

## Purpose

Defines the shape of the card content bundled with Prendidos and the rules a card catalog must pass before it can ship, so that AI-written and human-written cards meet the PRD's drinking, consent, and store-policy limits automatically.

## Requirements

### Requirement: Catalog validation reports every violation

Validating a card catalog (its categories and cards) SHALL return the complete list of violations, each naming its subject (a card or category ID, its position such as `cards[2]` or `categories[0]` when it has no usable ID, or `catalog`), the rule broken, a severity, and a readable English message. A catalog with no violations SHALL return an empty list.

#### Scenario: Valid catalog

- **WHEN** a catalog where every card and category follows all content rules is validated
- **THEN** the result is an empty list of violations

### Requirement: Violations are errors or warnings

Each violation SHALL be an `error` (the catalog cannot ship until it is fixed) or a `warning` (copy a text heuristic flags for human review, PRD §6.2). Only the banned-phrase and drinks-in-copy rules SHALL produce warnings; every other rule produces errors. A catalog can ship when it has no errors and a human has reviewed every warning.

#### Scenario: Heuristic finding is a warning

- **WHEN** a body contains "fondo blanco"
- **THEN** the violation has severity `warning`

#### Scenario: Structural problem is an error

- **WHEN** a challenge has a penalty of 4 drinks
- **THEN** the violation has severity `error`

#### Scenario: Several problems in one catalog

- **WHEN** a catalog has one card with 4 drinks and another card with a duplicate ID
- **THEN** the result contains both violations, each with its card ID and rule

### Requirement: Validation never fails on malformed input

Validation SHALL accept any JSON value, including JSON of the wrong shape, and report problems as violations instead of failing with an error.

#### Scenario: Catalog is not an object

- **WHEN** `null`, a string, or an object without `categories` and `cards` lists is validated
- **THEN** the result contains an invalid-field violation for `catalog` and no error is raised

#### Scenario: Card or category is not an object

- **WHEN** the cards list contains a string and the categories list contains `null`
- **THEN** the result contains invalid-field violations for `cards[i]` and `categories[i]`

### Requirement: Categories are well-formed

Every category SHALL have a unique, non-blank ID, a mode of exactly `friends` or `couple`, and a list of free difficulties drawn from `easy`, `medium`, and `hard`.

#### Scenario: Mode with the wrong case

- **WHEN** a category has mode `Couple`
- **THEN** validation reports an invalid-field violation for that category, and its cards are not checked against a mode it does not have

#### Scenario: Duplicate category ID

- **WHEN** two categories share the ID `la-previa`
- **THEN** validation reports a duplicate-ID violation for `la-previa`

### Requirement: Card IDs are unique slugs

Every card ID SHALL be unique across the whole catalog, regardless of category, and SHALL be a slug of lowercase letters, digits, and single hyphens (e.g. `prev-001`).

#### Scenario: Duplicate ID across categories

- **WHEN** two cards in different categories share the ID `prev-001`
- **THEN** validation reports a duplicate-ID violation for `prev-001`

#### Scenario: ID that is not a slug

- **WHEN** a card has the ID `Prev 001`
- **THEN** validation reports an invalid-field violation for the ID

### Requirement: Cards belong to an existing category

Every card SHALL reference a category that exists in the catalog.

#### Scenario: Unknown category

- **WHEN** a card references the category `sin-filtro` and the catalog has no such category
- **THEN** validation reports an unknown-category violation for that card

### Requirement: Card fields are known

Cards SHALL only contain the fields of the card model. The authoring notes the `write-cards` skill adds (`rationale`, `selfCheck`, `illustrationIdea`) are allowed and ignored. Optional fields set to `null` SHALL count as unset.

#### Scenario: Misspelled field

- **WHEN** a card has a field named `targetGendre`
- **THEN** validation reports an unknown-field violation naming `targetGendre`

#### Scenario: Skill output with authoring notes and nulls

- **WHEN** a card has `rationale`, `selfCheck`, `"targetGender": null`, and `"sourceLegacyId": null`
- **THEN** none of those fields produce a violation

### Requirement: Individual cards carry points within their level

`challenge` and `truth` cards SHALL have integer points within their difficulty range: `easy` 1–10, `medium` 11–20, `hard` 21–30.

#### Scenario: Points outside the range

- **WHEN** a `medium` challenge has 25 points
- **THEN** validation reports a points-range violation

#### Scenario: Non-integer points

- **WHEN** a `hard` truth has 22.5 points
- **THEN** validation reports a points-range violation

#### Scenario: Points that are not a number

- **WHEN** a challenge has points `"10"`
- **THEN** validation reports an invalid-field violation for the points

### Requirement: Individual cards carry a bounded drink penalty

`challenge` and `truth` cards SHALL have a penalty of 1, 2, or 3 drinks (PRD §5.8), with an optional non-blank quip, and no other penalty fields.

#### Scenario: Too many drinks

- **WHEN** a challenge has a penalty of 4 drinks
- **THEN** validation reports a drinks-limit violation

#### Scenario: Missing penalty

- **WHEN** a challenge has no penalty
- **THEN** validation reports a missing-field violation for the penalty

#### Scenario: Misspelled or blank quip

- **WHEN** a penalty has a field named `qiup`, or a quip made only of spaces
- **THEN** validation reports an unknown-field or missing-field violation for the penalty

### Requirement: Group cards carry no points or penalty

`everyoneWho` and `neverHaveIEver` cards SHALL NOT have points or a penalty.

#### Scenario: Group card with points

- **WHEN** a `neverHaveIEver` card has 5 points
- **THEN** validation reports a forbidden-field violation for the points

### Requirement: Required copy is not blank

`challenge` and `truth` cards SHALL have a headline, and every card SHALL have a body. Text made only of whitespace or zero-width format characters counts as missing, and so does a gender-variant option made only of them.

#### Scenario: Challenge without headline

- **WHEN** a challenge has an empty headline
- **THEN** validation reports a missing-field violation for the headline

#### Scenario: Whitespace-only body

- **WHEN** a card's body is only spaces and a line break
- **THEN** validation reports a missing-field violation for the body

### Requirement: Copy fits the card

The headline SHALL be at most 45 characters, the body at most 240, and the penalty quip at most 30, counted as Unicode characters in the longest gender variant.

#### Scenario: Body too long in one variant

- **WHEN** a body is 230 characters with its masculine variant and 245 with its neutral variant
- **THEN** validation reports a length violation for the body

#### Scenario: Quip too long

- **WHEN** a penalty quip is 31 characters
- **THEN** validation reports a length violation for the quip

### Requirement: Copy that prescribes drinks is flagged

Drinking appears only in the structured penalty (PRD §5.8), so validation SHALL warn when the body or the penalty quip states an amount to drink: an amount followed by a drink unit (trago, shot, copa, piscinero, pola, guaro, aguardiente, cerveza, chupito, vaso, botella), or a drinking verb (tomar, beber and their imperatives) followed by an amount. The headline is not checked.

#### Scenario: Drinks in the body

- **WHEN** a body says "Tómese 5 tragos de aguardiente"
- **THEN** validation reports a drinks-in-copy warning

#### Scenario: Legacy penalty phrasing

- **WHEN** a body says "Si no, se toma 2" or "Tómese tres guaros"
- **THEN** validation reports a drinks-in-copy warning

#### Scenario: Drinking mentioned without an amount

- **WHEN** a body says "algo de comer (nada de trago)"
- **THEN** no drinks-in-copy violation is reported

### Requirement: Spicy cards only in friends categories

Cards with heat `spicy` (the Sin Filtro layer, PRD §6.4) SHALL belong to a `friends` category. Cards in `couple` categories SHALL be `standard`.

#### Scenario: Spicy card in couple mode

- **WHEN** a card with heat `spicy` belongs to the `entre-dos` category, whose mode is `couple`
- **THEN** validation reports a heat-mode violation

### Requirement: Copy with banned phrases is flagged

Validation SHALL warn when any gender rendering of the headline, body, or penalty quip contains a banned phrase ("fondo blanco", "hasta el fondo", the legacy slurs in masculine and feminine forms, and the rest of the maintained list). Matching SHALL ignore case, accents, compatibility forms such as full-width letters, zero-width format characters, separators or no space between words, plural endings, and repeated final letters.

#### Scenario: Fondo blanco in the body

- **WHEN** a body says "…o se toma un FONDO BLANCO"
- **THEN** validation reports a banned-phrase warning naming "fondo blanco"

#### Scenario: Phrase split across a gender variant

- **WHEN** a body says "fondo {blanco|blanco|blanco}"
- **THEN** validation reports a banned-phrase warning naming "fondo blanco"

#### Scenario: Disguised and feminine slurs

- **WHEN** copy contains "hpt*", "hpta", "Mkaaa", "putos", "puta", "pelotuda", or "fondo-blanco"
- **THEN** validation reports a banned-phrase warning for each

### Requirement: Copy uses well-formed placeholders and gender variants

Copy SHALL only use the placeholders `{player}` and, in `couple` categories, `{partner}`. Group cards (`everyoneWho`, `neverHaveIEver`) speak to the whole group, so they SHALL NOT use placeholders; their gender variants always render the neutral option. A gender variant SHALL be written `{masculine|feminine|neutral}` with exactly three non-blank options.

#### Scenario: Two-option variant

- **WHEN** a headline contains `{tímido|tímida}`
- **THEN** validation reports a malformed-variant violation

#### Scenario: Unknown placeholder

- **WHEN** a body contains `{jugador}`
- **THEN** validation reports an unknown-placeholder violation, even if the card's category is unknown

#### Scenario: Placeholder in a group card

- **WHEN** a `neverHaveIEver` card's body contains `{player}`
- **THEN** validation reports an unknown-placeholder violation

#### Scenario: Partner placeholder in friends mode

- **WHEN** a card in a `friends` category uses `{partner}`
- **THEN** validation reports an unknown-placeholder violation

### Requirement: Gender targeting never uses undisclosed

A card's target gender, when set, SHALL be `male` or `female`.

#### Scenario: Undisclosed target

- **WHEN** a card has target gender `undisclosed`
- **THEN** validation reports a target-gender violation
