# Spec Delta

## Purpose

Defines the volume, mix, and review gate of the card catalog bundled at launch, so every category and level has enough fresh cards for a full night of play.

## ADDED Requirements

### Requirement: Enough cards per category, heat, and level

The bundled catalog SHALL hold at least 30 cards per level (easy, medium, hard) for La Previa `standard`, La Previa `spicy`, and Entre Dos `standard`.

#### Scenario: Counting the launch catalog

- **WHEN** the shipped catalog is grouped by category, heat, and difficulty
- **THEN** each of the nine groups (La Previa standard, La Previa spicy, Entre Dos standard × three levels) has 30 cards or more

### Requirement: Type mix per level

New cards for a category and level SHALL be roughly 60 % challenges, 20 % truths, and 20 % group cards (`everyoneWho` / `neverHaveIEver`).

#### Scenario: Mix of a new batch

- **WHEN** the cards added for one category, heat, and level are counted by type
- **THEN** challenges are 50–70 %, truths 15–25 %, and group cards 15–25 % of them

### Requirement: Sin Filtro cards only in friends categories and hidden by default

Cards with `heat: "spicy"` SHALL belong only to friends-mode categories and SHALL NOT be dealt unless the game enables spicy content.

#### Scenario: Couple catalog

- **WHEN** the Entre Dos cards are inspected
- **THEN** every card has `heat: "standard"`

#### Scenario: Spicy switch off

- **WHEN** a La Previa game starts without spicy content enabled
- **THEN** no `spicy` card is dealt

### Requirement: Gender-targeted cards stay a minority

Cards with `targetGender` SHALL be at most 10 % of each category and heat, and SHALL target only `male` or `female`, never players who chose "Prefiero no decir".

#### Scenario: Targeted share

- **WHEN** the cards of one category and heat are counted
- **THEN** cards with `targetGender` are 10 % or fewer, and none targets `undisclosed`

### Requirement: Every shipped card passes validation and awaits human review

Every bundled card SHALL pass `validateCards` with no errors, and the content folder SHALL record the human-review status of each batch, with reviewer and date filled only by the human who reviewed it.

#### Scenario: Validation of the shipped JSON

- **WHEN** the content validator runs over the merged shipped catalog
- **THEN** it reports no errors, and any warning is justified in the review note

#### Scenario: Review not yet done

- **WHEN** no human has reviewed a batch
- **THEN** its review note says "pending human review" and leaves reviewer and date blank
