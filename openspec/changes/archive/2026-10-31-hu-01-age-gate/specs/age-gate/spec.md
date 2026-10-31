# Spec Delta

## Purpose

One-time adults-only gate shown on first use: the user confirms being 18+ and reads a responsible-drinking notice before any other screen of Prendidos is reachable.

## ADDED Requirements

### Requirement: Age gate on first use

On first use the app SHALL show, before any other screen, the Prendidos brand, the question whether the user is over 18, a short responsible-drinking notice, a primary confirm action "Soy mayor de 18 años", and a visible decline action, with all copy in Colombian Spanish.

#### Scenario: First open

- **WHEN** the app opens and the age was never confirmed on this phone
- **THEN** the age gate is shown with the brand, the question, the responsible-drinking notice, the confirm action and the decline action
- **AND** no other screen can be reached

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

The age gate SHALL use large text with one primary action, and the confirm action SHALL stay visible without scrolling on small phones and with large font sizes (only the text above it may scroll).

#### Scenario: Small phone with large text

- **WHEN** the age gate is shown on a small phone with large font scaling
- **THEN** the confirm and decline actions stay visible at the bottom and the text above them scrolls if needed
