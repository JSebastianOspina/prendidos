# Spec Delta

## Purpose

Defines the shared motion of the Prendidos UI: how clay buttons respond to a press, how celebratory elements enter, and how every animation degrades when the player asks the system to reduce motion.

## ADDED Requirements

### Requirement: Clay press feedback

Every clay button (shared buttons and the turn screen's actions) SHALL sink by the pressed travel over 120 ms on press-in and come back on release. On iOS and Android each press-in SHALL fire exactly one light haptic; on web it SHALL fire none. A haptic that fails or is unavailable SHALL never block or fail the press.

#### Scenario: Press on a phone

- **WHEN** a player presses "¡Cumplió!" on iOS or Android
- **THEN** the button sinks by the pressed travel over 120 ms, one light haptic fires, and the button returns when released

#### Scenario: Press on web

- **WHEN** a player presses a clay button in the web build
- **THEN** the button sinks and no haptic is requested

#### Scenario: Haptic unavailable

- **WHEN** the device cannot play the haptic (Low Power Mode, haptics off, or the request fails)
- **THEN** the press still runs its action and no error is shown or thrown

### Requirement: Reduce Motion fallback

When the system Reduce Motion setting is on (iOS "Reduce Motion", Android "Remove animations"), every entrance animation SHALL become a 200 ms opacity fade with no movement or scaling, and a press SHALL show the sunk state instantly with no travel animation. The press haptic SHALL still fire, since it is not motion. Screens SHALL show the same content with the setting on or off.

#### Scenario: Entrance with Reduce Motion on

- **WHEN** Reduce Motion is on and a new turn card appears
- **THEN** the card fades in over 200 ms without springing or moving

#### Scenario: Press with Reduce Motion on

- **WHEN** Reduce Motion is on and a player presses a clay button on a phone
- **THEN** the button shows its sunk state at once and one light haptic fires

#### Scenario: Setting changes while the app runs

- **WHEN** the player turns Reduce Motion on while the app is open
- **THEN** the next animation that starts uses the fade fallback

### Requirement: Motion never blocks play

Animations SHALL run off the JavaScript thread and SHALL never delay or swallow a tap: controls outside an animating element respond while it animates. No screen SHALL animate more than two elements at once.

#### Scenario: Tap during a card entrance

- **WHEN** a new turn card is still entering and the player presses "No cumplió"
- **THEN** the refusal runs immediately as it would after the entrance ends

#### Scenario: Elements animated per screen

- **WHEN** any screen opens or changes its content
- **THEN** at most two elements on it animate at the same time
