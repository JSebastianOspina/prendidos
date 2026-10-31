# Spec Delta

## ADDED Requirements

### Requirement: Device state survives restarts

The app SHALL remember the 18+ confirmation, last players, seen cards, last Sin Filtro choice, and the game in progress across launches, offline, and nothing about finished games.

#### Scenario: Restart

- **WHEN** the age gate was confirmed and the app is reopened
- **THEN** `ageConfirmedAt` is still set

#### Scenario: Corrupt data

- **WHEN** the stored value is not valid JSON
- **THEN** the app starts from the empty device state

#### Scenario: Finished game

- **WHEN** a finished game is cleared
- **THEN** no session remains stored
