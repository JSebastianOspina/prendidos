# app-shell Specification

## Purpose
Defines the Prendidos screen flow, the 18+ gate in front of it, and the rule that only valid content ships.

## Requirements

### Requirement: Prendidos screen flow

The app SHALL open into 18+ → Inicio → Modo → Categoría → Setup → Turno → Ranking, every screen but the 18+ gate SHALL stay unreachable until the age is confirmed, and no Expo template screens remain. Each screen's behavior is specified by its own capability (`age-gate`, `home-screen`, `category-picker`, `game-setup`, `turn-screen`, `final-ranking`).

#### Scenario: First launch

- **WHEN** the app opens and the age gate was never confirmed
- **THEN** the 18+ screen is shown

#### Scenario: Protected screens

- **WHEN** the age gate was never confirmed and another screen is requested
- **THEN** the 18+ screen is shown instead

### Requirement: Shipped content is valid

Every bundled card SHALL pass the content validator with no errors, La Previa SHALL hold enough standard, non-targeted individual cards for a 10-round game with 6 players plus their 6 swaps without a pool reset, every launch block (La Previa standard, La Previa Sin Filtro, Entre Dos) SHALL hold at least 30 cards per level, and gender-targeted cards SHALL be at most 10 % of each category and heat.

#### Scenario: Validator over the bundle

- **WHEN** the bundled catalog is validated
- **THEN** there are no errors
