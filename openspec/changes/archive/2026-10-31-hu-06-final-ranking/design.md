# Design

## Context

HU-00 fixed the contract: `useGame()` exposes `session`, `ranking: RankingEntry[]` (ties share `position`: 1, 1, 3) and `clearFinishedGame()`; `useNewGameDraft()` exposes the setters; `routes` has `home` and `newGame.setup`. `GameProvider` already saves `activeSession = undefined` once a session is `finished`. Shared files are read-only for this story.

## Goals / Non-Goals

**Goals:** a thin route, a feature folder with pure, unit-tested helpers, a screen tested through the real providers.

**Non-Goals:** upsell content (HU-09), responsible-drinking reminder (HU-14), mascot / crown art (HU-15), penalties (HU-05), animations.

## Decisions

1. **Group by position in a pure helper** (`groupRankingByPosition`) instead of re-ranking scores: the engine already computed positions, the screen only groups consecutive entries with the same `position`. Alternative (re-sorting by score here) would duplicate `rankPlayers`.
2. **Spanish name joining** (`joinPlayerNames`, in the copy file because it carries Spanish words): "A", "A y B", "A, B y C"; "y" → "e" before a word starting with an /i/ sound (`i`/`hi` not followed by a vowel, accents ignored), as Spanish grammar requires ("Ana e Isabel", "Beto e Hilda"; "Ana y Hiedra" keeps "y" because "hie" is a diphthong).
3. **Winner = first group.** A tie for first shows "¡Empate en la cima!" and the joined names; otherwise "¡Ganó la noche!". Gender-neutral copy, so no gendered variants are needed.
4. **Crown accent with tokens only**: a round medal in `Colors.points` with an `ink` border showing "1", on `CardFrame tone="group"` (flameYellow). The score sits in a white chip with an `ink` border (design-tokens: `points` on `flameYellow` fails contrast; use a white chip). HU-15 swaps the medal for the crowned mascot.
5. **Negative scores**: `Colors.negative` text (text-only token) on the white chip / cream rows. Visual format "12 pts" / "1 pt" / "-3 pts"; accessibility label in words ("12 puntos").
6. **Redirect instead of an empty state**: when `session?.status !== 'finished'` the screen renders expo-router `<Redirect href={routes.home} />`. A game still `inProgress` stays saved for HU-12. A `isLeaving` state flag, set in the same event as `clearFinishedGame()`, suppresses the redirect in the render between `clearFinishedGame()` and the explicit navigation, so "Jugar otra vez" is not overridden by a redirect home.
7. **Play again order**: read `session.settings` into a local before any state change, then `setMode` → `setCategoryId` (functional updates, so the mode change cannot clear the category set afterwards) → `setPlayers` → `setSelectedDifficulties` → `setEndCondition` → `setSpicyEnabled`, then `clearFinishedGame()` and `router.dismissTo(routes.newGame.setup)`: it pops play and results back to the setup already in the stack (so "back" from setup never lands on an empty play screen) and, per the SDK 58 type docs, replaces the current screen when setup is not in the stack. `router.replace` was rejected: it left `… setup → play → setup` in the stack.
8. **Home**: `clearFinishedGame()` then `router.dismissTo(routes.home)` (same as HU-00's placeholder; pops play/results).
9. **Upsell slot**: `ResultsUpsellSlot` component rendering `null`, placed between the ranking and the actions, so HU-09 edits one file.
10. **Copy** in `src/features/results/results-copy.ts` (usted, Colombian Spanish).

Expo APIs used: `router.dismissTo`, `Redirect` from `expo-router` (SDK 58, already used by HU-00's placeholder for `dismissTo`). No native API. A state flag, not a ref, because the React Compiler lint rules forbid reading refs during render.
11. **`ScoreText`**: one small component formats a score and picks `ink` or `negative`, shared by the winner chip and the ranking rows.

## Risks / Trade-offs

- [Redirect during the replay render] → `isLeaving` flag + a test that asserts setup (not home) is the target.
- [Long player names in a tie] → rows wrap (`flexShrink`), score column fixed to the right.
- [Play screen beneath results re-renders with no session after `clearFinishedGame()`] → if HU-05 redirects on a missing session it could race with this screen's `dismissTo`. Coordinator: check HU-05 only redirects when focused, or that its redirect targets home harmlessly.
- [HU-04 setup resetting the draft on mount or keeping a local copy] → replay values would be lost; coordinator checks the integrated flow.
- [No visual verification here] → coordinator checks on the web build.

## Shared changes requested

None required. Nice to have (not blocking): a `Crown` primitive in `src/components/ui/` once HU-15 delivers the art.
