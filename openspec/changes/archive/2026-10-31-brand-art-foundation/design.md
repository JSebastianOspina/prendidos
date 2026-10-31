# Design

## Context

- **Images today:** `assets/images/` still holds the Expo template images (`react-logo*`, `expo-logo`, `tabIcons/`, `tutorial-web`). `app.json` points `ios.icon` at the template Icon Composer bundle `assets/expo.icon`. The Android adaptive icon foreground is the Expo template.
- **Image component:** `expo-image ~58.0.18` is installed. In SDK 58 its `Image` takes `source={require(...)}`, `contentFit="contain"`, and `accessibilityLabel`, which becomes `alt` on web ([docs](https://docs.expo.dev/versions/v58.0.0/sdk/image/)). `jest-expo` has no explicit mock for it.
- **App config (SDK 58):**
  - `ios.icon` accepts a 1024 × 1024 opaque PNG path or a `.icon` folder.
  - `android.adaptiveIcon` takes `foregroundImage`, `backgroundColor`, and `monochromeImage`.
  - The `expo-splash-screen` plugin takes `image`, `imageWidth`, `backgroundColor`, and `resizeMode` ([app config](https://docs.expo.dev/versions/v58.0.0/config/app/), [splash and icon guide](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)).

## Goals / Non-Goals

**Goals:**

- One place that knows which art files exist.
- Two primitives that screens use without importing image files directly.
- Native identity (icon and splash) replaced in config only.

**Non-Goals:**

- Any screen layout change; each screen's alignment is its own follow-up change, following `docs/design/review/README.md`.
- Storing the avatar on `Player` or in device state.
- Vector art, the crown, the ID-card prop, flame-size variants, and animation.

## Decisions

1. **Crops come from the 2000 px drafts, with transparent backgrounds**, made by a one-off script (`scripts/crop-brand-art.py`, Pillow, run outside the app). The script flood-fills the background from the border, so the white cat interior stays opaque, and then drops small fragments of neighbouring cells. Output sizes:
   - avatars: 256 px square, shown at most at 64 pt, so @3x is covered by 192 px;
   - faces: 512 px;
   - pose: 768 px tall;
   - icon cat: 1024 px.
   - *Alternative:* reuse the 192–520 px proposal crops. Rejected: they are too small for @3x, they have white backgrounds, and they were never meant to ship.
   - The script is kept so the art can be regenerated once the drafts are revised.
2. **The avatar registry is pure TypeScript in `src/features/game/avatars.ts`**: `AvatarId` (`'avatar-01'` … `'avatar-12'`), `avatarIds`, `pickFreeAvatar(taken)`, and `nextFreeAvatar(current, taken)`. The art map (`require` calls) lives in the UI layer (`src/components/ui/brand-art.ts`), so the engine stays free of React Native assets and the follow-up change can put `AvatarId` on `Player` without importing images. *Alternative:* a numeric index. Rejected because string ids survive reordering of the art and read clearly in saved device state.
3. **`Mascot` and `PlayerAvatar` use `expo-image`** with `contentFit="contain"`. `PlayerAvatar` draws the frame from the design tokens: `surface` background, 2 px `ink` border, a radius of a quarter of the side, and about 8 % padding. The swap badge and the press behavior stay out of the primitive: setup owns them, which keeps the primitive display-only.
4. **Native identity:**
   - `icon` and `ios.icon` both use `assets/images/icon.png`, the opaque red 1024 px draft. The `assets/expo.icon` bundle is deleted.
   - The Android adaptive foreground is the cat at about 59 % of a 1024 canvas, inside the 66/108 safe zone, on `backgroundColor` `#C01E1B`. `backgroundImage` is removed.
   - The monochrome image is the cat silhouette.
   - The splash image is the transparent cat, `imageWidth` 200, on `#C01E1B`.
   - The favicon is a 48 px version of the icon.
5. **Unused template images are removed** (`react-logo*`, `expo-logo`, `expo-badge*`, `tabIcons/`, `tutorial-web`, `logo-glow`, `android-icon-background`) after checking that nothing references them.

## Risks / Trade-offs

- [`expo-image` may not render under Jest] → Try it first. If it fails, mock it in the root `__mocks__/` as a plain `View` with the accessibility label kept, so tests can still query by label.
- [The white halo of antialiased edges shows on `brandRed`] → It is barely visible at screen sizes. The vector redraw removes it.
- [Interim AI art ships to stores] → The brand docs record it as interim, and HU-15 / the vector redraw replaces it before launch marketing.
