# HU-00 — Game foundation: rules, saved data, launch content, and screen flow

| Field      | Value                                                            |
| ---------- | ---------------------------------------------------------------- |
| Status     | Ready for enrichment                                             |
| Priority   | P0 — blocks every other story                                    |
| Depends on | `card-content-model` (archived, merged into `main` in PR #6)     |
| Blocks     | HU-01 … HU-15                                                    |
| Screen     | None (transversal). Leaves an empty placeholder for every screen |
| PRD        | §5 (whole section), §5.10, §6.1, §9                              |
| Builds on  | `src/features/content/` (types, text rendering, validator) and `docs/data-model.md`, both on `main` |

## User Story

**As the** Prendidos team,
**I want** the game rules, the data the phone remembers, the launch content, and the order of the screens defined once in a single place,
**So that** every screen built afterwards behaves the same way, can be built by different people at the same time, and a partida plays identically no matter which screen touches it.

## Context

The repo today has the card content model and its validator, but no game rules, no saved data, no real cards, and the screens are still the Expo template. Six screens are about to be built in parallel by independent agents; if each one invents its own notion of "the current game" they will contradict each other and the app will not hold together. This story is the shared ground everyone stands on and must land before any screen work starts.

## Acceptance Criteria

**Game rules (observable through the rules alone, with no screen yet)**

- [ ] A game can be started from a complete setup (mode, category, players in turn order, selected levels, end condition) and reports the first player and the first card.
- [ ] Completing an individual card adds its points to the current player and passes the turn to the next player in order.
- [ ] Refusing an individual card subtracts half its points rounded up (7 → −4), reports the penalty to show, and passes the turn. Scores may go negative.
- [ ] Swapping a card gives the same player a different card with no penalty, and that player cannot swap again in the same game.
- [ ] A group card ("Todos los que…", "Yo nunca") appears as an interlude: no points, nobody's turn is consumed, and the next turn belongs to the player who was due anyway. Group cards are about 20 % of what comes out.
- [ ] No card repeats within a game. Cards never seen on this phone come out before cards already seen. When a level runs out of cards, its pool resets.
- [ ] Levels escalate with progress: with all three levels and a game by rounds, the first third is Suave, the second Picante, the last Prendido. By points goal, thirds are measured against the goal. With restricted levels, only the chosen levels are walked in that order. Within a level, cards come out from fewer to more points.
- [ ] A card aimed at a gender comes out only when a player of that gender exists other than the current player; otherwise it is skipped. A player marked "Prefiero no decir" is never picked by such a card.
- [ ] Card text speaks to the current player and agrees with their gender; "Prefiero no decir" gets neutral wording. Where the text mentions another player, a random other player's name appears; in Pareja it is the partner. Group cards never mention a specific player and always read neutral.
- [ ] A game by rounds ends when the last round completes. A game by points goal ends when the round in which someone reached the goal is completed. An open game ends when the group ends it. Any game can be ended early.
- [ ] The final ranking orders players by score; tied players share the same position.
- [ ] While a game is still in progress, the current level, round, points, and whose turn it is can be read at any moment.

**Data the phone remembers**

- [ ] The phone remembers whether the 18+ confirmation was accepted, the last players (name, gender, "No toma"), the cards already seen, the last Sin Filtro choice, and the game in progress, and still remembers them after the app is closed and reopened.
- [ ] Nothing is remembered about past games (no history, no totals, no wins).
- [ ] Everything works with the phone offline.

**Launch content**

- [ ] The app ships with real cards for the two launch categories (La Previa for Amigos, Entre Dos for Pareja) in all three levels, enough to play a 10-round game with 6 players in La Previa without the pool resetting. HU-07 completes the catalog; this story brings the first playable batch.
- [ ] Every shipped card passes the content validator with no errors; a card with an error never reaches the app, and warnings are listed for the content reviewer.
- [ ] For this story all content is treated as unlocked. Locks and purchases arrive with HU-08 and HU-09.

**Screen flow**

- [ ] The app opens into the Prendidos flow (18+ → Inicio → Modo → Categoría → Setup → Turno → Ranking) and the Expo template screens are gone.
- [ ] Each screen exists as an empty placeholder that shows its name, so another story can replace it without touching anything outside that screen.
- [ ] The app looks like Prendidos from the first placeholder: light cream background, ink outlines, flame palette, and the brand typography from the design tokens.
- [ ] Large buttons, large readable text, and portrait only.

**Builds on what exists, no duplicates**

- [ ] The card, category, level, mode, and gender vocabulary is the one already in `src/features/content/card-types.ts`; no second definition appears anywhere.
- [ ] Card text for a player is produced through the existing `renderGenderedText`; no second text renderer exists.
- [ ] The shipped content uses the same catalog shape the existing validator accepts, and the validator runs over it in a test.
- [ ] Game, player, settings, session, and device-state entities carry the names and fields of `docs/data-model.md`.

**Team enablement**

- [ ] A written ownership map says which files belong to which screen story and what is shared and read-only (see `README.md` in this folder).
- [ ] The storage choice is recorded as an ADR.

## Out of Scope

- Any real screen content beyond placeholders (HU-01 … HU-06).
- Purchases, locks, paywalls, Sin Filtro switch (HU-08, HU-09, HU-10).
- Alternative penalties for players who don't drink (HU-11) — for now they see the drink penalty.
- Resuming an interrupted game from the home screen (HU-12) — the game is saved, the button comes later.
- Analytics (HU-13), responsible-drinking messages (HU-14), illustrations and mascot (HU-15).

## Business Value

Lets six screens be built in parallel within the hour without contradicting each other, and guarantees the partida follows the PRD rules everywhere, which is the whole product promise.

---

## Original

The sections above are the original product story (written with `write-us`).

## Enhanced (enrich-us, technical detail)

Status after enrichment: **Ready for proposal** (OpenSpec change `hu-00-game-foundation`).

### Modules and files

| Area | Path | Contents |
| ---- | ---- | -------- |
| Game types | `src/features/game/game-types.ts` | `Player`, `GameSettings`, `EndCondition`, `GameSession` (fields exactly as `docs/data-model.md`), `GameState`, `TurnOutcome`, `RankingEntry`, `RenderedCard` |
| Escalation | `src/features/game/escalation.ts` | `orderedDifficulties(selected)`, `currentDifficultyFor(settings, session)` — thirds of rounds / of the points goal; open games step up every 5 rounds |
| Card selection | `src/features/game/card-selection.ts` | `drawCard({ cards, settings, session, seenCardIds, difficulty, random, wantGroupCard })` — category + heat filter, no repeats, unseen first, ascending points, gender eligibility, per-level pool reset |
| Scoring and end | `src/features/game/scoring.ts`, `src/features/game/end-condition.ts`, `src/features/game/ranking.ts` | `refusalPenaltyPoints(points) = ceil(points / 2)`, `isGameOver`, `rankPlayers` (ties share the position: 1, 1, 3) |
| Reducer | `src/features/game/game-reducer.ts` | Pure `gameReducer(state, action, context)`: `start`, `complete`, `refuse`, `swap`, `nextAfterGroupCard`, `end` |
| Card copy | `src/features/game/render-card.ts` | Renders headline, body and penalty quip through `renderGenderedText` (current player's gender; `{player}` = random other eligible player; `{partner}` in couple mode; group cards neutral) |
| Settings validation | `src/features/game/settings-validation.ts` | `validateSettings(settings)` — 2–12 players in `friends`, exactly 2 in `couple`, non-empty difficulties, category of the mode |
| React bindings | `src/features/game/game-provider.tsx`, `src/features/game/new-game-draft.tsx`, `src/features/game/index.ts` | `GameProvider` / `useGame()`, `NewGameDraftProvider` / `useNewGameDraft()`; barrel exports types and hooks only |
| Device state | `src/features/device/device-state.ts`, `device-storage.ts`, `device-state-provider.tsx` | `DeviceState`, versioned key `device.v1`, tolerant parse, `expo-sqlite/kv-store` adapter (sync API), `DeviceStateProvider` / `useDeviceState()` |
| Content runtime | `src/features/content/catalog.ts`, `src/features/content/catalog/*.json` | `loadCatalog()` (validated with `validateCards` / `hasErrors`, throws on errors), `categoriesForMode(mode)`, `contentWarnings()` |
| Navigation | `src/app/_layout.tsx`, `src/features/navigation/routes.ts` | Stack with `Stack.Protected`: every route but the 18+ gate needs `ageConfirmedAt`; typed `routes` |
| Placeholders | `src/app/age-gate.tsx`, `index.tsx`, `new-game/mode.tsx`, `new-game/category.tsx`, `new-game/setup.tsx`, `play.tsx`, `results.tsx` | Each renders `PlaceholderScreen` with its name and a "Siguiente" button to the next route |
| Shared UI | `src/components/ui/button.tsx`, `screen-container.tsx`, `card-frame.tsx`, `level-badge.tsx`, `placeholder-screen.tsx`; `src/constants/theme.ts` | Clay style from `docs/brand/design-tokens.md`; Fredoka + Nunito loaded in the root layout |

Template files removed: `src/app/explore.tsx`, `src/components/app-tabs*.tsx`, `animated-icon*`, `hint-row.tsx`, `web-badge.tsx`, `external-link.tsx`, `ui/collapsible.tsx`, `themed-*` and `src/hooks/use-color-scheme*` when unused.

### Rules fixed in this story

- **Turn order:** after a completed or refused individual card the turn passes to `currentPlayerIndex + 1`; wrapping to 0 completes a round (`currentRound + 1`).
- **Group interlude:** each draw after an individual card is a group card with probability 0.25 (20 % of the cards shown) (injected `random`), never two group cards in a row, and only when an unplayed group card exists at the level. Group cards do not change `currentPlayerIndex`.
- **Escalation:** `index = floor(progress × n)` over the ordered selected levels, clamped to `n − 1`. Rounds: `progress = (currentRound − 1) / rounds`. Points: `progress = max(score) / target`, never below the level of the card just played. Open: `index = floor((currentRound − 1) / 5)`.
- **Selection order within a level:** unplayed in this game → unseen on this device first → ascending points (group cards: random). When no eligible unplayed individual card is left at the level, that level's ids leave `playedCardIds` (the pool resets).
- **Gender targeting:** a card with `targetGender` is eligible only when another player with that exact gender exists; that player fills `{player}`. `undisclosed` is never picked.
- **Refusal:** `scores[player] -= ceil(points / 2)`; `lastOutcome` carries the card's `DrinkPenalty` and rendered quip for HU-05. Non-drinkers still see the drink penalty until HU-11.
- **Stale actions:** every action carries the id of the card on screen; a second tap on an answered card is ignored.
- **Swap:** individual cards only, once per player per game (`swapsUsed[playerId]`); draws a different card at the same level with no score change.
- **End:** rounds → after the last round completes; points → when a round completes and a score ≥ target; open → `endGame()` only. `endGame()` works at any time.
- **Persistence:** `activeSession` saved on every change; cleared by `clearFinishedGame()`. Every shown card id is appended to `seenCardIds`. Nothing else about past games is stored.
- **Current card:** the last element of `playedCardIds` is the card on screen, so the session alone is enough to resume (HU-12).

### Storage

`expo-sqlite/kv-store` (ADR-0001). One JSON value under `device.v1`; unknown or corrupt data falls back to the empty state. Offline by design: no network calls.

### Non-functional

- No personal data leaves the device; no analytics in this story.
- Pure engine modules import nothing from React or Expo; 100 % branch target for `src/features/game/*.ts` pure modules, ≥ 90 % overall on `src/features/**`.
- Light theme only, portrait only, touch targets ≥ 48 pt, Fredoka/Nunito.

### Definition of done

`npm test -- --coverage` ≥ 90 % on `src/features/**`, `npx expo lint` and `npx tsc --noEmit` clean, the app shows the placeholder flow in the iOS Simulator, ADR-0001 recorded, README ownership table matches the real paths.
