# Spec Delta

## ADDED Requirements

### Requirement: Card illustration library

The app SHALL bundle one card illustration per key of the 24-key card illustration library (`docs/brand/README.md` § Card Illustration Library), and the library SHALL hold no key without bundled art.

#### Scenario: Launch library keys

- **WHEN** the library keys are listed
- **THEN** they are, in order: `mascot-wink`, `mascot-relaxed`, `mascot-smirk`, `mascot-laugh`, `mascot-pointing`, `mascot-surprised`, `mascot-monocle`, `mascot-reading-book`, `mascot-crying`, `mascot-sad-map-pin`, `mascot-blowing-kiss`, `mascot-sunglasses`, `mascot-dancing`, `mascot-tongue-out`, `mascot-annoyed`, `mascot-selfie`, `mascot-diva`, `phone-ringing`, `microphone`, `animal-wheel`, `shot-glass-on-fire`, `glasses-toasting`, `rooster`, `two-dogs`

#### Scenario: Every key has art

- **WHEN** the illustration for any library key is requested
- **THEN** a bundled image with a transparent background and a positive aspect ratio is returned

#### Scenario: Mascot expressions reuse the mascot art

- **WHEN** the `mascot-wink` illustration is requested
- **THEN** it shows the same winking cat as the `wink` mascot art

### Requirement: Card illustrations are decorative

A card illustration SHALL render at the requested height with its own aspect ratio, never cropped or distorted, and SHALL be hidden from screen readers, because the card text carries the card.

#### Scenario: Rendering a non-square piece

- **WHEN** the `mascot-dancing` illustration is shown 120 pt tall
- **THEN** it is 120 pt tall, its width follows its aspect ratio, and the whole piece is visible

#### Scenario: Screen reader on the illustration

- **WHEN** a screen reader moves through a card with an illustration
- **THEN** it reads the card text and never focuses or announces the illustration

### Requirement: Card illustration art rules

Library pieces SHALL follow the brand art rules: mascot pieces show the white cat with the flat three-layer flame and an `ink` outline; props and guest animals use the same flat style with no flame; no piece contains text; no character drinks or looks drunk, dizzy, sleepy, or sick; drink props appear only as `shot-glass-on-fire` and `glasses-toasting`.

#### Scenario: Review of a new piece

- **WHEN** a draft piece shows a speech bubble, a character holding a drink, or a dizzy face
- **THEN** it is rejected in the draft-sheet review and is not bundled
