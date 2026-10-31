# HU-06 — Final ranking

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Status     | Implemented (PR open)                   |
| Priority   | P0 — playable loop                      |
| Depends on | HU-00                                   |
| Blocks     | HU-09 (adds the upsell here), HU-14     |
| Screen     | Ranking y ganador                       |
| PRD        | §5.7 (Fin de partida), §7.1, §9         |

## User Story

**As a** player at the end of a game,
**I want** to see who won and the full ranking, and start another game right away,
**So that** the night has a clear winner and the group keeps playing.

## Context

The ending is what the group remembers. A clear winner moment and a one-tap "play again" keep the session going; this screen is also where the PRD places a soft, non-intrusive upsell later (HU-09).

## Acceptance Criteria

- [ ] When a game ends, the user sees the winner highlighted (name, score, crown or points accent) and below it the full ranking with each player's final score.
- [ ] Tied players show the same position and are visibly tied (for example "1. Ana y Luis").
- [ ] Negative scores are shown in the negative color.
- [ ] A large primary button "Jugar otra vez" goes to setup with the same players, mode, and category already filled in.
- [ ] A secondary action "Volver al inicio" goes home.
- [ ] Once the ranking is shown, the game is no longer "in progress": reopening the app does not try to resume it.
- [ ] The layout leaves room for a small non-intrusive upsell block for locked content of the mode just played (HU-09), hidden for now.
- [ ] Follows the Prendidos look; the winner moment feels celebratory within the brand (flame palette, points color).

## Out of Scope

- Upsell content (HU-09).
- Responsible-drinking reminder at the end of the game (HU-14).
- Sharing the result, screenshots, or statistics (not in MVP).

## Business Value

A strong ending and an instant replay raise games per session, the retention metric the MVP is validating.

---

## Original

The sections above are the original product story (written with `write-us`).

## Enhanced (enrich-us, technical detail)

Status after enrichment: **Ready for proposal** (OpenSpec change `hu-06-final-ranking`, archived as `openspec/changes/archive/2026-10-31-hu-06-final-ranking/`).

### Ownership (from `docs/user-stories/README.md`)

| Story | Route file (replaces the placeholder) | Feature folder          | Also owns                                                    |
| ----- | ------------------------------------- | ----------------------- | ------------------------------------------------------------ |
| HU-06 | `src/app/results.tsx`                 | `src/features/results/` | Its tests, its OpenSpec change, an optional `.maestro/` flow |

Everything else (`_layout.tsx`, `src/features/game|device|navigation|content`, `src/components/ui`, `theme.ts`, `package.json`, `app.json`, `__mocks__`) is read-only.

### Modules and files

| Path | Contents |
| ---- | -------- |
| `src/features/results/ranking-groups.ts` | Pure helpers: `groupRankingByPosition(ranking)` → one `RankingGroup { position, score, players }` per shared position, in order |
| `src/features/results/results-copy.ts` | All Spanish copy (usted): `joinPlayerNames(names)` ("Ana y Luis", "Ana, Beto y Luis", "Ana e Isabel"), titles, winner and tie labels, `formatPoints(score)` ("12 pts", "1 pt", "-3 pts"), accessibility labels, button labels |
| `src/features/results/results-screen.tsx` | `ResultsScreen`: winner card + full ranking + actions; redirects home when there is no finished game |
| `src/features/results/winner-card.tsx` | Winner highlight: `CardFrame tone="group"` (flameYellow), a `points` medal with `ink` border (crown accent, no art yet), names, score in a white chip with `ink` border |
| `src/features/results/ranking-list.tsx` | One row per position group ("1. Ana y Luis" + score); negative scores in `Colors.negative` |
| `src/features/results/upsell-slot.tsx` | `ResultsUpsellSlot`: reserved slot for HU-09, renders nothing for now |
| `src/app/results.tsx` | Thin route: default export rendering `ResultsScreen` |
| `src/features/results/__tests__/*-test.ts(x)` | Helper tests and screen tests (RNTL v14, async) |

### Data and behavior

- Reads only `useGame()` (`session`, `ranking`, `clearFinishedGame`) and `useNewGameDraft()` setters. Types (`RankingEntry`, `Player`) come from `@/features/game`.
- The ranking shows only when `session?.status === 'finished'`. With no session (after `clearFinishedGame()`, deep link, reload) or a game still in progress, the screen renders `<Redirect href={routes.home} />`; an in-progress game stays saved for HU-12.
- **Jugar otra vez** (primary, large): read `session.settings` first, then `setMode` → `setCategoryId` → `setPlayers` → `setSelectedDifficulties` → `setEndCondition` → `setSpicyEnabled`, then `clearFinishedGame()` and `router.dismissTo(routes.newGame.setup)` (pops back to the setup in the stack, or replaces the current screen when it is not there).
- **Volver al inicio** (secondary): `clearFinishedGame()` then `router.dismissTo(routes.home)`.
- An `isLeaving` state flag keeps the redirect from firing in the render between `clearFinishedGame()` and the navigation.
- Not resumable: HU-00's `GameProvider` already saves `activeSession = undefined` once `status` is `finished`; this screen adds `clearFinishedGame()` on both exits.
- Penalties are not shown (HU-05 shows them). No route params.

### Non-functional

- Tokens and primitives only (`Colors.points`, `Colors.flameYellow`, `Colors.negative`, `AppText`, `Button`, `CardFrame`, `ScreenContainer`); no new colors, fonts or hex.
- Accessibility: the title is a header; the winner card and rows carry full labels ("Puesto 1: Ana y Luis, 12 puntos"); buttons are 60 pt high.
- No security impact (nothing leaves the device). Platforms: iOS, Android, web; no native change, no new dependency, no new development build.

### Definition of done

- Failing tests first (TDD), then implementation; `npm test` green with global coverage ≥ 90 %, `npx expo lint` and `npx tsc --noEmit` clean.
- OpenSpec change proposed, applied, adversarially reviewed, archived; PR to `main`.
- Visual check on device or web left to the coordinator (no simulator on the build machine).
