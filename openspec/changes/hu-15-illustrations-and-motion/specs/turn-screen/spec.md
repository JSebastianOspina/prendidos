# Spec Delta

## ADDED Requirements

### Requirement: Card illustration slot

A card with an illustration key SHALL show that illustration centered below its text and notes, at most 120 pt tall: above the penalty footer on individual cards and above the rule box on group cards. A card without a key SHALL show no illustration. The mascot SHALL appear on the game card only in this slot.

#### Scenario: Illustrated challenge with room

- **WHEN** Ana's challenge has the `mascot-monocle` key and the card has room
- **THEN** the monocle cat is shown centered below the card text, above "Si no cumple"

#### Scenario: Illustrated group card

- **WHEN** a "Yo nunca" card with the `glasses-toasting` key is on screen and has room
- **THEN** the toasting glasses are shown below the card text, above the rule box

#### Scenario: Card without a key

- **WHEN** the card on screen has no illustration key
- **THEN** the card shows no illustration

### Requirement: Text wins over the illustration

When the card text, notes, and illustration do not all fit the visible card area without scrolling, the card SHALL render text-only. The text SHALL never shrink, truncate, or move down to make room, and the turn actions SHALL never move. The fit SHALL be checked again when the card, the window size, or the font size changes.

#### Scenario: Long card on a small phone

- **WHEN** an illustrated card with a long body is shown on a 375 × 667 pt screen
- **THEN** the card shows only its text and the "¡Cumplió!" and "No cumplió" buttons stay at the bottom where they always are

#### Scenario: Largest text size

- **WHEN** the system font size is the largest and an illustrated card does not fit with its illustration
- **THEN** the card renders text-only at full text size

#### Scenario: First frame

- **WHEN** an illustrated card first appears
- **THEN** its text is laid out in its final position and the illustration only appears below it once it is known to fit

### Requirement: New card entrance

Each new card on the turn screen (individual, group, or swapped) SHALL enter with a spring with a small overshoot that settles within 450 ms, or with the Reduce Motion fade. The turn actions SHALL not animate with the card.

#### Scenario: Next turn

- **WHEN** Ana completes her card and Beto's card appears
- **THEN** Beto's card springs in and settles within 450 ms while the turn buttons stay still

#### Scenario: Swapped card

- **WHEN** Ana presses "Cambiar (1)"
- **THEN** the replacement card enters with the same spring

## MODIFIED Requirements

### Requirement: Level up

When the level of the individual card on screen goes up during a game, the turn screen SHALL show a full-screen level-up overlay once, with the round, the new level's mascot face, a title, the new level's points range, the level scale, the moderation reminder, and "Que siga la fiesta", which closes it. The mascot tile SHALL grow from small to full size with an overshoot in about 600 ms, or fade in under Reduce Motion; nothing else on the overlay animates. It SHALL NOT show at game start, over a group card, or before a pending refusal penalty is dismissed.

#### Scenario: Level goes up

- **WHEN** Ana completes the last Suave card and Beto's next card is Picante
- **THEN** the level-up overlay shows "Subimos a nivel Picante: cartas de 11 a 20 puntos." and, after "Que siga la fiesta", Beto's Picante card is on screen

#### Scenario: Mascot grows

- **WHEN** the level-up overlay opens with Reduce Motion off
- **THEN** the mascot tile grows from small to full size with an overshoot in about 600 ms and the rest of the overlay is static

#### Scenario: Mascot with Reduce Motion

- **WHEN** the level-up overlay opens with Reduce Motion on
- **THEN** the mascot tile fades in over 200 ms at full size

#### Scenario: Game start

- **WHEN** a game starts at Picante
- **THEN** no level-up overlay shows

#### Scenario: Group card in between

- **WHEN** a group card at a higher level comes before the next individual card
- **THEN** the overlay does not show over the group card and shows when that individual card appears
