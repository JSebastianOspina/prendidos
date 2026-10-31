# Proposal

## Why

The home route still shows the HU-00 placeholder. The group needs a branded hub with one clear way to start a game, which shortens time-to-first-card (story `docs/user-stories/hu-02-home.md`).

## What Changes

- Replace the `src/app/index.tsx` placeholder with the Inicio screen: Prendidos logo tile and wordmark, a one-line Colombian Spanish tagline, and a large primary "Nueva partida" button in the lower half.
- "Nueva partida" clears the previous new-game draft and opens mode selection.
- Reserve layout regions (rendering nothing) for "Continuar partida" (HU-12) and "Restaurar compras" (HU-08).

## Capabilities

### New Capabilities

- `home-screen`: the Inicio hub shown after the 18+ confirmation — brand header, tagline, and the entry point to a new game.

### Modified Capabilities

None. `app-shell`'s placeholder requirement still holds for screens not yet built.

## Impact

- Code: `src/app/index.tsx`, new `src/features/home/` (screen, copy, tests). No shared files change.
- Platforms: iOS, Android, and web share the same JS screen; no native modules, no new development build.
- Security: no auth/authz impact. The route stays behind the existing age guard in the root layout; this change does not touch it.
