# Proposal

## Why

The setup route is still the HU-00 placeholder that starts a game with demo players. HU-04 (`docs/user-stories/hu-04-game-setup.md`) needs the real "Setup de partida" screen so a group can enter players, order, levels, and the end condition, and a returning group can start with one tap.

## What Changes

- Replace `src/app/new-game/setup.tsx` with a thin route rendering a new `SetupScreen` from `src/features/setup/`.
- Player rows: name, gender ("Hombre" / "Mujer" / "Prefiero no decir"), "No toma" toggle; add (Amigos, up to 12) and remove (down to 2); Pareja shows exactly two rows.
- Preload the last players from the draft; two empty rows on first use; blank names block the start and the row says what is missing.
- "Barajar" shuffles the visible turn order.
- Level chips (all selected by default, never all deselected) and end-condition chips (rounds 5/10/15/20, points 100/200/300, open; default 10 rounds).
- Sticky "Empezar" starts the game through `useGame().startGame` and navigates to the turn screen.
- Hidden slot for the Sin Filtro switch in Amigos (HU-10).

## Capabilities

### New Capabilities

- `game-setup`: the screen where the group enters players, turn order, levels, and end condition before a game starts.

### Modified Capabilities

None. Engine, draft, and device-state requirements are used as they are.

## Impact

- Code: `src/app/new-game/setup.tsx`, new `src/features/setup/` (screen, components, pure helpers, copy, tests).
- No new dependencies, no native modules, no development build needed. Platforms: iOS, Android, web (same JS).
- Security: no auth, no network, no new stored data (last players are already stored by `startGame`). No security review needed.
