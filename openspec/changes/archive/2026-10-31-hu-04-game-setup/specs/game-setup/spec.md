# Spec Delta

## Purpose

The game setup screen collects the players, their turn order, the selected levels, and the end condition, then starts the game with sensible defaults so a returning group can start with one tap.

## ADDED Requirements

### Requirement: Preloaded players

The setup screen SHALL open with the players remembered from the last game (name, gender, "No toma"). When fewer than two players are remembered it SHALL show empty rows up to two. In couple mode it SHALL show exactly the first two players.

#### Scenario: Returning group

- **WHEN** the last game had Ana and Beto and the user opens setup in Amigos
- **THEN** two rows show "Ana" and "Beto" with their gender and "No toma" choices

#### Scenario: First use

- **WHEN** no players are remembered
- **THEN** two empty player rows are shown

#### Scenario: Couple mode with more remembered players

- **WHEN** three players are remembered and the mode is Pareja
- **THEN** only the first two are shown and no add or remove control is visible

#### Scenario: Missing mode or category

- **WHEN** setup opens without a chosen mode or category
- **THEN** the user is sent to the mode screen

### Requirement: Editing players

Each player row SHALL offer a name field, a gender choice among "Hombre", "Mujer", and "Prefiero no decir", and a "No toma" toggle shown in the dark ink style when selected. In Amigos the user SHALL be able to add players up to 12 and remove players down to 2.

#### Scenario: Add and remove in Amigos

- **WHEN** the user taps "Agregar jugador" with two players
- **THEN** a third empty row appears, and each row offers a remove control

#### Scenario: Limits

- **WHEN** there are 12 players
- **THEN** "Agregar jugador" is not offered; and with 2 players no remove control is offered

#### Scenario: No toma

- **WHEN** the user turns on "No toma" for a player
- **THEN** that player is marked as not drinking and the toggle shows as selected

### Requirement: Missing names block the start

A player without a name SHALL NOT be able to start the game, and the row SHALL say what is missing.

#### Scenario: Blank name

- **WHEN** a row has a blank name and the user taps "Empezar"
- **THEN** the game does not start and that row shows "Falta el nombre"

### Requirement: Turn order

Players SHALL play in the order shown. "Barajar" SHALL change the visible order before the game starts.

#### Scenario: Shuffle

- **WHEN** the user taps "Barajar" with at least two players
- **THEN** the rows show a different order, which becomes the turn order

### Requirement: Level filter

All three levels SHALL be selected by default with their level colors; the user SHALL be able to deselect levels but never all of them.

#### Scenario: Last level stays

- **WHEN** only "Prendido" is selected and the user taps it
- **THEN** it stays selected

### Requirement: End condition

The default end SHALL be 10 rounds. The user SHALL be able to choose rounds 5, 10, 15, or 20, a points goal of 100, 200, or 300, or an open game.

#### Scenario: Choose a points goal

- **WHEN** the user taps "200 puntos" and starts
- **THEN** the game ends on a 200-point goal

### Requirement: Start the game

A sticky "Empezar" button SHALL start the game with the shown players (names trimmed), order, levels, and end condition, go to the turn screen, and the players SHALL become the remembered last players.

#### Scenario: Start

- **WHEN** every player has a name and the user taps "Empezar"
- **THEN** the game starts, the turn screen opens, and the players are remembered for the next setup

### Requirement: Sin Filtro slot

The layout SHALL reserve a place under the options for the Sin Filtro switch in Amigos mode only, rendering nothing until HU-10.

#### Scenario: Hidden slot

- **WHEN** setup is shown in either mode
- **THEN** no Sin Filtro control is visible
