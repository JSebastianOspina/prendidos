## ADDED Requirements

### Requirement: Player avatars

Every player SHALL carry one of the 12 avatar ids. A new player SHALL get the first avatar in brand order that no current player has, unless an avatar is given, and the avatar SHALL stay with the player for the whole game.

#### Scenario: New player avatar

- **WHEN** a player is added while players hold avatars 1 and 2
- **THEN** the new player gets avatar 3

#### Scenario: Avatar kept during the game

- **WHEN** a game starts with Vale on avatar 7
- **THEN** every turn and the ranking show Vale with avatar 7
