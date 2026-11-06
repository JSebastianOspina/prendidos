# Spec Delta

## ADDED Requirements

### Requirement: Card illustration slot

A card SHALL show its illustration centered below its text and notes, sized to the free space left in the visible card area, between 72 and 160 pt tall: at the bottom of individual cards and above the rule box on group cards. A card SHALL show its illustration key's art, or its level's mascot face when it has no key. With less than 72 pt free the card SHALL render text-only. The mascot SHALL appear on the game card only in this slot.

#### Scenario: Illustrated challenge with room

- **WHEN** Ana's challenge has the `mascot-monocle` key and the card has room
- **THEN** the monocle cat is shown centered below the card text, at the bottom of the card

#### Scenario: Illustrated group card

- **WHEN** a "Yo nunca" card with the `glasses-toasting` key is on screen and has room
- **THEN** the toasting glasses are shown below the card text, above the rule box

#### Scenario: Little room left

- **WHEN** an illustrated card leaves 100 pt free below its text
- **THEN** the illustration is shown 88 pt tall (the free space minus the gap above it)

#### Scenario: Plenty of room

- **WHEN** a group card leaves 200 pt free above its rule box
- **THEN** its illustration is shown 160 pt tall

#### Scenario: Card without a key

- **WHEN** a Picante "Yo nunca" card without an illustration key leaves 150 pt free above its rule box
- **THEN** the smirking mascot face (`mascot-smirk`) is shown there, 138 pt tall; Suave cards show `mascot-relaxed` and Prendido cards `mascot-laugh`

### Requirement: Card fits the visible area

The card SHALL fit the visible card area between the top bar and the turn actions without scrolling. Its body text SHALL use the largest of three sizes that fits — 29, 24, or 20 pt, each scaled by the system font size — and SHALL step down only when the card would otherwise need to scroll, or once for its illustration (see "The illustration may take one text step"). Only when the body does not fit at the smallest size SHALL the card scroll.

#### Scenario: Compact header

- **WHEN** an individual card is on screen
- **THEN** its header still shows the avatar, "Le toca a", the name, the type and level chips, and the points badge, in less height than before

#### Scenario: Short card

- **WHEN** a card's text fits at 29 pt
- **THEN** the body shows at 29 pt and the card does not scroll

#### Scenario: Long card on a large phone

- **WHEN** a "Karaoke del despecho" card does not fit at 29 pt on a 393 × 852 pt screen
- **THEN** the body steps down to the largest of 24 or 20 pt that fits, and the whole card, footer included, is visible without scrolling

#### Scenario: Largest accessibility text

- **WHEN** the system font size is the largest and the body does not fit even at 20 pt
- **THEN** the body stays at the smallest step, scaled by the font size, and the card scrolls inside its area while the turn actions stay fixed

### Requirement: The illustration may take one text step

The illustration SHALL use the space left after the text fits. When a card with an illustration key fits but leaves less than 72 pt for its illustration, the body SHALL step down one more size, never below 20 pt, and keep it only if the illustration then gets at least 72 pt; otherwise the body SHALL return to the size that fit and the card SHALL render text-only. The text SHALL never truncate, and the turn actions SHALL never move.

#### Scenario: Layout changes

- **WHEN** the card's layout changes on screen, for example after a window-size or font-size change
- **THEN** the illustration size is checked again against the new free space

#### Scenario: One step for the illustration

- **WHEN** an illustrated card fits at 29 pt with only 40 pt free, and at 24 pt it leaves 120 pt free
- **THEN** the body shows at 24 pt and the illustration is shown below it

#### Scenario: No room even one step down

- **WHEN** an illustrated card fits at 24 pt with 30 pt free, and at 20 pt it still leaves less than 84 pt
- **THEN** the body returns to 24 pt and the card renders text-only

#### Scenario: Never below the smallest size

- **WHEN** an illustrated card only fits at 20 pt and leaves less than 84 pt
- **THEN** the body stays at 20 pt and the card renders text-only

#### Scenario: Long card on a small phone

- **WHEN** an illustrated card with a long body is shown on a 375 × 667 pt screen and no step leaves 72 pt for its illustration
- **THEN** the card shows only its text and the "¡Cumplió!" and "No cumplió" buttons stay at the bottom where they always are

#### Scenario: The level face never costs a text step

- **WHEN** a card without an illustration key fits at 29 pt with 40 pt free
- **THEN** the body stays at 29 pt and the card renders text-only; its level face only appears when the text already leaves 72 pt for it

#### Scenario: First frame

- **WHEN** an illustrated card first appears
- **THEN** its text settles at its final size while the card is still entering, and the illustration only appears below it once it is known to fit

### Requirement: New card entrance

Each new card on the turn screen (individual, group, or swapped) SHALL enter with a spring with a small overshoot that settles within 450 ms, or with the Reduce Motion fade. The turn actions SHALL not animate with the card.

#### Scenario: Next turn

- **WHEN** Ana completes her card and Beto's card appears
- **THEN** Beto's card springs in and settles within 450 ms while the turn buttons stay still

#### Scenario: Swapped card

- **WHEN** Ana presses "Cambiar (1)"
- **THEN** the replacement card enters with the same spring

## MODIFIED Requirements

### Requirement: Individual card face

An individual card SHALL be filled with its level color and show chips for its type (Reto or Verdad) and its level, a round points badge, and the rendered headline and body. It SHALL NOT show a separate "Hágalo" / "Responda con la verdad" hint, because the type chip says it, and it SHALL NOT show the penalty: the penalty shows on the refuse action (see "Refusing a card shows the penalty first").

#### Scenario: Reto card

- **WHEN** a challenge worth 5 points with a 1-drink penalty and the quip "por floja" is shown to Ana
- **THEN** the card shows "Reto", the Suave level, "5 pts", and the rendered headline and body, with no hint line and no "Si no cumple" strip

#### Scenario: Verdad card

- **WHEN** a truth card is shown
- **THEN** the card shows the "Verdad" chip instead of "Reto"

#### Scenario: Player who does not drink

- **WHEN** the current player does not drink
- **THEN** the refuse action shows the card's drink penalty until alternative penalties exist (HU-11)

### Requirement: Completing a card

The complete action SHALL read "¡Cumplió!" with a round amber badge on its top-right corner showing the points it adds ("+N"), and SHALL be announced as "¡Cumplió! +N pts"; pressing it SHALL complete the card through the game and show the next turn.

#### Scenario: Cumplió

- **WHEN** Ana presses "¡Cumplió!" with the "+5" badge on a 5-point card
- **THEN** the next player's turn is on screen and Ana has 5 points in the game

### Requirement: Refusing a card shows the penalty first

The refuse action SHALL read "No cumplió" with the card's penalty below it ("Toma N trago(s)", without the quip) and a round red badge on its top-right corner showing the points it takes away ("−N", half the card's points rounded up), and SHALL be announced as "No cumplió −N pts, Toma N trago(s)". Pressing it SHALL refuse the card through the game and show the refusing player's penalty (name, drinks with quip, points lost) in an overlay that waits for a tap; dismissing it with "Siguiente" reveals the next turn.

#### Scenario: No cumplió

- **WHEN** Ana presses "No cumplió" (showing "Toma 1 trago" and the "−3" badge) on a 5-point card with a 1-drink penalty and the quip "por floja"
- **THEN** an overlay shows "Ana no cumplió", "Toma 1 trago — por floja" and "−3 pts", and after "Siguiente" the next player's turn is on screen

#### Scenario: Refusal ends the game

- **WHEN** the last turn of the game is refused
- **THEN** the penalty overlay shows first, and the ranking opens only after it is dismissed


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
