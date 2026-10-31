# Spec Delta

## Purpose

Defines the shape of the card content bundled with Prendidos and the rules a card catalog must pass before it can ship, so that AI-written and human-written cards meet the PRD's drinking, consent, and store-policy limits automatically.

## ADDED Requirements

### Requirement: Catalog validation reports every violation

Validating a card catalog (its categories and cards) SHALL return the complete list of violations, each naming the card ID (or category ID), the rule broken, and a readable English message. A catalog with no violations SHALL return an empty list.

#### Scenario: Valid catalog

- **WHEN** a catalog where every card follows all content rules is validated
- **THEN** the result is an empty list of violations

#### Scenario: Several problems in one catalog

- **WHEN** a catalog has one card with 4 drinks and another card with a duplicate ID
- **THEN** the result contains both violations, each with its card ID and rule

### Requirement: Card IDs are unique

Every card ID SHALL be unique across the whole catalog, regardless of category.

#### Scenario: Duplicate ID across categories

- **WHEN** two cards in different categories share the ID `prev-001`
- **THEN** validation reports a duplicate-ID violation for `prev-001`

### Requirement: Cards belong to an existing category

Every card SHALL reference a category that exists in the catalog.

#### Scenario: Unknown category

- **WHEN** a card references the category `sin-filtro` and the catalog has no such category
- **THEN** validation reports an unknown-category violation for that card

### Requirement: Individual cards carry points within their level

`challenge` and `truth` cards SHALL have integer points within their difficulty range: `easy` 1–10, `medium` 11–20, `hard` 21–30.

#### Scenario: Points outside the range

- **WHEN** a `medium` challenge has 25 points
- **THEN** validation reports a points-range violation

#### Scenario: Non-integer points

- **WHEN** a `hard` truth has 22.5 points
- **THEN** validation reports a points-range violation

### Requirement: Individual cards carry a bounded drink penalty

`challenge` and `truth` cards SHALL have a penalty of 1, 2, or 3 drinks (PRD §5.8), with an optional quip.

#### Scenario: Too many drinks

- **WHEN** a challenge has a penalty of 4 drinks
- **THEN** validation reports a drinks-limit violation

#### Scenario: Missing penalty

- **WHEN** a challenge has no penalty
- **THEN** validation reports a missing-field violation for the penalty

### Requirement: Group cards carry no points or penalty

`everyoneWho` and `neverHaveIEver` cards SHALL NOT have points or a penalty.

#### Scenario: Group card with points

- **WHEN** a `neverHaveIEver` card has 5 points
- **THEN** validation reports a forbidden-field violation for the points

### Requirement: Individual cards have a headline

`challenge` and `truth` cards SHALL have a non-empty headline. Group cards MAY omit it.

#### Scenario: Challenge without headline

- **WHEN** a challenge has an empty headline
- **THEN** validation reports a missing-field violation for the headline

### Requirement: Copy fits the card

The headline SHALL be at most 45 characters and the body at most 240 characters, measured on the longest gender variant of each.

#### Scenario: Body too long in one variant

- **WHEN** a body is 230 characters with its masculine variant and 245 with its neutral variant
- **THEN** validation reports a length violation for the body

### Requirement: Spicy cards only in friends categories

Cards with heat `spicy` (the Sin Filtro layer, PRD §6.4) SHALL belong to a `friends` category. Cards in `couple` categories SHALL be `standard`.

#### Scenario: Spicy card in couple mode

- **WHEN** a card with heat `spicy` belongs to the `entre-dos` category, whose mode is `couple`
- **THEN** validation reports a heat-mode violation

### Requirement: Copy avoids banned phrases

The headline, body, and penalty quip SHALL NOT contain a banned phrase ("fondo blanco", "hasta el fondo", and the rest of the maintained list), matched without regard to case or accents.

#### Scenario: Fondo blanco in the body

- **WHEN** a body says "…o se toma un FONDO BLANCO"
- **THEN** validation reports a banned-phrase violation naming "fondo blanco"

### Requirement: Copy uses well-formed placeholders and gender variants

Copy SHALL only use the placeholders `{player}` and, in `couple` categories, `{partner}`. A gender variant SHALL be written `{masculine|feminine|neutral}` with exactly three non-empty options.

#### Scenario: Two-option variant

- **WHEN** a headline contains `{tímido|tímida}`
- **THEN** validation reports a malformed-variant violation

#### Scenario: Unknown placeholder

- **WHEN** a body contains `{jugador}`
- **THEN** validation reports an unknown-placeholder violation

#### Scenario: Partner placeholder in friends mode

- **WHEN** a card in a `friends` category uses `{partner}`
- **THEN** validation reports an unknown-placeholder violation

### Requirement: Gender targeting never uses undisclosed

A card's target gender, when set, SHALL be `male` or `female`.

#### Scenario: Undisclosed target

- **WHEN** a card has target gender `undisclosed`
- **THEN** validation reports a target-gender violation
