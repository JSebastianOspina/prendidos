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

### Requirement: Remembered avatars

The device state SHALL keep each remembered player's avatar and each saved-game player's avatar. A saved player without a valid avatar SHALL get the first avatar no other player in the same list has, instead of being dropped.

#### Scenario: Older save without avatars

- **WHEN** the stored last players are Ana and Beto with no avatar
- **THEN** they are read back with avatars 1 and 2

#### Scenario: Avatar survives a restart

- **WHEN** Vale was remembered with avatar 7 and the app is reopened
- **THEN** Vale is read back with avatar 7
