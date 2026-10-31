# Tasks

## 1. Brand art files

- [x] 1.1 Add `scripts/crop-brand-art.py` and generate the transparent PNGs into `assets/images/brand/` (`mascot-face-{wink,laugh,relaxed,smirk}.png`, `mascot-pose-pointing.png`, `mascot-icon-cat.png`, `avatar-01.png` … `avatar-12.png`); verify by viewing a contact sheet on `background` and `brandRed`
- [x] 1.2 Replace the native identity images (`icon.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`, `splash-icon.png`, `favicon.png`) and update `app.json` (`ios.icon`, adaptive icon without `backgroundImage`, splash `imageWidth`); remove `assets/expo.icon` and the unused template images after `grep` shows no references; verify with `npx expo config --type public` and the web build favicon

## 2. Avatar registry

- [x] 2.1 Write failing tests for `avatarIds` (12, brand order), `pickFreeAvatar` (first free, all-taken fallback) and `nextFreeAvatar` (skips taken, wraps) in `src/features/game/__tests__/avatars-test.ts`, then implement `src/features/game/avatars.ts` and export it from the barrel; verify with `npm test -- avatars`

## 3. UI primitives

- [x] 3.1 Write failing tests for `Mascot` (label, size, level → face) and `PlayerAvatar` (square frame, label with player name), then implement `src/components/ui/brand-art.ts`, `mascot.tsx` and `player-avatar.tsx`; verify with `npm test -- ui-primitives`

## 4. Docs

- [x] 4.1 Update `docs/brand/README.md` and `docs/brand/design-tokens.md` (interim assets allowed in the app, file locations, crop script) and keep `docs/design/review/README.md`; verify links resolve

## 5. Verification

- [x] 5.1 Run `npm test` (coverage ≥ 90 %), `npx expo lint`, `npx tsc --noEmit`; render `Mascot` and `PlayerAvatar` on the web build to confirm the images load

## Workflow follow-up

- `adversarial-review`, `/opsx:archive`, commit, PR, merge.
- Then the screen alignment changes from `docs/design/review/README.md`, and the change that stores the avatar on `Player`.
