# Proposal

## Why

The "Modo" and "Categoría" screens are still HU-00 placeholders that always pick Amigos and the first category. Players need to choose Amigos or Pareja and then a category of that mode so the cards fit who is in the room (HU-03, PRD §5.2, §6.1, §7.1).

## What Changes

- Replace the `new-game/mode` placeholder with a mode picker: two large options, Amigos (2–12 players, `primary` accent) and Pareja (exactly 2, `couple` accent), each with a one-line tone description.
- Replace the `new-game/category` placeholder with a category list filtered by the chosen mode (names and descriptions from the content catalog), as large cards with a hidden slot for a future lock badge (HU-09).
- Choosing a mode stores it in the new-game draft and opens the category list; choosing a category stores it and opens the setup screen. Back controls return to the previous screen; the category screen without a mode sends the user to the mode screen.
- All copy in one Spanish (usted) copy file in `src/features/category-picker/`.

## Capabilities

### New Capabilities

- `category-picker`: choosing the game mode and a category of that mode before the setup.

### Modified Capabilities

None. `app-shell`'s placeholder scenario already covers "a screen story has not replaced its placeholder yet".

## Impact

- Code: `src/app/new-game/mode.tsx`, `src/app/new-game/category.tsx` (thin routes), new `src/features/category-picker/` (screens, card, copy, tests).
- Reads only: `useNewGameDraft()` and `playerLimitsByMode` (`@/features/game`), `categoriesForMode` (`@/features/content/catalog`), `routes`, theme tokens, `components/ui`.
- Platforms: iOS, Android, web (JavaScript only). No new dependency, no native module, no new development build.
- Security: no auth, no data leaves the device, nothing persisted. Age gating is untouched (both routes stay inside the root layout's protected group). No security review needed.
