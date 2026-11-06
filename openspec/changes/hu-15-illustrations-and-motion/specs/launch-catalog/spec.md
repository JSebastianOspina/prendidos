# Spec Delta

## ADDED Requirements

### Requirement: Every illustration key is used

Each key of the card illustration library SHALL be set on at least one card of the shipped catalog. A key with no fitting card SHALL get a new card written with the `write-cards` skill that passes the launch content review.

#### Scenario: Counting keys in the shipped catalog

- **WHEN** the shipped cards are grouped by `illustration`
- **THEN** every library key appears at least once

### Requirement: Every level has illustrated cards

Each level (easy, medium, hard) of each launch category (La Previa, Entre Dos) SHALL hold illustrated cards, so every stage of a game shows illustrations.

#### Scenario: Illustrations per category and level

- **WHEN** the shipped cards are grouped by category and difficulty
- **THEN** each of the six groups has at least one card with an `illustration`

### Requirement: Recurring formats share one illustration

Every card of a named recurring format SHALL carry that format's key in every category: "Cultura time" → `mascot-monocle`, "Historytime" → `mascot-reading-book`, "Momento sad" → `mascot-sad-map-pin`. Generic group headlines ("Todos los que…", "¡Todos!", "¡Confiesen!") are not formats. Drink props SHALL only illustrate group toasts or cards whose instruction is a shared drink.

#### Scenario: Cultura time

- **WHEN** La Previa and Entre Dos each hold a card with the headline "Cultura time"
- **THEN** both have the `mascot-monocle` illustration

#### Scenario: Drink prop on a speed-drinking card

- **WHEN** a card about drinking fast or a lot is tagged `shot-glass-on-fire`
- **THEN** the content review rejects the tag
