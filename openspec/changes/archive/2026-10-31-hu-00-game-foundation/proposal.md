# Proposal

## Why

Six screens (HU-01 … HU-06) and the launch content (HU-07) are about to be built in parallel by independent agents. Without one shared definition of the game rules, the saved device data, the bundled catalog, and the screen flow, each screen would invent its own "current game" and the app would not hold together. Story: `docs/user-stories/hu-00-game-foundation.md` (enriched).

## What Changes

- New pure TypeScript game engine in `src/features/game/`: turn order, scoring, refusal penalty (`ceil(points / 2)`), one free swap per player, group-card interludes (~20 %), escalation by thirds (rounds or points goal) or every 5 rounds (open), card selection (no repeats, unseen first, ascending points, gender targeting, per-level pool reset), end conditions, and tie-aware ranking.
- React bindings: `GameProvider` / `useGame()` and `NewGameDraftProvider` / `useNewGameDraft()`.
- New device-state module `src/features/device/`: `DeviceState` persisted as JSON under `device.v1` with `expo-sqlite/kv-store`; `DeviceStateProvider` / `useDeviceState()`. ADR-0001 records the choice.
- Content runtime: `src/features/content/catalog.ts` (`loadCatalog`, `categoriesForMode`, `contentWarnings`) over bundled JSON in `src/features/content/catalog/` (first playable batch: La Previa and Entre Dos, standard heat).
- App shell: Stack navigator with the Prendidos flow and one placeholder per screen; 18+ redirect; typed `routes`; brand theme (light only) and Fredoka / Nunito fonts; shared UI primitives (button, screen container, card frame, level badge, placeholder screen). Expo template tabs and screens removed.
- React Native Testing Library installed with the first component tests.

## Capabilities

### New Capabilities

- `game-engine`: rules of a game session from start to ranking.
- `device-state`: what the phone remembers between launches.
- `app-shell`: screen flow, placeholders, and brand theme.

### Modified Capabilities

- `card-content`: none of its requirements change; the shipped catalog now runs through the existing validator in a test.

## Impact

- **Platforms:** iOS and Android (web keeps building but is not a target). `expo-sqlite` is a native module included in Expo Go for SDK 58; a development build is only needed if Expo Go is not used.
- **Dependencies:** `expo-sqlite`, `@expo-google-fonts/fredoka`, `@expo-google-fonts/nunito`, dev `@testing-library/react-native`, all via `npx expo install`. `app.json` gains the `expo-sqlite` plugin, light-only UI style, and brand splash color.
- **Security:** no auth, no network, no secrets. Player names and genders stay on the device. No SECURITY REVIEW NEEDED.
- **Docs:** ADR-0001, `docs/adr/README.md`, `docs/data-model.md` status (storage decided), `docs/user-stories/README.md` ownership paths confirmed.
