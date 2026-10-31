# age-gate Specification

## Purpose

One-time adults-only gate shown on first use: the user confirms being 18+ and reads a responsible-drinking notice before any other screen of Prendidos is reachable.

## Requirements

### Requirement: Age gate on first use

On first use the app SHALL show, before any other screen, the Prendidos mascot, the question "¿Ya es mayor de edad?" as the screen header, a subtitle saying Prendidos is a drinking game only for people over 18, a moderation card saying no penalty passes 3 drinks and not to drive after drinking, a primary confirm action "Soy mayor de 18 años", a decline action "Soy menor de edad" shown as a text link, and the footnote "Se lo preguntamos una sola vez.", with all copy in Colombian Spanish using usted.

#### Scenario: First open

- **WHEN** the app opens and the age was never confirmed on this phone
- **THEN** the age gate is shown with the mascot, the question, the subtitle, the moderation card, the confirm action, the decline link and the footnote
- **AND** no other screen can be reached

#### Scenario: Decline link is still an accessible button

- **WHEN** a screen-reader user reaches "Soy menor de edad"
- **THEN** it is announced as a button and its touch target is at least 48 pt high

### Requirement: Confirmation is remembered

Confirming SHALL store the confirmation on the device and take the user to Inicio; the gate SHALL never be shown again on that phone, including after the app is closed and reopened.

#### Scenario: Confirm

- **WHEN** the user taps "Soy mayor de 18 años"
- **THEN** the confirmation is stored on the device and Inicio is shown

#### Scenario: Reopen after confirming

- **WHEN** the app is reopened after the age was confirmed
- **THEN** Inicio is shown and the age gate is not

### Requirement: Decline keeps the user out

Declining SHALL keep the user on the age gate with a short message that the app is only for adults, SHALL NOT store anything, and SHALL leave the confirm action available.

#### Scenario: Decline

- **WHEN** the user taps the decline action
- **THEN** a message says the app is only for adults, the age gate stays on screen, and nothing is stored

### Requirement: Readable on small phones

The age gate SHALL use large text with one primary action, and the confirm action SHALL stay visible without scrolling on small phones and with large font sizes (only the content above it may scroll). The mascot SHALL shrink on short screens so the question stays near the top.

#### Scenario: Small phone with large text

- **WHEN** the age gate is shown on a small phone with large font scaling
- **THEN** the confirm and decline actions stay visible at the bottom and the content above them scrolls if needed

#### Scenario: Short screen

- **WHEN** the age gate is shown on a screen 667 pt tall
- **THEN** the mascot is shorter than on a 844 pt screen, and never shorter than a readable minimum
