# User Stories — MVP slicing plan

Product-level user stories for the Prendidos MVP, written with the `write-us` skill (business value and acceptance criteria only). Each story becomes one OpenSpec change through `enrich-us` → `/opsx:propose` → `/opsx:apply`.

This README is the one technical document in the folder: it fixes **who owns which files** so several agents can build screens at the same time without touching each other's work. `enrich-us` must copy the ownership row of its story into the technical details.

## Stories

| ID    | Story                                                                        | Phase        | Depends on                   |
| ----- | ---------------------------------------------------------------------------- | ------------ | ---------------------------- |
| HU-00 | [Game foundation](./hu-00-game-foundation.md)                                | A (blocking) | `card-content-model` archived |
| HU-01 | [Age confirmation (18+)](./hu-01-age-gate.md)                                | B (parallel) | HU-00                        |
| HU-02 | [Home screen](./hu-02-home.md)                                               | B (parallel) | HU-00                        |
| HU-03 | [Choose mode and category](./hu-03-mode-and-category.md)                     | B (parallel) | HU-00                        |
| HU-04 | [Game setup](./hu-04-game-setup.md)                                          | B (parallel) | HU-00                        |
| HU-05 | [Turn and card screen](./hu-05-turn-and-card.md)                             | B (parallel) | HU-00                        |
| HU-06 | [Final ranking](./hu-06-final-ranking.md)                                    | B (parallel) | HU-00                        |
| HU-07 | [Launch card content](./hu-07-launch-content.md)                             | B (parallel) | HU-00                        |
| HU-08 | [Purchases and restore](./hu-08-purchases-and-entitlements.md)               | C (later)    | HU-00, HU-02                 |
| HU-09 | [Paywall and locked content](./hu-09-paywall-and-locked-content.md)          | C (later)    | HU-08, HU-03, HU-05, HU-06   |
| HU-10 | [Sin Filtro switch](./hu-10-sin-filtro-switch.md)                            | C (later)    | HU-04, HU-08, HU-09, HU-07   |
| HU-11 | [Alternative penalties](./hu-11-alternative-penalties.md)                    | C (later)    | HU-00, HU-04, HU-05          |
| HU-12 | [Resume an interrupted game](./hu-12-resume-game.md)                         | C (later)    | HU-00, HU-02, HU-05          |
| HU-13 | [Anonymous analytics](./hu-13-anonymous-analytics.md)                        | C (later)    | HU-00 … HU-06, HU-08         |
| HU-14 | [Responsible-drinking messages](./hu-14-responsible-drinking-messages.md)    | C (later)    | HU-01, HU-06                 |
| HU-15 | [Card illustrations and mascot](./hu-15-illustrations-and-mascot.md)         | C (later)    | HU-02, HU-05, HU-06, HU-07   |

## Execution plan (first playable build)

**Phase A — sequential, one session**

1. Archive the `card-content-model` change and commit it (`feature/card-content-model`). Parallel worktrees branch from commits; uncommitted work is invisible to them.
2. HU-00 on a branch stacked on that commit. It ends with: tests green, lint and typecheck clean, placeholders visible in the app, and this README's ownership table confirmed against the real paths.

**Phase B — parallel, one agent per story, each in its own worktree branched from HU-00's final commit**

HU-01 … HU-07 run at the same time. Each agent runs `/opsx:propose` and `/opsx:apply` for its own change, touches only its owned paths, and opens a PR against HU-00's branch (or `main` once HU-00 merges).

**Phase C — integration**

Merge the seven branches, run `npm test`, `npx expo lint`, `npx tsc --noEmit`, start the app, play one full game on the simulator. Only then schedule HU-08 onward.

Time budget for the hour: Phase A ≈ 30 min, Phase B ≈ 20 min, Phase C ≈ 10 min. If HU-00 overruns, drop from its scope in this order: unseen-card priority, gender-targeted cards, points-goal and open end conditions (keep rounds only).

## Ownership map

Paths are relative to the repo root. **Shared (read-only)** means: created by HU-00 and never edited by a Phase B story. A Phase B agent that needs a change there stops and asks the coordinator instead of editing.

### Shared, owned by HU-00

| Area                       | Path                                                                                          | Notes                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Root layout and navigation | `src/app/_layout.tsx`, `src/features/navigation/routes.ts`                                   | Stack navigator; typed route helpers. Template tabs and `explore.tsx` removed            |
| Route placeholders         | `src/app/age-gate.tsx`, `src/app/index.tsx`, `src/app/new-game/mode.tsx`, `src/app/new-game/category.tsx`, `src/app/new-game/setup.tsx`, `src/app/play.tsx`, `src/app/results.tsx` | HU-00 creates them empty; ownership passes to the screen story below |
| Game engine                | `src/features/game/` (pure TypeScript: session reducer, card selection, escalation, scoring, end condition, ranking) and `src/features/game/game-provider.tsx` (`useGame()` hook) | No React in the pure modules. `useGame()` is the only way screens read or change the game |
| New-game draft             | `src/features/game/new-game-draft.tsx` (`useNewGameDraft()`)                                  | Mode, category, players, options accumulate here across HU-03 and HU-04; no route params |
| Device storage             | `src/features/device/` (storage adapter, `useDeviceState()`), ADR in `docs/adr/`              | Age confirmation, last players, seen cards, last Sin Filtro, active session              |
| Content runtime            | `src/features/content/catalog.ts` (loads and validates the bundled JSON), `src/features/content/catalog/*.json` (seed batch) | Types, text rendering, and validator already exist from `card-content-model` (see "Reuse, do not redefine"). No new text renderer |
| Shared UI                  | `src/components/ui/` (button, screen container, card frame, level badge), `src/constants/theme.ts` (tokens from `docs/brand/design-tokens.md`) | Light theme only                                                                        |
| Dependencies               | `package.json`, `package-lock.json`, `app.json`                                               | Storage library and React Native Testing Library installed here. Nobody else installs   |

### Owned per Phase B story

| Story | Route file (replaces the placeholder) | Feature folder                     | Also owns                                              |
| ----- | ------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| HU-01 | `src/app/age-gate.tsx`                | `src/features/age-gate/`           | —                                                      |
| HU-02 | `src/app/index.tsx`                   | `src/features/home/`               | —                                                      |
| HU-03 | `src/app/new-game/mode.tsx`, `src/app/new-game/category.tsx` | `src/features/category-picker/` | —                                        |
| HU-04 | `src/app/new-game/setup.tsx`          | `src/features/setup/`              | —                                                      |
| HU-05 | `src/app/play.tsx`                    | `src/features/play/`               | Card face components (from `docs/content/card-templates.md`) |
| HU-06 | `src/app/results.tsx`                 | `src/features/results/`            | —                                                      |
| HU-07 | —                                     | —                                  | `src/features/content/catalog/*.json` only, plus `docs/content/` review notes |

Each story also owns its own tests (next to the code, `*.test.ts(x)` or `__tests__/`), its OpenSpec change folder under `openspec/changes/`, and its Maestro flow under `.maestro/` if it adds one.

### Rules for Phase B agents

1. Edit only your owned paths. If you need something shared, write the need in your change's `design.md` and stop; do not edit the shared file.
2. Read the game through `useGame()` and the draft through `useNewGameDraft()`; never import the engine modules directly from a screen, never keep a second copy of game state. Import domain types from `@/features/content/card-types` and `@/features/game`; never declare a local type for a player, card, level, or mode.
3. Navigate with the helpers in `routes.ts`; do not hardcode paths and do not pass game data in route params.
4. Use tokens from `theme.ts` and primitives from `components/ui/`; do not add colors or fonts.
5. Keep user-facing copy in one file inside your feature folder, in Colombian Spanish.
6. Before declaring done: `npm test`, `npx expo lint`, `npx tsc --noEmit`, and the screen visible in the running app.
7. Commit on your own branch with Conventional Commits; never rebase or merge another story's branch.

## Reuse, do not redefine (already on `feature/card-content-model`)

HU-00 imports these and builds on them. A second definition of any of them anywhere in `src/` is a defect.

| Already exists in `src/features/content/` | What it gives                                                                                                        | Used by                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `card-types.ts`                           | `GameMode`, `Difficulty`, `CardType`, `Heat`, `PlayerGender`, `TargetGender`, `GenderedText`, `DrinkPenalty`, `Category`, `Card` = `IndividualCard \| GroupCard`, `pointsRangeByDifficulty`, `individualCardTypes`, `groupCardTypes`, `copyLengthLimits` | Engine, draft, every screen that shows a card or a level |
| `gendered-text.ts`                        | `renderGenderedText(text, gender, placeholderValues)` resolves `{player}` / `{partner}` and `{m\|f\|n}` variants for one player; `parseGenderedText`, `renderAllGenders`, `longestRenderedLength` | Engine (turn copy), HU-05 card face       |
| `validate-cards.ts`                       | `validateCards(catalog) → ContentViolation[]`; catalog shape is `{ categories: Category[]; cards: Card[] }`           | `catalog.ts` loader and the HU-07 content check |
| `banned-phrases.ts`                       | `bannedPhrases`, `findBannedPhrases(text)`                                                                           | Validator only                            |
| `__tests__/fixtures/valid-catalog.ts`     | `validCategories` (`la-previa`, `entre-dos`) and one valid card per type: the template for the seed JSON             | HU-00 seed batch, HU-07                   |

The bundled JSON files in `src/features/content/catalog/` use exactly the validator's catalog shape, so the same `validateCards` runs in a test over the shipped content.

Domain entities outside content follow `docs/data-model.md` by name and field, no renaming: `Player { id, name, gender, drinks }`, `GameSettings { mode, categoryId, players, selectedDifficulties, endCondition, spicyEnabled }`, `EndCondition` (`rounds` 5|10|15|20, `points` 100|200|300, `open`), `GameSession { id, settings, status, currentRound, currentPlayerIndex, scores, playedCardIds, swapsUsed, couplePaywallShown, startedAt }`, `DeviceState { ageConfirmedAt, lastPlayers, seenCardIds, lastSpicyEnabled, activeSession }`, `AlternativePenalty`, `Product`, `Entitlement`. Storage keys are namespaced and versioned (`device.v1`). Field names in Spanish, synonyms (`level` for `difficulty`, `challenge` for `card`), or a second `Player` type are defects.

## Interfaces fixed by HU-00 (names, not implementations)

These names are the contract Phase B stories code against. `enrich-us` for HU-00 details their shapes using the types above; later stories only consume them.

- `useGame()` → the `GameSession` plus derived `currentPlayer: Player`, `currentCard: Card`, `currentDifficulty: Difficulty`, `ranking`, and the Spanish copy for the current card already rendered through `renderGenderedText`; actions `startGame(settings: GameSettings)`, `completeCard()`, `refuseCard()`, `swapCard()`, `nextAfterGroupCard()`, `endGame()`, `clearFinishedGame()`.
- `useNewGameDraft()` → a partial `GameSettings` (`mode`, `categoryId`, `players`, `selectedDifficulties`, `endCondition`, `spicyEnabled`) with setters and `toSettings(): GameSettings`; preloaded from `useDeviceState().lastPlayers` and `lastSpicyEnabled`.
- `useDeviceState()` → the `DeviceState` fields plus `confirmAge()`, `rememberPlayers(players: Player[])`, `rememberSpicyEnabled(value)`.
- `loadCatalog()` → `{ categories: Category[]; cards: Card[] }` already validated; `categoriesForMode(mode)`.
- `routes` → `ageGate`, `home`, `newGame.mode`, `newGame.category`, `newGame.setup`, `play`, `results`.
