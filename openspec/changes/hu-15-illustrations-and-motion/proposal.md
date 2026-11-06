# Proposal: HU-15 card illustrations and motion

## Why

The playable build reads like a form: every card is text-only and nothing moves. The legacy Flutter cards set the bar with a large cartoon illustration on most cards, and the design tokens already define press, new-card, and level-up motion that was never built. Store screenshots and word of mouth are the main acquisition channel for a party game, so the visual personality is worth shipping now that the brand art pipeline, player avatars, and static mascot moments are in place (`docs/user-stories/hu-15-illustrations-and-mascot.md`).

## What Changes

- **Card illustration library (24 keys).** The legacy cast (mascot expressions and poses, neutral props, drink props, guest animals) is redrawn in the current brand as interim AI drafts: one new draft sheet in `docs/brand/references/`, cropped by `scripts/crop-brand-art.py` into transparent PNGs in `assets/images/brand/card-<key>.png`. Five keys reuse bundled mascot art and one comes from the existing expressions sheet. Legacy pieces that break brand or store rules are redesigned (diva, ringing phone) or dropped (police cap, Spain map pin, the mascot holding a drink).
- **Illustration keys are a closed set.** `Card.illustration` narrows from free text to `IllustrationKey`; the content validator rejects an unknown key as an error, so shipped content can never point to missing art. **BREAKING** for any content file that sets a free-text `illustration` (none ship today).
- **Illustrations on the turn card.** A card with a key shows its art centered below the text and notes, up to 120 pt tall, decorative (hidden from screen readers). Text always wins: when the art does not fit the visible card area, the card renders text-only and the turn buttons never move.
- **Content tagging.** The launch catalog (`la-previa`, `entre-dos`) gets illustration keys by format and mood; every key is used, every level of each launch category has illustrated cards, recurring formats share one key. New cards are written with `write-cards` only where no existing card fits a key, and pass the HU-07 human review. The `write-cards` skill emits a valid key.
- **Motion.** Clay buttons sink over 120 ms with a light haptic; each new card enters with a spring that settles within 450 ms; the level-up mascot tile grows with an overshoot in about 600 ms; the crowned winner mascot pops in once. Under Reduce Motion every entrance becomes a 200 ms fade and the press sinks instantly. **Modifies** the turn screen's "Level up … without motion" requirement.
- **Brand rule change.** The mascot may appear on the game card, but only in the illustration slot (amends `design-tokens.md` "never place the mascot on the game card").
- **New dependency:** `expo-haptics` (Expo SDK 58 module).

Already done on `main` and kept as regression checks only: player avatars in setup, turn, and ranking; the home logo tile; the crowned mascot on the ranking.

## Capabilities

### New Capabilities

- `ui-motion`: Shared motion behavior across screens: clay press feedback with haptics, entrance animations, the Reduce Motion fallback, and the limit on animated elements per screen.

### Modified Capabilities

- `brand-art`: ADDED the card illustration library (24 keys, bundled art per key, decorative rendering, art rules).
- `card-content`: ADDED illustration keys must come from the library (`unknownIllustration` error).
- `launch-catalog`: ADDED illustration coverage of the shipped catalog (every key used, every level illustrated, recurring formats share a key).
- `turn-screen`: ADDED card illustration slot with the "text wins" fallback, ADDED new-card entrance; MODIFIED Level up (the mascot tile grows instead of "without motion").
- `final-ranking`: ADDED the winner mascot pop.

## Impact

- **Platforms:** iOS, Android, and web. Haptics fire on iOS and Android only.
- **Native build:** `expo-haptics` is a native module. Expo Go already includes it, but store and development builds need a **new native build**; this change cannot ship by EAS Update alone. Android uses the haptics engine (`performAndroidHapticsAsync`), so the `VIBRATE` permission the module adds by default is blocked in `app.json` (see design).
- **Code:** `src/features/content/` (card types, validator, catalog JSON), `src/components/ui/` (brand art, new illustration, press, entrance, and motion modules, `button.tsx`), `src/constants/theme.ts` (`Motion` tokens), new `src/hooks/use-reduce-motion.ts`, `src/features/play/` (card face, play screen, `ClayButton`, level-up overlay, new fit helper), `src/features/results/ranking-header.tsx`.
- **Assets and tooling:** one new draft sheet, 19 new PNGs (budget under 1.5 MB), crop script tables. Pillow stays a throwaway dev tool.
- **Docs:** `docs/brand/README.md`, `docs/brand/design-tokens.md`, `docs/content/card-templates.md`, `docs/content/README.md`, `docs/data-model.md`, `ai-specs/skills/write-cards/SKILL.md`.
- **Human gates:** the product owner generates and reviews the draft sheet before the 18 draft keys are coded; new cards pass the HU-07 content review.
- **Security and privacy:** no new data, storage, network calls, or runtime permission prompts. No auth, authz, or age-gate change, so no SECURITY REVIEW NEEDED. Compliance: drink props only on group toasts or shared-drink cards, the mascot never drinks or looks drunk (App Store 1.4.3, Google Play alcohol policy).
- **Storage:** none. `Card.illustration` is bundled content only; `device.v1` and `GameSession` are unchanged.
