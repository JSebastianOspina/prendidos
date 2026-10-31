# home-screen Specification

## Purpose
The Inicio screen is the hub every flow returns to: it shows the Prendidos brand and gets the group into a new game in one tap.

## Requirements

### Requirement: Brand header

The home screen SHALL show the Prendidos logo tile, the "Prendidos" wordmark as the screen heading, and a one-line Colombian Spanish tagline that says what the game is.

#### Scenario: Landing on the home

- **WHEN** the age is confirmed and the app opens on the home route
- **THEN** the "Prendidos" heading and the tagline are visible
- **AND** the logo tile is decorative and not announced separately by screen readers

### Requirement: Start a new game

The home screen SHALL offer a primary "Nueva partida" button in the lower half of the screen that clears any previous new-game choices and opens mode selection.

#### Scenario: Tapping "Nueva partida"

- **WHEN** the user taps "Nueva partida"
- **THEN** the mode selection screen opens

#### Scenario: Previous draft does not leak

- **GIVEN** a previous new-game draft has a mode and category chosen
- **WHEN** the user taps "Nueva partida"
- **THEN** the draft has no mode and no category, and the remembered players are still preloaded

### Requirement: Reserved slots stay hidden

The home screen SHALL NOT show "Continuar partida" or "Restaurar compras" until their stories (HU-12, HU-08) add them.

#### Scenario: MVP home

- **WHEN** the home screen renders
- **THEN** neither "Continuar partida" nor "Restaurar compras" is shown
