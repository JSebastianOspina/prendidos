# final-ranking Specification

## Purpose

The end-of-game screen: it names the winner, lists every player's final score, and lets the group replay or go home without the finished game being resumable.

## Requirements

### Requirement: Winner and full ranking

When a game has finished, the screen SHALL name the winner in a header ("¡Ganó {nombre}!") next to the crowned winking mascot, show the first three players of the ranking on a podium (avatar, name, position, and score; the sole winner's avatar is the largest and crowned), and list every other player below it as a row with position, avatar, name, and score, highest first. Steps take `primary` for position 1, `surfaceSoft` for 2, and `surface` for 3.

#### Scenario: Single winner

- **WHEN** the game finished with Ana 12, Beto 7, Cami 3, Dani 1
- **THEN** the header reads "¡Ganó Ana!"
- **AND** the podium shows Ana on step 1 with "12 pts", Beto on step 2, and Cami on step 3
- **AND** a row below shows position 4, Dani's avatar, "Dani", and "1 pt"

#### Scenario: Two players

- **WHEN** the game finished with Ana 12 and Beto 7
- **THEN** the podium shows two steps, Ana on step 1 and Beto on step 2, and no rows

### Requirement: Ties look tied

Players with the same final score SHALL share one position number. On the podium, tied players SHALL stand on steps of the same height, color, and number. A tie for first SHALL replace the winner title with "¡Empate arriba!" and a line naming the co-winners in Spanish ("Ana y Luis comparten el primer puesto.").

#### Scenario: Tie for first

- **WHEN** Ana and Luis both finish with 10 points and Beto with 4
- **THEN** the header reads "¡Empate arriba!" and "Ana y Luis comparten el primer puesto."
- **AND** Ana and Luis both stand on a step numbered 1 and Beto on a step numbered 3

### Requirement: Negative scores

A negative final score SHALL be shown with its minus sign, in the negative color wherever the background allows it (rows and the white or soft podium steps).

#### Scenario: Player below zero

- **WHEN** a player in the rows finishes with -3 points
- **THEN** their score reads "-3 pts" in the negative color

### Requirement: Play again

"Otra partida" SHALL open the game setup with the same players, mode, category, levels, end condition and Sin Filtro choice already filled in, and the finished game SHALL be forgotten.

#### Scenario: Replay

- **WHEN** the user taps "Otra partida"
- **THEN** the setup screen opens with the finished game's settings in the new-game draft
- **AND** no finished game remains in memory

### Requirement: Back home

"Inicio" SHALL return to the home screen and forget the finished game. It sits beside "Otra partida", which is the wider, primary action.

#### Scenario: Home

- **WHEN** the user taps "Inicio"
- **THEN** the home screen is shown and no game is in memory

### Requirement: No finished game to show

Without a finished game (already cleared, opened by link, or a game still in progress) the screen SHALL send the user home instead of showing an empty ranking.

#### Scenario: Opened with no game

- **WHEN** the ranking route opens and there is no finished game
- **THEN** the user is redirected to the home screen without an error

### Requirement: Finished game is not resumable

Once the ranking is shown, the finished game SHALL NOT be offered for resumption on the next launch.

#### Scenario: Reopen after ranking

- **WHEN** the ranking was shown and the app is reopened
- **THEN** the device holds no active session

### Requirement: Reserved upsell slot

The layout SHALL keep a slot between the ranking and the actions for a future upsell (HU-09) that shows nothing for now.

#### Scenario: Slot hidden

- **WHEN** the ranking is shown
- **THEN** no upsell content is visible

### Requirement: Game summary eyebrow

Above the title the screen SHALL show the category name and the game length: "{Categoría} · {N} rondas" ("1 ronda") with the rounds played (rounds in which at least one player took a turn) for round-limited and open games, and "{Categoría} · Meta {meta} pts" for points games.

#### Scenario: Rounds game

- **WHEN** a La Previa game of 10 rounds finished
- **THEN** the eyebrow reads "La Previa · 10 rondas"

#### Scenario: Points game

- **WHEN** a La Previa game with a 100-point target finished
- **THEN** the eyebrow reads "La Previa · Meta 100 pts"

#### Scenario: Open game

- **WHEN** an open two-player La Previa game was ended right after both players took their first turn
- **THEN** the eyebrow reads "La Previa · 1 ronda"

### Requirement: Long names stay readable

Player names on the podium and in the rows SHALL be truncated to one line with an ellipsis instead of breaking the layout, and every podium step and row SHALL expose the full name, position, and score to screen readers.

#### Scenario: Twenty-character-limit name

- **WHEN** the winner is named "Maximiliano Andrés"
- **THEN** the podium shows the name on one line
- **AND** the podium entry is announced as "Puesto 1: Maximiliano Andrés, 12 puntos"
