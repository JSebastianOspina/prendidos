# Design

## 1. Layering

```
src/app/*.tsx (routes, thin)  →  src/components/ui/*  (primitives)
        │
        ▼
useGame() / useNewGameDraft() / useDeviceState()   (React bindings)
        │
        ▼
pure modules: game-reducer, card-selection, escalation, scoring, end-condition, ranking, render-card, settings-validation
        │
        ▼
src/features/content (types, renderGenderedText, validateCards) + catalog JSON
```

Pure modules import nothing from React or Expo. Randomness is injected (`random: () => number`, `createId: () => string`, `now: () => string`) so every rule is deterministic in tests.

## 2. Types (`game-types.ts`)

Entity names and fields follow `docs/data-model.md` verbatim: `Player { id, name, gender, drinks }`, `GameSettings`, `EndCondition` (`rounds` 5|10|15|20, `points` 100|200|300, `open`), `GameSession { id, settings, status, currentRound, currentPlayerIndex, scores, playedCardIds, swapsUsed, couplePaywallShown, startedAt }`.

Engine-only additions (not persisted as entity fields):

- `GameState = { session: GameSession; mentionedPlayerId?: string; lastOutcome?: TurnOutcome }`.
- `TurnOutcome = { kind: 'completed' | 'refused'; playerId; pointsDelta; penalty?: DrinkPenalty; penaltyQuip?: string }`.
- `RankingEntry = { player; score; position }`.
- `RenderedCard = { card; headline?: string; body: string; penaltyQuip?: string }`.

The card on screen is the last element of `playedCardIds`, so `GameSession` alone is enough to resume (HU-12); `mentionedPlayerId` is re-picked on resume.

## 3. Escalation

Levels are the selected ones, ordered easy → medium → hard. `index = min(n − 1, floor(progress × n))`:

- rounds: `progress = (currentRound − 1) / rounds` (10 rounds, 3 levels → rounds 1–4 easy, 5–7 medium, 8–10 hard).
- points: `progress = max(scores) / target` (negative scores count as 0).
- open: `index = min(n − 1, floor((currentRound − 1) / 5))`.

## 4. Card selection

`drawCard` filters the catalog to the session category, `heat: standard` (plus `spicy` only when `spicyEnabled`), and the current level. Then:

1. Kind: group with probability 0.2 when the previous card was not a group card and an unplayed eligible group card exists; otherwise individual.
2. Eligibility: not in `playedCardIds`; when `targetGender` is set, some other player has exactly that gender.
3. Preference: unseen on this device first; individual cards by ascending `points`, ties and group cards by `random`.
4. Reset: if no eligible unplayed individual card exists, that level's ids are removed from `playedCardIds` (except the card being replaced) and selection retries; if the level has no eligible card at all, the engine falls back to any eligible card of the category.
5. `{player}`: a random other player (of `targetGender` when set; never `undisclosed` for targeted cards). Couple mode: `{partner}` is the other player.

## 5. Reducer actions

| Action | Effect |
| ------ | ------ |
| `start(settings)` | validates settings, new session (`currentRound 1`, index 0, zero scores), draws first card |
| `complete` | individual only; `+points`, outcome, advance turn, end check, draw |
| `refuse` | individual only; `−ceil(points/2)`, outcome with penalty, advance, end check, draw |
| `swap` | individual only, once per player; draws another card at the same level |
| `nextAfterGroupCard` | group only; draws for the same player |
| `end` | `status: finished` |

Advance: `index + 1`; wrap → round + 1. End: rounds → wrap after round `rounds`; points → wrap and some score ≥ target. When finished, no card is drawn and `currentRound` stays at the last played round. Invalid actions return the same state (no throw) so a double tap cannot corrupt a game.

## 6. Device state

`DeviceState { ageConfirmedAt?, lastPlayers, seenCardIds, lastSpicyEnabled, activeSession? }` stored as one JSON string under key `device.v1` through `expo-sqlite/kv-store` (sync API: `getItemSync` / `setItemSync`), wrapped in `device-storage.ts`. `parseDeviceState` returns the empty state for missing, corrupt, or wrongly-shaped data. Tests mock `expo-sqlite/kv-store` with an in-memory map. See ADR-0001.

## 7. Providers

`DeviceStateProvider` (root) → `GameProvider` (reads catalog + device state, persists `activeSession` and `seenCardIds`) → `NewGameDraftProvider` (preloaded from `lastPlayers` / `lastSpicyEnabled`; defaults: all three levels, 10 rounds). `startGame` also calls `rememberPlayers` and `rememberSpicyEnabled`.

## 8. App shell

- Stack (`expo-router` `Stack`, `headerShown: false`), routes: `age-gate`, `index` (home), `new-game/mode`, `new-game/category`, `new-game/setup`, `play`, `results`.
- Entry redirect: `index` redirects to `age-gate` when `ageConfirmedAt` is missing (via `<Redirect>`), so HU-01/HU-02 own their screens.
- Placeholders render `PlaceholderScreen` (title + "Siguiente"), the play placeholder starts a demo game through `useGame()`.
- Theme: `Colors`, `Fonts`, `Radius`, `Spacing`, `Shadow` tokens from `docs/brand/design-tokens.md`; `useTheme()` returns the light palette. `app.json`: `userInterfaceStyle: light`, splash `#C01E1B`.
- Fonts: `useFonts` from `@expo-google-fonts/fredoka` / `nunito`; splash held until loaded.

Expo APIs checked against https://docs.expo.dev/versions/v58.0.0/ (sqlite kv-store, router Stack/Redirect, font).
