# turn-screen Specification

## Purpose
Presents each game turn so a group across a table can read the card, its level, points and penalty in one glance, answer it in at most two taps, and reach the ranking when the game ends.

## Requirements

### Requirement: Turn header shows player, round, level and score

The turn screen SHALL show a top bar with a pause button, the round (with the total in games that end by rounds, the goal in games that end by points), and a progress bar with one segment per level in play, filled in its level color up to the game's progress. The player's avatar, "Le toca a" and name SHALL show inside the individual card. The screen SHALL NOT show an inline scoreboard.

#### Scenario: Individual turn header

- **WHEN** an individual card is on screen for Ana in round 1 of a 5-round game at Suave
- **THEN** the screen shows a pause button, "Ronda 1 de 5", and, inside the card, Ana's avatar, "Le toca a" and "Ana", and no player scores

#### Scenario: Open or points game

- **WHEN** the end condition is not a number of rounds
- **THEN** the round shows without a total: "Ronda 3 · Meta 200 pts" in a 200-point game, with the progress following the best score, and "Ronda 7" in an open game, with the progress bar filled up to the current level

### Requirement: Individual card face

An individual card SHALL be filled with its level color and show chips for its type (Reto as an action to do, Verdad as a question to answer) and its level, a round points badge, the rendered headline and body, and a white footer strip "Si no cumple · Toma N trago(s) — quip".

#### Scenario: Reto card

- **WHEN** a challenge worth 5 points with a 1-drink penalty and the quip "por floja" is shown to Ana
- **THEN** the card shows "Reto", the Suave level, "5 pts", the rendered headline and body, "Si no cumple" and "Toma 1 trago — por floja"

#### Scenario: Verdad card

- **WHEN** a truth card is shown
- **THEN** the card shows "Verdad" and the prompt to answer instead of the Reto tag

#### Scenario: Player who does not drink

- **WHEN** the current player does not drink
- **THEN** the footer shows the card's drink penalty until alternative penalties exist (HU-11)

### Requirement: Consent and outside-contact notes
A card flagged as requiring consent SHALL show "Solo si la otra persona acepta"; a card flagged as reaching outside the room SHALL show the outside-contact reminder.

#### Scenario: Flagged card
- **WHEN** the card requires consent and reaches outside
- **THEN** both notes are visible on the card

#### Scenario: Unflagged card
- **WHEN** the card has neither flag
- **THEN** neither note is shown

### Requirement: Completing a card

The complete action SHALL read "¡Cumplió!" with the points it adds ("+N pts"); pressing it SHALL complete the card through the game and show the next turn.

#### Scenario: Cumplió

- **WHEN** Ana presses "¡Cumplió! +5 pts" on a 5-point card
- **THEN** the next player's turn is on screen and Ana has 5 points in the game

### Requirement: Refusing a card shows the penalty first

The refuse action SHALL read "No cumplió" with the points it takes away ("−N pts", half the card's points rounded up); pressing it SHALL refuse the card through the game and show the refusing player's penalty (name, drinks with quip, points lost) in an overlay that waits for a tap; dismissing it with "Siguiente" reveals the next turn.

#### Scenario: No cumplió

- **WHEN** Ana presses "No cumplió −3 pts" on a 5-point card with a 1-drink penalty
- **THEN** an overlay shows "Ana no cumplió", "Toma 1 trago — por floja" and "−3 pts", and after "Siguiente" the next player's turn is on screen

#### Scenario: Refusal ends the game

- **WHEN** the last turn of the game is refused
- **THEN** the penalty overlay shows first, and the ranking opens only after it is dismissed

### Requirement: One free swap per player

The top bar SHALL show "Cambiar (1)" while the current player has not used their swap; pressing it SHALL replace the card without penalty. Afterwards it SHALL read "Cambiar (0)", be announced as "Ya cambió su carta", and be disabled for that player.

#### Scenario: Swap used

- **WHEN** Ana presses "Cambiar (1)"
- **THEN** a different card is shown and the swap button reads "Cambiar (0)" and is disabled

### Requirement: Group interlude

A group card ("Yo nunca", "Todos los que…") SHALL show a header "Ronda X de Y · Interludio" with the level chip, and a yellow card with a "¡Todos!" chip, the headline, the body and a white rule box saying who drinks and that it does not count for the ranking. It SHALL have no points, no swap and no turn actions, only "Seguir: le toca a {nombre}" with the due player's avatar, which continues with that player's turn.

#### Scenario: Group card

- **WHEN** a "Yo nunca" card is on screen and Ana is due
- **THEN** the screen shows "Interludio", "¡Todos!", the card text, the rule box, and only "Seguir: le toca a Ana", and pressing it shows Ana's turn

### Requirement: Ending the game

The pause button SHALL open a Pause dialog with the round label, "Pausa", "Seguir jugando" and "Terminar y ver ranking". "Seguir jugando" SHALL close the dialog and keep the same card; "Terminar y ver ranking" SHALL end the game and open the ranking. When the game finishes by its end condition the ranking SHALL open automatically.

#### Scenario: Confirmed end

- **WHEN** the user opens Pause and presses "Terminar y ver ranking"
- **THEN** the game ends and the ranking route replaces the turn screen

#### Scenario: Cancelled end

- **WHEN** the user opens Pause and presses "Seguir jugando"
- **THEN** the same card stays on screen

#### Scenario: Last turn completed

- **WHEN** the last turn of the game is completed
- **THEN** the ranking route replaces the turn screen

### Requirement: No game in progress
Opening the turn screen without a game SHALL send the user to home.

#### Scenario: Opened directly
- **WHEN** the turn screen opens and there is no session
- **THEN** the home route replaces it

### Requirement: Level up

When the level of the individual card on screen goes up during a game, the turn screen SHALL show a full-screen level-up overlay once, without motion, with the round, the new level's mascot face, a title, the new level's points range, the level scale, the moderation reminder, and "Que siga la fiesta", which closes it. It SHALL NOT show at game start, over a group card, or before a pending refusal penalty is dismissed.

#### Scenario: Level goes up

- **WHEN** Ana completes the last Suave card and Beto's next card is Picante
- **THEN** the level-up overlay shows "Subimos a nivel Picante: cartas de 11 a 20 puntos." and, after "Que siga la fiesta", Beto's Picante card is on screen

#### Scenario: Game start

- **WHEN** a game starts at Picante
- **THEN** no level-up overlay shows

#### Scenario: Group card in between

- **WHEN** a group card at a higher level comes before the next individual card
- **THEN** the overlay does not show over the group card and shows when that individual card appears
