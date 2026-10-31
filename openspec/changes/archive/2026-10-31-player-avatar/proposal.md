# Proposal

## Why

The aligned screens show each player's cat avatar in setup, on the turn card, in the group interlude and on the podium (`docs/design/review/README.md`). `docs/brand/design-tokens.md` § Pending dependency left open where the avatar is stored; without a stored avatar, a player's cat would change between screens and between games.

## What Changes

- `Player` gains a required `avatarId: AvatarId` (the registry from `brand-art`).
- `createPlayer` gives a new player the first avatar no current player has, unless one is passed.
- Saved players (last players and the saved game) without a valid avatar get one when the device state is read, so data saved by older builds keeps working.
- `docs/data-model.md` and `docs/brand/design-tokens.md` record the decision.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-engine`: players carry an avatar, assigned without repeats when they are created.
- `device-state`: remembered players and the saved game keep each player's avatar, and older saves get one.

## Impact

- **Code:** `src/features/game/game-types.ts`, `players.ts`, `src/features/device/device-state.ts`, `src/features/setup/setup-rules.ts` (a blank row picks a free avatar), and their tests and fixtures.
- **Platforms:** all. No native change and no new dependency.
- **Security:** none. The avatar id is not personal data.
