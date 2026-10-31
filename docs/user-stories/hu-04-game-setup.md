# HU-04 — Game setup

| Field      | Value                                              |
| ---------- | -------------------------------------------------- |
| Status     | Enriched                                           |
| Priority   | P0 — playable loop                                 |
| Depends on | HU-00                                              |
| Blocks     | HU-10 (adds the Sin Filtro switch here)            |
| Screen     | Setup de partida                                   |
| PRD        | §5.3, §5.7 (Fin de partida), §5.8, §5.10           |

## Original

### User Story

**As the** person holding the phone,
**I want** to add the players, set the turn order, and choose how the game ends on one screen,
**So that** we start playing quickly and the game is tuned to our group.

### Context

Setup is the densest screen in the app and the one with the most friction risk: names, gender, "No toma", order, levels, and end condition. The PRD mitigates that by preloading the last players and giving every option a sensible default, so a returning group can hit "Empezar" without touching anything.

### Acceptance Criteria

**Players**

- [x] The screen opens with the players from the last game already filled in (name, gender, "No toma"). On a first use it shows two empty player rows.
- [x] Each player has a name, a gender choice among "Hombre", "Mujer", "Prefiero no decir", and a "No toma" toggle. Selected toggles use the dark ink style.
- [x] The user can add a player (up to 12 in Amigos) and remove a player (down to 2). In Pareja the screen shows exactly two players and no add/remove.
- [x] A player without a name cannot start the game; the row shows what is missing.

**Turn order**

- [x] Players play in the order shown. A "Barajar" button shuffles the order and the new order is visible before starting.

**Levels**

- [x] All three levels (Suave, Picante, Prendido) are selected by default with their level colors. The user can deselect levels but never all of them.

**End of game**

- [x] The default end is "Por rondas: 10". The user can choose rounds (5, 10, 15, 20), a points goal (100, 200, 300), or "Abierta".

**Start**

- [x] A large "Empezar" button starts the game and goes to the turn screen; the players entered become the "last players" remembered for the next setup.
- [x] The screen is usable one-handed and the "Empezar" button is always reachable (sticky at the bottom while the player list scrolls).
- [x] The layout leaves a place for the "Retos Sin Filtro" switch under the options in Amigos mode (HU-10), hidden for now.

### Out of Scope

- Sin Filtro switch, its lock, and its paywall (HU-10).
- Alternative penalties themselves (HU-11) — "No toma" is stored here, applied later.
- Saving named player groups or profiles (not in MVP).

### Business Value

Preloading and defaults cut setup to one tap for returning groups, which protects retention after the first night.

## Enhanced

### Ownership (from `docs/user-stories/README.md`)

| Story | Route file (replaces the placeholder) | Feature folder        | Also owns                                                                |
| ----- | ------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| HU-04 | `src/app/new-game/setup.tsx`          | `src/features/setup/` | Its tests, OpenSpec change `hu-04-game-setup`, optional `.maestro/` flow |

### Technical approach

- **State:** the draft (`useNewGameDraft()`) is the only state for players, levels, and end condition; every edit calls `setPlayers` / `setSelectedDifficulties` / `setEndCondition`. The screen keeps only UI state (whether the user already tried to start, so missing names show).
- **Guard:** when `isReadyForSetup` is false the screen redirects with `router.replace(routes.newGame.mode)` and renders nothing.
- **Preparing players on open:** pure `preparePlayersForMode(players, mode, createId)`: couple mode keeps the first two; fewer than two players are padded with empty rows (`createPlayer({ name: '', gender: 'undisclosed' }, createLocalId)`). Applied once on mount when it changes the list.
- **Rows:** `TextInput` name (max 20 characters), gender chips "Hombre" / "Mujer" / "Prefiero no decir" (`accessibilityRole="radio"`), "No toma" toggle (`accessibilityRole="checkbox"`, checked = `drinks: false`, dark `ink` fill with white text). A remove button per row only while above the mode minimum; "Agregar jugador" only in Amigos below 12 (`playerLimitsByMode`).
- **Missing name:** pressing "Empezar" with a blank name does not start; each blank row shows "Falta el nombre" in `negative`, plus a summary above the button.
- **Turn order:** "Barajar" calls pure `shufflePlayers(players, random)` (Fisher–Yates; when the result equals the input order it rotates by one, so the change is always visible).
- **Levels:** three chips with `LevelColors` fills when selected; pure `toggleDifficulty(selected, difficulty)` never returns an empty list and keeps `allDifficulties` order.
- **End condition:** chips "Rondas" 5/10/15/20, "Puntos" 100/200/300, and "Abierta"; the selected chip is `ink`. The default comes from the draft (`rounds: 10`).
- **Start:** names are trimmed and `startGame({ ...toSettings(), players })` runs; an empty error list → `router.push(routes.play)` (`startGame` already remembers the last players). Other errors show a generic message.
- **Layout:** `ScreenContainer` (no scroll) holding a `ScrollView` with the form and the sticky "Empezar" button under it. `SpicySwitchSlot` (renders `null`) sits under the options in Amigos only, for HU-10.

### Files

- `src/app/new-game/setup.tsx`: thin route rendering `SetupScreen`.
- `src/features/setup/`: `setup-screen.tsx`, `player-row.tsx`, `option-chip.tsx`, `spicy-switch-slot.tsx`, `setup-rules.ts` (pure helpers), `copy.ts` (Spanish, usted).
- Tests: `src/features/setup/__tests__/setup-rules-test.ts`, `setup-screen-test.tsx`.

### Definition of done

- Every acceptance criterion covered by a test (RNTL v14 async APIs); `npm test` green with global coverage ≥ 90 %; `npx expo lint` and `npx tsc --noEmit` clean.
- No shared file edited; needs recorded in `design.md`.
- Non-functional: no network, no new dependencies, touch targets ≥ 48 pt (`TouchTarget.minimum`), accessibility labels on every control, no hex literals.
