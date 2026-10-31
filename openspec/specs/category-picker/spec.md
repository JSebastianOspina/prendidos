# category-picker Specification

## Purpose
Lets players choose a category of the mode picked on Inicio (Amigos or Pareja), with enough detail (card count, levels, what is free) to decide, so the setup and the cards match who is playing.

## Requirements

### Requirement: Category list per mode

The category screen SHALL show the mode name as its heading next to the back button, a mode subtitle, and, from the top, one white card per category of the draft's mode with the name and the description taken from the content catalog.

#### Scenario: Friends categories

- **WHEN** the draft mode is Amigos
- **THEN** the "Amigos" heading, the subtitle "Elija una categoría. La partida arranca suave y se va calentando sola.", and "La Previa" with its description are shown, and "Entre Dos" is not

#### Scenario: Couple header

- **WHEN** the draft mode is Pareja
- **THEN** the "Pareja" heading, a "2 jugadores" chip, and the subtitle "Un plan coqueto para dos. Picante, sí; explícito, no." are shown

#### Scenario: Category without a description

- **WHEN** a category has no description
- **THEN** its card shows the name and the card count without a description

#### Scenario: Mode without categories

- **WHEN** the chosen mode has no categories
- **THEN** the screen says there are no categories yet and offers the way back

### Requirement: Category choice opens the setup

Choosing a category SHALL store it in the new-game draft and open the setup screen, with no game data in the route. In Amigos the whole card is the button; in Pareja the card's "Jugar <category>" button is.

#### Scenario: Choosing a category

- **WHEN** the user taps "Jugar Entre Dos" in Pareja
- **THEN** the draft holds mode couple and category `entre-dos` and the setup screen opens

#### Scenario: Choosing a friends category

- **WHEN** the user taps the "La Previa" card in Amigos
- **THEN** the draft holds mode friends and category `la-previa` and the setup screen opens

### Requirement: Category screen needs a mode

The category screen SHALL send the user to Inicio, where the mode is chosen, when the draft has no mode.

#### Scenario: Opened without a mode

- **WHEN** the category screen opens and the draft has no mode
- **THEN** the user is redirected to Inicio

### Requirement: Lock badge slot

Category cards SHALL reserve a corner for a lock badge on paid content, shown only when one is provided; at launch no badge is shown.

#### Scenario: Launch categories

- **WHEN** the category list is shown at launch
- **THEN** no lock badge is visible

### Requirement: Category card details

Each Amigos category card SHALL show the number of standard cards in the category ("N cartas"), three level bars (Suave, Picante, Prendido), and a "GRATIS" chip when every level of the category is free. Each Pareja category card SHALL list one row per level with the level name, its standard card count, and "GRATIS" on free levels. No locks, prices, or purchase copy are shown.

#### Scenario: La Previa card

- **WHEN** the Amigos category list shows La Previa, whose three levels are free
- **THEN** its card shows its standard card count, the three level bars, and the "GRATIS" chip

#### Scenario: Entre Dos levels

- **WHEN** the Pareja category list shows Entre Dos, where only Suave is free
- **THEN** its card lists Suave with "GRATIS" and its card count, and Picante and Prendido with their card counts only

### Requirement: Category back button

The category screen SHALL offer a square back button labelled "Volver" that returns to the previous screen, or to Inicio when there is no history.

#### Scenario: Back from the category list

- **WHEN** the user taps "Volver" on the category screen
- **THEN** the app returns to the previous screen, or to Inicio when there is no history
