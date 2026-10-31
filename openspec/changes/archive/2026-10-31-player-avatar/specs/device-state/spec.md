## ADDED Requirements

### Requirement: Remembered avatars

The device state SHALL keep each remembered player's avatar and each saved-game player's avatar. A saved player without a valid avatar SHALL get the first avatar no other player in the same list has, instead of being dropped.

#### Scenario: Older save without avatars

- **WHEN** the stored last players are Ana and Beto with no avatar
- **THEN** they are read back with avatars 1 and 2

#### Scenario: Avatar survives a restart

- **WHEN** Vale was remembered with avatar 7 and the app is reopened
- **THEN** Vale is read back with avatar 7
