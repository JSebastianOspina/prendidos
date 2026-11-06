# Spec Delta

## ADDED Requirements

### Requirement: Illustration keys come from the library

A card's optional `illustration` SHALL be one of the card illustration library keys. Any other text SHALL be an `error` with the rule `unknownIllustration` that names the key. A blank `illustration` stays a `missingField` error, and an unset or `null` one is valid.

#### Scenario: Unknown key

- **WHEN** a card sets `"illustration": "police-cap"`
- **THEN** validation reports an `unknownIllustration` error for that card naming `police-cap`

#### Scenario: Library key

- **WHEN** a card sets `"illustration": "mascot-monocle"`
- **THEN** the illustration produces no violation

#### Scenario: Blank key

- **WHEN** a card sets `"illustration": "  "`
- **THEN** validation reports a `missingField` error for `illustration`

#### Scenario: No illustration

- **WHEN** a card has no `illustration` or sets it to `null`
- **THEN** the illustration produces no violation
