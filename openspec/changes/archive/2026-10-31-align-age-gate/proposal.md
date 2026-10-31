# Proposal

## Why

The age gate shipped with the clay tokens but not the approved layout (design review `docs/design/review/README.md` § 1): a red wordmark tile, an eyebrow, a long paragraph and two full buttons. The proposal shows the mascot, a short usted question, a moderation card, one primary action with a text link, and a footnote. The interim mascot art (`Mascot`) is now available, so the screen can match.

## What Changes

- Replace the wordmark tile and eyebrow with the `pointing` mascot pose (about 240 pt tall, smaller on short screens).
- Title becomes "¿Ya es mayor de edad?" with a subtitle that names Prendidos and the 18+ audience.
- The responsible-drinking notice moves into a white outlined moderation card with a shield glyph: no penalty passes 3 drinks, and do not drive after drinking.
- Confirm stays a primary button "Soy mayor de 18 años"; decline becomes the text link "Soy menor de edad" (still a button, ≥ 48 pt target).
- New footnote "Se lo preguntamos una sola vez."
- Behavior is unchanged: confirm only calls `confirmAge()`; decline shows the adults-only message and stores nothing.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `age-gate`: "Age gate on first use" now describes the mascot, the usted question, the subtitle, the moderation card, the decline text link and the footnote; "Readable on small phones" adds the mascot shrinking on short screens.

## Impact

- Code: `src/features/age-gate/**`, `src/app/age-gate.tsx` (unchanged export), `.maestro/age-gate.yaml` (new copy selectors).
- No new dependency, no native change, no new development build. Platforms: iOS, Android, web.
- SECURITY REVIEW NEEDED — auth/authz/security impact: this is the age gate. The gate logic (`confirmAge()` + the root `Stack.Protected` guard) is not touched; only layout and copy change.
