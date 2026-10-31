# Spec Delta

## MODIFIED Requirements

### Requirement: Prendidos screen flow

The app SHALL open into 18+ → Inicio (modo) → Categoría → Setup → Turno → Ranking, every screen but the 18+ gate SHALL stay unreachable until the age is confirmed, and no Expo template screens remain. Each screen's behavior is specified by its own capability (`age-gate`, `home-screen`, `category-picker`, `game-setup`, `turn-screen`, `final-ranking`).

#### Scenario: First launch

- **WHEN** the app opens and the age gate was never confirmed
- **THEN** the 18+ screen is shown

#### Scenario: Protected screens

- **WHEN** the age gate was never confirmed and another screen is requested
- **THEN** the 18+ screen is shown instead

#### Scenario: Old mode route

- **WHEN** the age is confirmed and the former mode route `/new-game/mode` is opened
- **THEN** the user is redirected to Inicio, where the mode is chosen
