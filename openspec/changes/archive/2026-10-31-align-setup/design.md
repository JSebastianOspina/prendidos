# Design

## Context

`SetupScreen` (`src/features/setup/setup-screen.tsx`) reads the draft through `useNewGameDraft()` and starts through `useGame()`. Pure rules live in `setup-rules.ts`. Players already carry `avatarId`; `nextFreeAvatar` and `createEmptyPlayer(createId, players)` exist. The proposal source is `docs/design/prototype/setup.dc.html`. Only `src/features/setup/**`, the route file, and this change may be edited.

## Goals / Non-Goals

**Goals:** match the proposal layout with existing tokens and primitives (`Button`, `AppText`, `PlayerAvatar`, `ScreenContainer`); keep every existing rule; work at 375 × 667 (scroll area plus a fixed start button).

**Non-Goals:** the Sin Filtro switch (HU-10), monetization, a sheet or modal component, new icons or dependencies, changes to shared code.

## Decisions

1. **Collapse rule.** Rows at index 0 and 1 are always expanded. A row at index ≥ 2 is expanded only when its player id equals `expandedPlayerId` (screen state, one id at most). Tapping a summary sets `expandedPlayerId` to that player, collapsing the previous one. "+ Agregar jugador" sets it to the new player so the name can be typed at once. Removing or shuffling keeps the id; if that player moves into the first two rows it is simply expanded there. The rule is a pure function `isRowExpanded(index, playerId, expandedPlayerId)` in `setup-rules.ts`. Couple mode (exactly 2 players) never collapses.
   *Alternative:* one grouped row ("Caro · Mujer + 2 más") as in the render. Rejected: it hides players behind one tap target and gives no per-player remove; one summary row per player still keeps the list short (≈ 60 pt each).
2. **Summary text.** `"{name} · {gender}"`; the gender part is left out for "Prefiero no decir", and " · No toma" is added when the player does not drink. A blank name shows "Jugador N". After a failed start, a blank collapsed row also shows "Falta el nombre" in `negative`.
3. **Remove control.** Expanded rows put a 48 × 48 outlined "×" button at the end of the gender line (the name line has no room at 375 pt next to the avatar and "No toma"); summary rows put it at their right end. Labels stay positional ("Quitar al jugador N").
4. **Avatar button.** A `Pressable` (role `button`) wrapping a 56 pt `PlayerAvatar` (decorative, no `playerName`) plus a 24 pt `primary` circle badge drawn with "⇄". Pressing sets `avatarId = nextFreeAvatar(current, others' avatars)`.
5. **Summary chips.** One row of three equal chips (role `button`): FIN shows `endConditionLabel`, NIVELES shows "Los 3" or the selected names joined with ", " and " y ", ORDEN shows "Barajar" and shuffles. FIN and NIVELES toggle an inline panel under the row (state `openOptions: 'end' | 'levels' | undefined`) holding the existing `OptionChip` lists; `accessibilityState.expanded` reflects it. Inline was chosen over a sheet: no modal focus handling, it scrolls with the form, and it is simpler to test.
6. **Header.** A 48 pt square outlined back button with a chevron drawn from two borders (no icon library on web), `router.back()` when `router.canGoBack()`, else `router.replace(routes.newGame.category)`. The eyebrow is the category name from `categoriesForMode(mode)` (content data, as the category picker already does); it is omitted if the id is unknown.
7. **Start button.** `Button size="turn"` with `¡A jugar! · N jugadores`; validation, trimming, and navigation unchanged.
8. **Copy** stays in `copy.ts` (usted voice; the screen's strings are neutral).

## Risks / Trade-offs

- [The "⇄" glyph is not in Nunito/Fredoka] → it falls back to the system font on iOS, Android, and web; the badge is decorative (`importantForAccessibility="no-hide-descendants"`).
- [Long level summaries ("Suave y Prendido") in a ~100 pt chip] → value text allows two lines; chip height grows.
- [Expanded row state is lost on remount] → acceptable; it is view state, not draft state.
