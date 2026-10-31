# Spec Delta

## Purpose

Lets players choose the game mode (Amigos or Pareja) and then a category of that mode, so the setup and the cards match who is playing.

## ADDED Requirements

### Requirement: Mode choice

The mode screen SHALL show two large options, Amigos (2 to 12 players, flame accent) and Pareja (exactly 2 players, pink couple accent), each with its player range and a one-line tone description in Colombian Spanish.

#### Scenario: Both modes are offered

- **WHEN** the user opens the mode screen
- **THEN** "Amigos" shows "De 2 a 12 jugadores" and its tone line, and "Pareja" shows "Solo 2 jugadores" and its tone line

#### Scenario: Choosing a mode

- **WHEN** the user taps "Pareja"
- **THEN** the new-game draft holds the couple mode and the category screen opens

### Requirement: Category list per mode

The category screen SHALL list only the categories of the mode in the draft, each as a large card with the name and the description taken from the content catalog.

#### Scenario: Friends categories

- **WHEN** the draft mode is Amigos
- **THEN** "La Previa" and its description are shown and "Entre Dos" is not

#### Scenario: Category without a description

- **WHEN** a category has no description
- **THEN** its card shows only the name

#### Scenario: Mode without categories

- **WHEN** the chosen mode has no categories
- **THEN** the screen says there are no categories yet and offers the way back

### Requirement: Category choice opens the setup

Choosing a category SHALL store it in the new-game draft and open the setup screen, with no game data in the route.

#### Scenario: Choosing a category

- **WHEN** the user taps "Entre Dos" in Pareja
- **THEN** the draft holds mode couple and category `entre-dos` and the setup screen opens

### Requirement: Category screen needs a mode

The category screen SHALL send the user to the mode screen when the draft has no mode.

#### Scenario: Opened without a mode

- **WHEN** the category screen opens and the draft has no mode
- **THEN** the user is redirected to the mode screen

### Requirement: Back navigation

Each screen SHALL offer a back control: from the category list to the mode screen, and from the mode screen to home.

#### Scenario: Back from the category list

- **WHEN** the user taps "Volver" on the category screen
- **THEN** the app returns to the previous screen, or to the mode screen when there is no history

#### Scenario: Back from the mode screen

- **WHEN** the user taps "Volver" on the mode screen
- **THEN** the app returns to the previous screen, or to home when there is no history

### Requirement: Lock badge slot

Category cards SHALL reserve a corner for a lock badge on paid content, shown only when one is provided; at launch no badge is shown.

#### Scenario: Launch categories

- **WHEN** the category list is shown at launch
- **THEN** no lock badge is visible
