# turn-screen Specification

## Purpose
Presents each game turn so a group across a table can read the card, its level, points and penalty in one glance, answer it in at most two taps, and reach the ranking when the game ends.

## Requirements

### Requirement: Turn header shows player, round, level and score
The turn screen SHALL show the current player's name in large type, the current round (with the total when the game ends by rounds), the current level, the current player's score, and a compact scoreboard of every player.

#### Scenario: Individual turn header
- **WHEN** an individual card is on screen for Ana in round 1 of a 5-round game at Suave
- **THEN** the screen shows "Le toca a", "Ana", "Ronda 1 de 5", the Suave level, and each player's score

#### Scenario: Open or points game
- **WHEN** the end condition is not a number of rounds
- **THEN** the round shows without a total ("Ronda 3")

### Requirement: Individual card face
An individual card SHALL show its type (Reto as an action to do, Verdad as a question to answer, visually distinct), its level color, a points badge, the rendered headline and body, and a penalty row "Si no cumple · Toma N trago(s) — quip".

#### Scenario: Reto card
- **WHEN** a challenge worth 5 points with a 1-drink penalty and the quip "por floja" is shown to Ana
- **THEN** the card shows "Reto", "5 pts", the rendered headline and body, and "Toma 1 trago — por floja"

#### Scenario: Verdad card
- **WHEN** a truth card is shown
- **THEN** the card shows "Verdad" and the prompt to answer instead of the Reto tag

### Requirement: Consent and outside-contact notes
A card flagged as requiring consent SHALL show "Solo si la otra persona acepta"; a card flagged as reaching outside the room SHALL show the outside-contact reminder.

#### Scenario: Flagged card
- **WHEN** the card requires consent and reaches outside
- **THEN** both notes are visible on the card

#### Scenario: Unflagged card
- **WHEN** the card has neither flag
- **THEN** neither note is shown

### Requirement: Completing a card
Pressing "Cumplió" SHALL complete the card through the game and show the next turn.

#### Scenario: Cumplió
- **WHEN** Ana presses "Cumplió" on a 5-point card
- **THEN** Ana's score shows 5 and the next player's turn is on screen

### Requirement: Refusing a card shows the penalty first
Pressing "No cumplió" SHALL refuse the card through the game and show the refusing player's penalty (name, drinks with quip, points lost) in an overlay; dismissing it with "Siguiente" reveals the next turn.

#### Scenario: No cumplió
- **WHEN** Ana presses "No cumplió" on a 5-point card with a 1-drink penalty
- **THEN** an overlay shows "Ana no cumplió", "Toma 1 trago — por floja" and "−3 pts", and after "Siguiente" the next player's turn is on screen

#### Scenario: Refusal ends the game
- **WHEN** the last turn of the game is refused
- **THEN** the penalty overlay shows first, and the ranking opens only after it is dismissed

### Requirement: One free swap per player
"Cambiar carta" SHALL replace the card without penalty while the current player has not used their swap; afterwards it SHALL be visibly unavailable for that player.

#### Scenario: Swap used
- **WHEN** Ana presses "Cambiar carta"
- **THEN** a different card is shown and the action reads "Ya cambió su carta" and is disabled

### Requirement: Group interlude
A group card ("Yo nunca", "Todos los que…") SHALL show as a yellow card addressed to the whole group, with no points, no swap, no turn actions, and a single "Siguiente" that continues with the player who was due.

#### Scenario: Group card
- **WHEN** a "Yo nunca" card is on screen
- **THEN** the screen shows "Para todo el grupo", the card text, and only the "Siguiente" action, and pressing it shows the due player's turn

### Requirement: Ending the game
"Terminar partida" SHALL sit away from the turn actions and ask for confirmation; confirming ends the game and opens the ranking. When the game finishes by its end condition the ranking SHALL open automatically.

#### Scenario: Confirmed end
- **WHEN** the user presses "Terminar partida" and confirms
- **THEN** the game ends and the ranking route replaces the turn screen

#### Scenario: Cancelled end
- **WHEN** the user presses "Terminar partida" and chooses to keep playing
- **THEN** the same card stays on screen

#### Scenario: Last turn completed
- **WHEN** the last turn of the game is completed
- **THEN** the ranking route replaces the turn screen

### Requirement: No game in progress
Opening the turn screen without a game SHALL send the user to home.

#### Scenario: Opened directly
- **WHEN** the turn screen opens and there is no session
- **THEN** the home route replaces it
