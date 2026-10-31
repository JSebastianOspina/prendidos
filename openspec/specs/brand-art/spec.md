# brand-art Specification

## Purpose
Defines the Prendidos mascot and player avatar art that screens can show, how avatars are handed out without repeats, and the app icon and splash identity.

## Requirements

### Requirement: Mascot art

The app SHALL bundle the mascot art named `wink`, `laugh`, `relaxed`, `smirk`, `pointing` and `icon`. Each art SHALL render with a transparent background at the requested size without distortion, and with a Spanish accessibility label that describes the mascot. Each level SHALL map to one mascot face: Suave to `relaxed`, Picante to `smirk`, Prendido to `laugh`.

#### Scenario: Showing a mascot art

- **WHEN** a screen shows the `wink` mascot at 48 pt
- **THEN** a 48 pt image of the winking cat is shown with an accessibility label in Spanish

#### Scenario: Mascot for a level

- **WHEN** a screen asks for the mascot of the Prendido level
- **THEN** the `laugh` face is shown

### Requirement: Player avatars

The app SHALL bundle 12 player avatars with stable ids, in the brand order (`docs/brand/README.md` § Player Avatars). An avatar SHALL be shown inside a square frame with a surface background, an outline, and padding, never cropped to a circle, and with the player's name in its accessibility label when one is given.

#### Scenario: Avatar frame

- **WHEN** a screen shows avatar 7 (sombrero vueltiao) at 56 pt for "Vale"
- **THEN** the whole hat is visible inside a 56 pt square frame and the accessibility label names Vale

### Requirement: Avatar assignment without repeats

Picking an avatar for a new player SHALL return an avatar that no current player has while one is free. Changing a player's avatar SHALL move to the next avatar in brand order that no other player has, wrapping around. Once all 12 are taken, picking SHALL return the first avatar in brand order.

#### Scenario: First free avatar

- **WHEN** avatars 1 and 2 are taken and a player is added
- **THEN** the new player gets an avatar other than 1 and 2

#### Scenario: Changing an avatar skips taken ones

- **WHEN** a player with avatar 3 changes avatar while avatar 4 is taken by another player
- **THEN** the player gets avatar 5

#### Scenario: All avatars taken

- **WHEN** 12 avatars are taken and a player is added
- **THEN** the player gets avatar 1

### Requirement: App icon and splash identity

The app icon, the Android adaptive icon, the splash screen and the web favicon SHALL show the Prendidos cat on the brand red (`#C01E1B`) instead of the Expo template art. On Android the cat SHALL sit inside the adaptive icon safe zone.

#### Scenario: Native build

- **WHEN** a new native build is installed
- **THEN** the home screen icon and the launch splash show the Prendidos cat on brand red
