# Tasks

## 0. Setup

- [x] 0.1 Branch `feature/hu-00-game-foundation` from `main`; verify with `git branch --show-current`
- [x] 0.2 Install `expo-sqlite`, `@expo-google-fonts/fredoka`, `@expo-google-fonts/nunito`, and dev `@testing-library/react-native` with `npx expo install`
- [x] 0.3 Record the storage decision as ADR-0001 (`create-adr`) and update `docs/adr/README.md` and `docs/data-model.md` status

## 1. Game engine (TDD, pure)

- [x] 1.1 Failing tests then `game-types.ts`, `scoring.ts`, `ranking.ts` (ties share position)
- [x] 1.2 Failing tests then `escalation.ts` (rounds, points, open, restricted levels)
- [x] 1.3 Failing tests then `settings-validation.ts`
- [x] 1.4 Failing tests then `card-selection.ts` (no repeats, unseen first, ascending points, group ratio and no double group, gender targeting, pool reset)
- [x] 1.4a Failing test then group chance 0.25 so group cards are 20 % of the cards shown
- [x] 1.5 Failing tests then `render-card.ts` (current gender, `{player}`, `{partner}`, neutral group)
- [x] 1.6 Failing tests then `end-condition.ts` and `game-reducer.ts` (start, complete, refuse, swap, group interlude, end, invalid actions)
- [x] 1.7 Failing tests then actions carry `cardId`; stale actions are ignored (double tap)
- [x] 1.8 Failing tests then escalation never steps back (level floor = card just played)
- [x] 1.9 Failing test then refusal quip rendered through `renderCard` (placeholders filled)
- [x] 1.10 Move `allDifficulties` and `playerGenders` to `card-types.ts`

## 2. Device state (TDD)

- [x] 2.1 Failing tests then `device-state.ts` (empty state, tolerant parse, serialize)
- [x] 2.2 `device-storage.ts` adapter over `expo-sqlite/kv-store` with a Jest mock; `DeviceStateProvider` / `useDeviceState()` component test
- [x] 2.3 Failing tests then full saved-session validation; `GameProvider` drops a session whose card no longer ships

## 3. Content runtime

- [x] 3.1 Seed JSON for La Previa and Entre Dos (standard heat); review note marked pending human review
- [x] 3.2 Failing tests then `catalog.ts` (validator over the bundle, no errors, La Previa coverage for 10 rounds × 6 players, `categoriesForMode`)
- [x] 3.3 Coverage test counts non-targeted individual cards against turns plus swaps (30 / 24 / 24); add the missing La Previa cards

## 4. React bindings

- [x] 4.1 `GameProvider` / `useGame()` and `NewGameDraftProvider` / `useNewGameDraft()` with component tests (start, complete, persistence, draft preload, `toSettings`)
- [x] 4.3 `useGame()` dispatches against the latest state (two calls in one render chain) and sends the rendered card id
- [x] 4.2 `src/features/game/index.ts` barrel; `routes.ts` with test

## 5. App shell

- [x] 5.1 Theme tokens in `src/constants/theme.ts`, `useTheme()`; UI primitives in `src/components/ui/`
- [x] 5.2 Stack root layout with providers and fonts, entry redirect, seven placeholders; remove template screens and components; `app.json` light + splash color
- [x] 5.3 Walk the placeholder flow in the running app. The iOS Simulator is unavailable on this machine (no full Xcode), so the flow was verified on the web build (`npx expo start --web`, 375×812) with `device-storage.web.ts`; iOS run pending on a machine with Xcode

## 6. Docs and verification

- [x] 6.1 Confirm the README ownership map against the real paths
- [x] 6.2 `npm test -- --coverage` (≥ 90 % on `src/features/**`)
- [x] 6.3 `npx expo lint`
- [x] 6.4 `npx tsc --noEmit`
