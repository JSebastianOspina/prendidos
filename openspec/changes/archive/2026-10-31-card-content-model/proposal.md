# Proposal

## Why

PRD 1.1 and the content work in `docs/content/` changed what a card is: copy split into a hook and an instruction, a structured penalty, a Sin Filtro heat layer instead of a `sin-filtro` category, and app-rendered consent and outside-contact rules. `docs/data-model.md` still describes the old shape, and there is no code that enforces the content rules, so cards produced by the `write-cards` skill can only be checked by hand. This is also the first application code in the repo: game rules, the card face, and the content pipeline all depend on this model.

## What Changes

- **BREAKING (docs only, nothing shipped):** `Card` in `docs/data-model.md` changes from `text` + free-text `penalty` to `headline` + `body` + structured `penalty: { drinks: 1 | 2 | 3; quip? }`, and gains `illustration`, `heat`, `requiresConsent`, `reachesOutside`, and `sourceLegacyId`.
- **BREAKING (docs only):** the `sin-filtro` category is removed. The Sin Filtro product becomes a `spicyLayer` unlock for every `friends` category; `GameSettings` gains `spicyEnabled`, remembered in `DeviceState`.
- The `GenderedText` format left open in PRD §12 is fixed: `{player}` / `{partner}` placeholders and inline `{masculine|feminine|neutral}` variants.
- New pure TypeScript module `src/features/content/` with the content types and a `validateCards` function that reports every rule a card catalog breaks (drinks, points range, required fields per type, unique IDs, heat by mode, banned phrases, length limits, variant syntax).
- Jest is installed and configured with the `jest-expo` preset (first test setup in the repo), with tests written first (TDD).
- No UI, no persistence, and no real card content in this change.

## Capabilities

### New Capabilities

- `card-content`: the shape of bundled card content and the validation rules every card catalog must pass before it can ship.

### Modified Capabilities

None — `openspec/specs/` is empty.

## Impact

- **Code:** new `src/features/content/` (types, `validate-cards.ts`, tests). No existing code changes.
- **Dependencies:** dev-only `jest-expo`, `jest` (30, required by `jest-expo` on SDK 58), `@types/jest`, and `@types/node` (for the test that reads the skill file; its types reach the whole type-check, see design §8), installed with `npx expo install`. No native modules, so no new development build is needed.
- **Config:** `package.json` (`test` script, `jest` preset, coverage threshold), `tsconfig.json` (`types: ["jest"]`). `coverage/` is already git-ignored.
- **Docs:** `docs/data-model.md` (Card, Category catalog, Product, GameSettings, DeviceState, validation rules), `docs/content/card-templates.md` (proposal → adopted), `docs/development_guide.md` (corrected Jest install command).
- **Platforms:** iOS and Android unaffected at runtime (no screen uses the module yet); web out of scope.
- **Security:** no auth, authorization, secrets, or age-gate code is touched. The validator enforces responsible-drinking rules (PRD §5.8) but is not a security control. No SECURITY REVIEW NEEDED.
