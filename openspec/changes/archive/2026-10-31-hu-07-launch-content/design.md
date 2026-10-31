# Design

## Context

HU-00 shipped `catalog.ts`, which imports exactly two JSON files (`la-previa.json`, `entre-dos.json`), merges them, and throws if `validateCards` finds errors. HU-07 owns only those JSON files and `docs/content/` notes. The engine already filters `spicy` cards unless `spicyEnabled` (HU-10 adds the switch). Starting counts: La Previa standard 39 / 31 / 31, La Previa spicy 0, Entre Dos 10 / 10 / 10.

## Goals / Non-Goals

**Goals:** close the gap to ≥ 30 per level with the 60 / 20 / 20 type mix, Entre Dos first (playable today), then La Previa spicy.

**Non-Goals:** new categories, alternative penalties (HU-11), illustrations (HU-15), any code or test change.

## Decisions

1. **Append, never rewrite.** New cards go at the end of the existing `cards` arrays with IDs `dos-031…dos-090` and `prev-102…prev-191`. Alternative: a new `la-previa-sin-filtro.json` file — rejected because it needs a `catalog.ts` change (HU-00-owned).
2. **Per-level batch shape.** Entre Dos: 12 challenge / 4 truth / 2 `everyoneWho` / 2 `neverHaveIEver` per level. La Previa spicy: 18 / 6 / 3 / 3 per level. Keeps every level at the 60 / 20 / 20 mix on its own.
3. **Entre Dos stays `standard` heat.** The validator forbids spicy in couple categories (PRD §6.4); flirting lives inside the standard tier (looks, words, consented kisses on the cheek, slow dances, hugs, massages of hands) and pushes social risk and intimacy of confession instead of explicit content. Kisses on the lips are a Sin Filtro item in `policy.md`, so Entre Dos avoids them.
4. **Drinks by level** follow `policy.md`: easy 1, medium 1–2, hard 2–3.
5. **Gender targeting.** Written gender-neutral by default (invariable words, `{m|f|n}` variants). Target: 0 targeted cards in Entre Dos, at most 3 (≤ 10 %) in the spicy batch.
6. **TDD without owning tests.** A temporary Jest test (`src/features/content/__tests__/launch-content-temp-test.ts`) asserts the per-level counts and `hasErrors === false`; it is written red first, kept green while writing, and deleted before commit because test files are HU-00-owned. The permanent `catalog-test.ts` validator check stays green.
7. **Authoring notes are not shipped.** `rationale` / `selfCheck` are allowed by the validator but omitted from the JSON to keep the bundle small; the review note carries the batch-level rationale.

## Shared changes requested

- `src/features/content/__tests__/catalog-test.ts` (HU-00): add a permanent test that the shipped catalog holds ≥ 30 cards per level for La Previa standard, La Previa spicy, and Entre Dos standard, and that targeted cards are ≤ 10 % per category and heat.

## Risks / Trade-offs

- [AI-written copy may be unfunny or off-voice] → every card is marked pending human review; reviewers get the checklist in `docs/content/README.md`.
- [Spicy cards could drift toward explicit] → each spicy card is checked against "Never, in any tier"; no nudity, sexual acts, intimate touching, or sexual images.
- [Validator heuristics miss policy issues] → the review note lists what only a human can judge.
- [Content volume adds bundle weight] → ~150 short cards, negligible.

## Migration Plan

Additive data change; rollback is reverting the commit. Existing IDs are untouched, so saved seen-card history stays valid.
