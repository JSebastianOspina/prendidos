# home-screen Specification

## Purpose
The Inicio screen is the hub every flow returns to: it shows the Prendidos brand and starts a new game with one tap on the mode (Amigos or Pareja).

## Requirements

### Requirement: Brand header

The home screen SHALL show, in one row at the top, the 64 pt Prendidos logo tile (the mascot icon art on the brand red tile) and the red "Prendidos" wordmark as the screen heading.

#### Scenario: Landing on the home

- **WHEN** the age is confirmed and the app opens on the home route
- **THEN** the "Prendidos" heading is visible next to the logo tile
- **AND** the logo tile is decorative and not announced separately by screen readers

### Requirement: Reserved slots stay hidden

The home screen SHALL NOT show "Continuar partida" or "Restaurar compras" until their stories (HU-12, HU-08) add them.

#### Scenario: MVP home

- **WHEN** the home screen renders
- **THEN** neither "Continuar partida" nor "Restaurar compras" is shown

### Requirement: Mode choice on the home

The home screen SHALL ask "¿Con quién va a jugar hoy?" and offer two large mode cards: Amigos (flame accent, subtitle "De 2 a 12 · retos, verdades y “Yo nunca”") and Pareja (pink couple accent, subtitle "Solo ustedes dos · coqueto, no explícito"), each with a decorative illustration that screen readers skip.

#### Scenario: Both modes are offered

- **WHEN** the home screen renders
- **THEN** the "¿Con quién va a jugar hoy?" heading and the Amigos and Pareja cards with their subtitles are visible
- **AND** each card is one button labelled with its title and subtitle

#### Scenario: Choosing a mode

- **WHEN** the user taps "Pareja"
- **THEN** the new-game draft holds the couple mode and the category screen opens

#### Scenario: Previous draft does not leak

- **GIVEN** a previous new-game draft has a mode and category chosen
- **WHEN** the user taps "Amigos"
- **THEN** the draft holds the friends mode and no category, and the remembered players are still preloaded

### Requirement: Moderation footer

The home screen SHALL show the footer "Tome con moderación. Si tomó, no maneje." below the mode cards.

#### Scenario: Footer is visible

- **WHEN** the home screen renders
- **THEN** "Tome con moderación. Si tomó, no maneje." is shown
