# Proposal

## Why

The first playable build ships with no mascot, no player avatars, and the Expo template app icon and splash, while the visual proposal (`docs/design/prototype/`) puts the mascot and the avatars on almost every screen. The product owner asked (2026-10-31) to use the AI-draft art in the app now instead of waiting for the vector redraw, so every screen alignment change needs one shared, tested way to show that art.

## What Changes

- Add interim brand art in `assets/images/brand/`: four mascot faces (wink, laugh, relaxed, smirk), the pointing pose, the app-icon cat, and the 12 player avatars. All are transparent PNGs cropped from the 2000 px drafts in `docs/brand/references/`.
- Add a pure avatar registry, `src/features/game/avatars.ts`: the `AvatarId` type, the ordered `avatarIds` list, and helpers to pick a free avatar and to cycle to the next free one. Storing the avatar on `Player` is a separate change.
- Add two UI primitives in `src/components/ui/`:
  - `Mascot`: shows one mascot art at a given size with a Spanish accessibility label. It also maps each level to its mascot face (Suave relaxed, Picante smirk, Prendido laugh).
  - `PlayerAvatar`: shows one avatar in the square outlined frame from the design tokens. It is never cropped to a circle.
- Replace the Expo template icons and splash in `app.json` with the Prendidos cat on `brandRed`: the app icon, the iOS icon, the Android adaptive icon (cat inside the safe zone, plus a monochrome layer), the splash, and the web favicon.
- Docs:
  - Update `docs/brand/README.md` and `docs/brand/design-tokens.md`: AI drafts may ship as **interim** assets until the vector redraw, replacing "must never ship".
  - Add `docs/design/review/`, the screen-by-screen alignment review that the follow-up screen changes implement.
- No screen changes in this change.

## Capabilities

### New Capabilities

- `brand-art`: the mascot and player avatar art the app can show, how a screen asks for it (by art name, level, or avatar id), how avatars are picked without repeats, and the app icon and splash identity.

### Modified Capabilities

None.

## Impact

- **Platforms:** iOS, Android, and web.
- **Native config:** the icon and splash changes only take effect in a new development or store build; Expo Go and the web build pick up the in-app images right away.
- **Code:**
  - New: `src/components/ui/mascot.tsx`, `src/components/ui/player-avatar.tsx`, and `src/features/game/avatars.ts`, plus tests for each.
  - Changed: `app.json`, and the image files in `assets/images/`.
  - Removed: unused Expo template images.
- **Dependencies:** none new; `expo-image` is already installed.
- **Security:** no auth or data impact, so no security review is needed.
- **Risks:** AI-generated art has weak copyright protection and the flame is emoji-like. Both are already tracked in `docs/brand/README.md` § Known Issues and are accepted as interim.
