# Spec Delta

## Purpose

The end-of-game screen: it names the winner, lists every player's final score, and lets the group replay or go home without the finished game being resumable.

## ADDED Requirements

### Requirement: Winner and full ranking

When a game has finished, the screen SHALL highlight the winner (name, final score, and a points-colored accent) and, below it, list every player with their final position and score, highest first.

#### Scenario: Single winner

- **WHEN** the game finished with Ana 12, Beto 7, Cami 3
- **THEN** Ana is highlighted as the winner with "12 pts"
- **AND** the ranking lists "1. Ana", "2. Beto", "3. Cami" with their scores

### Requirement: Ties look tied

Players with the same final score SHALL share one position and appear together in one entry, names joined in Spanish ("Ana y Luis", "Ana, Beto y Luis").

#### Scenario: Tie for first

- **WHEN** Ana and Luis both finish with 10 points and Beto with 4
- **THEN** the winner highlight names "Ana y Luis" as a tie
- **AND** the ranking shows "1. Ana y Luis" and "3. Beto"

### Requirement: Negative scores

A negative final score SHALL be shown with its minus sign in the negative color.

#### Scenario: Player below zero

- **WHEN** a player finishes with -3 points
- **THEN** their score reads "-3 pts" in the negative color

### Requirement: Play again

"Jugar otra vez" SHALL open the game setup with the same players, mode, category, levels, end condition and Sin Filtro choice already filled in, and the finished game SHALL be forgotten.

#### Scenario: Replay

- **WHEN** the user taps "Jugar otra vez"
- **THEN** the setup screen opens with the finished game's settings in the new-game draft
- **AND** no finished game remains in memory

### Requirement: Back home

"Volver al inicio" SHALL return to the home screen and forget the finished game.

#### Scenario: Home

- **WHEN** the user taps "Volver al inicio"
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
