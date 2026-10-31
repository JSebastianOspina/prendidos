# Proposal

## Why

Entre Dos ships only 10 cards per level, so a couple sees repeats within one night, and La Previa has no Sin Filtro (`spicy`) cards for HU-10 to unlock. HU-07 fills the launch catalog so a whole night of play never repeats a card (`docs/user-stories/hu-07-launch-content.md`).

## What Changes

- Append 60 Entre Dos cards (`dos-031` … `dos-090`, 20 per level, `heat: "standard"`, flirty and never explicit) to `src/features/content/catalog/entre-dos.json`.
- Append 90 La Previa Sin Filtro cards (`prev-102` … `prev-191`, 30 per level, `heat: "spicy"`) to `src/features/content/catalog/la-previa.json`. The engine already hides spicy cards unless `spicyEnabled`, so they stay unreachable until HU-10.
- Add `docs/content/launch-content-review.md` with counts, validation result, and "pending human review" status.
- No code, loader, validator, or test changes; no existing card ID changes.

## Capabilities

### New Capabilities

- `launch-catalog`: what the bundled launch catalog must contain — minimum cards per category, heat, and level, type mix, gender-targeting share, and the human-review gate.

### Modified Capabilities

(none)

## Impact

- Data only: two bundled JSON files grow by ~150 cards (tens of KB). `catalog.ts` validates them at load as today.
- Platforms: iOS, Android, web; no new development build, no native module, no dependency.
- Security: no auth or data-flow impact. Content policy (App Store 1.1.4 / 1.4.3, Google Play) applies to every card; a human review is still required before release.
