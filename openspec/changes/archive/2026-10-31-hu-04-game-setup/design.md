# Design

## Context

HU-00 provides `useNewGameDraft()` (players preloaded from `lastPlayers`, all levels, 10 rounds), `useGame().startGame(settings)` (validates, starts, remembers players), `createPlayer`, `createLocalId`, `playerLimitsByMode`, `routes`, the theme tokens, and the UI primitives. Shared files are read-only for this story.

## Goals / Non-Goals

**Goals:** one screen, the draft as the only state, pure helpers for every rule, all copy in `src/features/setup/copy.ts`.

**Non-Goals:** avatars (HU-15), Sin Filtro switch (HU-10), alternative penalties (HU-11), saved groups.

## Decisions

- **Draft is the single source of truth.** Every edit calls the draft setters; the screen keeps only `attemptedStart` (show missing-name hints after the first tap) and the generic start error. Alternative: local form state copied to the draft on start — rejected, it would be a second copy of the players and lose edits when navigating back.
- **Pure helpers in `setup-rules.ts`:** `preparePlayersForMode`, `createEmptyPlayer`, `shufflePlayers`, `toggleDifficulty`, `hasMissingName`, `trimPlayerNames`, `endConditionOptions`, `isSameEndCondition`. Easy to unit-test; the screen stays declarative.
- **Preparation on mount:** a `useEffect` applies `preparePlayersForMode` once and calls `setPlayers` only when the list changes (first use → two empty rows; Pareja → first two).
- **Names are stored raw while typing** (`{ ...player, name: text }`) and trimmed only on start, so typing a space is not eaten. Max length 20.
- **Missing names:** "Empezar" stays enabled; tapping it with a blank name sets `attemptedStart`, shows "Falta el nombre" on each blank row plus a summary, and does not call `startGame`. Alternative: disabled button — rejected, a disabled button does not say what is missing.
- **Shuffle visibility:** Fisher–Yates with injectable `random`; if the result keeps the same order it rotates by one so the tap always shows a change.
- **Level rule:** `toggleDifficulty` refuses to empty the list and keeps `allDifficulties` order. Selected chips use `LevelColors[difficulty]`; unselected use `surface` with muted text.
- **Selected chips and the "No toma" toggle** use `ink` fill with white text (design tokens: selected toggles use `ink`).
- **Layout:** `ScreenContainer` without scroll wraps a `ScrollView` (form) and the "Empezar" `Button` below it, so the button is sticky.
- **Guard:** without `isReadyForSetup` at mount, `router.replace(routes.newGame.mode)` once and render nothing. If the draft is reset later while setup is still mounted under another screen (for example after a game ends), the screen only renders nothing; it never redirects from the background, which would replace the screen the user is looking at.
- **Double tap on "Empezar":** handled by the shared `Button`, which ignores presses within `repeatedPressWindowMs` of the previous one (landed on `main`), so no local guard.
- **Replay from the ranking:** HU-06 "Jugar otra vez" fills the draft and navigates here, so the screen reads the draft as it is and never calls `reset()`.
- **Keyboard:** the form's `ScrollView` uses `keyboardShouldPersistTaps="handled"` so a chip tap while typing a name works on the first tap.
- **Sin Filtro slot:** `SpicySwitchSlot` component renders `null`; mounted under the options only in Amigos. HU-10 fills it.
- **Accessibility:** gender chips `radio`, level/end chips `checkbox`/`radio`, "No toma" `checkbox`, labels include the player's position ("Jugador 1"); touch targets ≥ `TouchTarget.minimum`.

## Shared changes requested

None required. Nice to have (not blocking): a shared `TextField` primitive in `src/components/ui/` — this story styles its `TextInput` locally with tokens.

## Risks / Trade-offs

- [Effect-based preparation runs after the first render] → one extra render; tests await it.
- [`startGame` errors other than names (e.g. stale category)] → show a generic message; the user can go back.
- [No simulator on this machine] → visual check left to the coordinator on the web build.
