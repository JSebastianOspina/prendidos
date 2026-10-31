# device-state Specification

## Purpose
What the phone remembers between launches, offline, and how a malformed saved game is handled.

## Requirements

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

#### Scenario: Malformed saved game

- **WHEN** the saved game is missing fields or points to a card that no longer ships
- **THEN** the app starts without a game in progress instead of failing
