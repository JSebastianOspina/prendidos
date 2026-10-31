# Design

## Context

`Player` is `{ id, name, gender, drinks }`, and `parseDeviceState` drops any player that does not match it exactly. The avatar registry (`AvatarId`, `pickFreeAvatar`) is pure TypeScript in `src/features/game/avatars.ts`.

## Decisions

1. **The avatar is required on `Player`, not optional.** Screens can always render it with no fallback branches. *Alternative:* an optional field. Rejected: every screen would need a fallback, and two screens could pick different fallbacks.
2. **The migration happens when the device state is read.** A player whose other fields are valid but whose `avatarId` is missing or unknown is kept, and gets `pickFreeAvatar` against the players already read from the same list (last players, or the saved game's players). *Alternative:* drop such players, which follows the current rule for malformed data. Rejected: it would silently forget everyone's last players after an update.
3. **`createPlayer(newPlayer, createId, takenAvatars = [])`.** Callers that know the current players pass their avatars. Setup's blank row uses this. Changing an avatar in setup is setup's own UI work, which uses `nextFreeAvatar`.
4. **Duplicate avatars are not a validation error at game start.** Setup prevents them. Rejecting a game for a cosmetic clash would block play for no gain.

## Risks / Trade-offs

- [Two remembered players could share an avatar after a manual edit of storage] → This is cosmetic only, and the next setup change fixes it.
