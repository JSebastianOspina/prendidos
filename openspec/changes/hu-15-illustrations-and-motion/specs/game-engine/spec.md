# Spec Delta

## ADDED Requirements

### Requirement: Consecutive cards show different illustrations

When the game draws the next card, including a swap, it SHALL pick, among the cards the selection order allows, the first one whose shown illustration (its key, or its level's mascot face) differs from the one on screen. Only when every allowed card shares it MAY the same illustration show again. The other selection rules stay in force.

#### Scenario: Two cards in a row with the same art

- **WHEN** the card on screen shows `mascot-thinking` and the next two cards by the selection order show `mascot-thinking` and `stopwatch`
- **THEN** the `stopwatch` card comes out next

#### Scenario: Level face counts as an illustration

- **WHEN** the card on screen is a Suave card without a key (it shows `mascot-relaxed`) and the next card by the selection order is tagged `mascot-relaxed`
- **THEN** a card with a different illustration comes out instead, if one is allowed

#### Scenario: Only one illustration left

- **WHEN** every card the selection order allows shows the same illustration as the card on screen
- **THEN** the first of them comes out
