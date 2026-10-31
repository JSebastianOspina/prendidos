# Spec Delta

## ADDED Requirements

### Requirement: Starting a game

Starting a game from valid settings SHALL create an in-progress session at round 1 with the first player's turn, zero scores, and a first card from the session's category.

#### Scenario: Valid start

- **WHEN** a game starts with mode `friends`, category `la-previa`, three players, all levels, and 5 rounds
- **THEN** the session is `inProgress`, round 1, player index 0, every score is 0, and a La Previa card is current

#### Scenario: Invalid settings

- **WHEN** a `couple` game starts with three players
- **THEN** no game starts and the settings errors are reported

### Requirement: Individual card outcomes

Completing an individual card SHALL add its points to the current player; refusing SHALL subtract half its points rounded up and report the card's penalty. Both pass the turn to the next player in order; scores may go negative.

#### Scenario: Complete

- **WHEN** the current player completes a 7-point card
- **THEN** their score increases by 7 and the next player's turn begins

#### Scenario: Refuse

- **WHEN** the current player with 0 points refuses a 7-point card
- **THEN** their score is −4, the outcome reports the card's drink penalty, and the turn passes

### Requirement: One free swap per player

A player SHALL be able to swap an individual card once per game for a different card at the same level, with no score change and no turn change.

#### Scenario: Second swap rejected

- **WHEN** a player who already swapped tries to swap again
- **THEN** the card and scores do not change

### Requirement: Group card interludes

Group cards SHALL be about 20 % of the cards shown, never twice in a row, award no points, and not consume a turn.

#### Scenario: Interlude keeps the turn

- **WHEN** a group card is shown during player 2's turn and the group continues
- **THEN** the next card is still player 2's turn

### Requirement: Card selection order

Cards SHALL not repeat within a game; cards never seen on the device come first; within a level individual cards come out from fewer to more points; an exhausted level pool resets.

#### Scenario: Unseen first

- **WHEN** a level has a seen 2-point card and an unseen 5-point card
- **THEN** the unseen 5-point card comes out first

#### Scenario: Pool reset

- **WHEN** every individual card of the current level was already played
- **THEN** the level's cards become available again

### Requirement: Gender-targeted cards

A card with a target gender SHALL only come out when another player of that gender exists, and that player fills `{player}`; players marked undisclosed are never picked.

#### Scenario: No eligible target

- **WHEN** a card targets `female` and the only woman is the current player
- **THEN** the card is skipped

### Requirement: Escalation

Levels SHALL escalate with progress over the selected levels in order: thirds of the rounds, thirds of the points goal, or one level every 5 rounds in open games.

#### Scenario: No step back

- **WHEN** a points-goal game is at Picante and the leader's refusal drops the best score below the Picante third
- **THEN** the level stays Picante

#### Scenario: Ten rounds

- **WHEN** a 10-round game with all levels is in round 5
- **THEN** the current level is medium

### Requirement: Card copy

Card text SHALL be rendered through `renderGenderedText` with the current player's gender; group cards render neutral without placeholders; `{partner}` is the other player in couple mode.

#### Scenario: Undisclosed player

- **WHEN** the current player chose "Prefiero no decir"
- **THEN** the card shows the neutral variant

### Requirement: End conditions and ranking

Games by rounds SHALL end after the last round, by points when the round in which someone reached the goal completes, and open games only when ended; any game can be ended early. The ranking orders by score and tied players share a position.

#### Scenario: Points goal finishes the round

- **WHEN** player 1 reaches 100 points in a 3-player game with a 100 goal
- **THEN** players 2 and 3 still play their turns and then the game finishes

#### Scenario: Tie

- **WHEN** scores are 30, 30, 10
- **THEN** positions are 1, 1, 3

### Requirement: Stale actions are ignored

An action SHALL apply only to the card it was made on; a repeated tap after the card changed SHALL not change the game.

#### Scenario: Double tap

- **WHEN** player A taps "Cumplió" twice on the same card
- **THEN** only A's card is scored and player B's new card is untouched
