# Tasks

## 1. Engine

- [x] 1.1 Update the player tests and fixtures first: `createPlayer` assigns the first free avatar, honors a given one, and accepts the taken list. Then add `avatarId` to `Player` and implement it in `players.ts`. Verify with `npm test -- players`.

## 2. Device state

- [x] 2.1 Add failing tests for keeping avatars, filling a missing or unknown avatar in last players and in the saved game without repeats, and still dropping players with bad core fields. Then implement the normalization in `device-state.ts`. Verify with `npm test -- device-state`.

## 3. Setup rows

- [x] 3.1 Make `createEmptyPlayer` / `preparePlayersForMode` give new rows a free avatar (test first in the setup-rules tests). Verify with `npm test -- setup-rules`.

## 4. Docs and checks

- [x] 4.1 Add `avatarId` to `Player` in `docs/data-model.md` and resolve § Pending dependency in `docs/brand/design-tokens.md`. Run `npm test` (coverage ≥ 90 %), `npx expo lint`, and `npx tsc --noEmit`.
