# Spec Delta

## ADDED Requirements

### Requirement: Setup header

The setup screen SHALL show a back button, the chosen category's name as an eyebrow, and the title "¿Quiénes juegan?". The back button SHALL return to the previous screen, or open the category screen when there is no previous screen.

#### Scenario: Header content

- **WHEN** setup opens for the category "La Previa"
- **THEN** the screen shows "La Previa" above the title "¿Quiénes juegan?" and a "Volver" button

#### Scenario: Back without history

- **WHEN** the user taps "Volver" and there is no previous screen
- **THEN** the category screen opens and the draft keeps its players and options

### Requirement: Changing a player's avatar

Each expanded player row SHALL show the player's avatar as a button labelled "Cambiar avatar de {nombre}" ("Cambiar avatar del jugador N" while the name is blank). Tapping it SHALL give the player the next avatar in brand order that no other player has.

#### Scenario: Next free avatar

- **WHEN** player 1 has avatar 1, player 2 has avatar 2, and the user taps player 1's avatar
- **THEN** player 1 gets avatar 3

### Requirement: Collapsed player rows

The first two player rows SHALL always be expanded. Each row from the third on SHALL show as a one-line summary (avatar, name, gender, "No toma") until the user taps it; tapping a summary SHALL expand that row and collapse any other expanded row from the third on. A newly added row SHALL start expanded.

#### Scenario: Third player collapsed

- **WHEN** setup opens with Ana, Beto, and Caro (Mujer) remembered
- **THEN** Ana and Beto show their name fields and Caro shows as the summary "Caro · Mujer"

#### Scenario: Expand a summary

- **WHEN** the user taps Caro's summary
- **THEN** Caro's name field, gender choice, and "No toma" toggle are shown

#### Scenario: Missing name in a collapsed row

- **WHEN** a collapsed row has a blank name and the user taps the start button
- **THEN** the summary shows "Falta el nombre"

## MODIFIED Requirements

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
- **THEN** the user is sent to Inicio, where the mode is chosen

### Requirement: Editing players

Each expanded player row SHALL offer a name field, a gender choice among "Hombre", "Mujer", and "Prefiero no decir" on one line, and a "No toma" toggle shown in the dark ink style when selected. In Amigos the user SHALL be able to add players up to 12 with "+ Agregar jugador" and remove players down to 2 from expanded and collapsed rows.

#### Scenario: Add and remove in Amigos

- **WHEN** the user taps "+ Agregar jugador" with two players
- **THEN** a third empty row appears expanded, and each row offers a remove control

#### Scenario: Limits

- **WHEN** there are 12 players
- **THEN** "+ Agregar jugador" is not offered; and with 2 players no remove control is offered

#### Scenario: No toma

- **WHEN** the user turns on "No toma" for a player
- **THEN** that player is marked as not drinking and the toggle shows as selected

### Requirement: Missing names block the start

A player without a name SHALL NOT be able to start the game, and the row SHALL say what is missing.

#### Scenario: Blank name

- **WHEN** a row has a blank name and the user taps the start button
- **THEN** the game does not start and that row shows "Falta el nombre"

### Requirement: Turn order

Players SHALL play in the order shown. The ORDEN summary chip ("Barajar") SHALL change the visible order before the game starts.

#### Scenario: Shuffle

- **WHEN** the user taps the ORDEN chip with at least two players
- **THEN** the rows show a different order, which becomes the turn order

### Requirement: Level filter

All three levels SHALL be selected by default with their level colors; the user SHALL be able to deselect levels but never all of them. The NIVELES summary chip SHALL show "Los 3" when all levels are selected, otherwise the selected level names, and tapping it SHALL show or hide the level list.

#### Scenario: Last level stays

- **WHEN** only "Prendido" is selected and the user taps it
- **THEN** it stays selected

#### Scenario: Summary of levels

- **WHEN** the user opens NIVELES and deselects "Suave"
- **THEN** the NIVELES chip shows "Picante y Prendido"

### Requirement: End condition

The default end SHALL be 10 rounds. The user SHALL be able to choose rounds 5, 10, 15, or 20, a points goal of 100, 200, or 300, or an open game. The FIN summary chip SHALL show the chosen end and tapping it SHALL show or hide the list; only one of the FIN and NIVELES lists SHALL be open at a time.

#### Scenario: Choose a points goal

- **WHEN** the user opens FIN, taps "200 puntos", and starts
- **THEN** the FIN chip shows "200 puntos" and the game ends on a 200-point goal

### Requirement: Start the game

A sticky "¡A jugar! · N jugadores" button (N is the number of players shown) SHALL start the game with the shown players (names trimmed), order, levels, and end condition, go to the turn screen, and the players SHALL become the remembered last players.

#### Scenario: Start

- **WHEN** every player has a name and the user taps "¡A jugar! · 3 jugadores"
- **THEN** the game starts, the turn screen opens, and the players are remembered for the next setup
