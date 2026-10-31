# app-shell Specification

## Purpose
TBD - created by archiving change hu-00-game-foundation. Update Purpose after archive.

## Requirements

### Requirement: Prendidos screen flow

The app SHALL open into 18+ → Inicio → Modo → Categoría → Setup → Turno → Ranking, with one placeholder per screen that shows its name, and no Expo template screens.

#### Scenario: First launch

- **WHEN** the app opens and the age gate was never confirmed
- **THEN** the 18+ placeholder is shown

#### Scenario: Placeholder

- **WHEN** a screen story has not replaced its placeholder yet
- **THEN** the screen shows its name and a button to the next screen

### Requirement: Shipped content is valid

Every bundled card SHALL pass the content validator with no errors, and La Previa SHALL hold enough standard, non-targeted individual cards for a 10-round game with 6 players plus their 6 swaps without a pool reset.

#### Scenario: Validator over the bundle

- **WHEN** the bundled catalog is validated
- **THEN** there are no errors
