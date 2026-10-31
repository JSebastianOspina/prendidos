# HU-02 — Home screen

> **Update (2026-10-31):** the design alignment changed this screen. Inicio has no "Nueva partida" button: the Amigos and Pareja cards sit on Inicio and lead straight to the categories. The current behavior lives in `openspec/specs/home-screen/spec.md`; see `docs/design/review/README.md`. The sections below keep the original plan.

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Status     | Implemented (`openspec/changes/archive/2026-10-31-hu-02-home`) |
| Priority   | P0 — playable loop                      |
| Depends on | HU-00                                   |
| Blocks     | HU-12 (adds "Continuar partida" here)   |
| Screen     | Inicio                                  |
| PRD        | §5.1, §9                                |

## User Story

**As a** player who just opened the app,
**I want** a simple home screen with the brand and one clear way to start a game,
**So that** the group can start playing in a couple of taps.

## Context

The home screen is the hub the flow always returns to. For the MVP it must do one thing well: get the group into a new game fast, with the brand front and center. It later becomes the place to resume an interrupted game (HU-12) and to reach purchases (HU-09), so it must leave room for those without redesign.

## Acceptance Criteria

- [ ] After the 18+ confirmation (or on every later open), the user lands on a home screen that shows the Prendidos logo tile and wordmark.
- [ ] A large primary button "Nueva partida" takes the user to the mode selection screen.
- [ ] The screen has a short tagline in Colombian Spanish that says what the game is in one line.
- [ ] The layout leaves an obvious place for a secondary dark "Continuar partida" button (HU-12) and a small link to restore purchases (HU-08), both hidden for now.
- [ ] The screen follows the Prendidos look and is usable one-handed: the primary button sits in the lower half of the screen.

## Out of Scope

- "Continuar partida" (HU-12).
- Restore purchases, Pase total promotion (HU-08, HU-09).
- Settings or about screens (not in MVP).

## Business Value

Shortens time-to-first-card, the moment that decides whether a group keeps playing.

## Original

The sections above are the original product story (written with `write-us`).

## Enhanced (enrich-us, technical detail)

Status after enrichment: **Ready for proposal** (OpenSpec change `hu-02-home`).

### Ownership (from `docs/user-stories/README.md`)

| Story | Route file (replaces the placeholder) | Feature folder       | Also owns |
| ----- | ------------------------------------- | -------------------- | --------- |
| HU-02 | `src/app/index.tsx`                   | `src/features/home/` | —         |

Plus its tests, its OpenSpec change `openspec/changes/hu-02-home/`, and an optional `.maestro/` flow.

### Functional detail

- Route `/` (`routes.home`) is already protected by the root layout's `Stack.Protected` guard (age confirmed), so the home never renders before the 18+ confirmation; no gate logic in this story.
- **Header (upper half):** logo tile, wordmark, and tagline, centered.
  - Logo tile: 64 pt square, `brandRed` fill, 3 pt `ink` border (`BorderWidth.regular`), `Radius.md`, hard `ink` offset shadow (`ShadowOffset.card`) drawn as a layer behind it; white initial "P" (Fredoka). Stand-in until the mascot art from HU-15. Decorative (hidden from screen readers) because the wordmark carries the name.
  - Wordmark: "Prendidos", `AppText variant="display"` in `brandRed` on `background`, `accessibilityRole="header"`.
  - Tagline: one line of Colombian Spanish, `variant="body"`, `textSecondary`.
- **Action area (lower half, bottom-anchored)**, top to bottom:
  1. Slot reserved for HU-12 "Continuar partida" (`Button variant="dark"`): renders nothing now.
  2. "Nueva partida": `Button variant="primary"`, full width, 60 pt high (above the 48 pt touch target).
  3. Slot reserved for HU-08 "Restaurar compras" small text link (`textSecondary`): renders nothing now.
- **Press "Nueva partida":** `useNewGameDraft().reset()`, then `router.push(routes.newGame.mode)`. `reset()` rebuilds the draft from the device state, so the remembered `lastPlayers` / `lastSpicyEnabled` stay preloaded and only the previous mode, category, and options are cleared.
- No game state is read here (HU-12 will read `useDeviceState().activeSession` for the resume button).

### Files

| File | Change |
| ---- | ------ |
| `src/features/home/copy.ts` | `homeCopy`: wordmark, logo initial, tagline, "Nueva partida" |
| `src/features/home/home-screen.tsx` | `HomeScreen` component (layout, reserved slots, handler) |
| `src/features/home/__tests__/home-screen-test.tsx` | RNTL tests inside `DeviceStateProvider` → `GameProvider` → `NewGameDraftProvider`, with a mocked `expo-router` |
| `src/app/index.tsx` | Thin route: default export renders `HomeScreen` |

No shared file changes required.

### Definition of done

- Tests first (TDD): renders the wordmark, tagline, and primary button; pressing it resets the draft and pushes `routes.newGame.mode`; renders neither "Continuar partida" nor "Restaurar compras".
- `npm test` green with global coverage ≥ 90 %; `npx expo lint` and `npx tsc --noEmit` clean.
- Visual check in the running app left to the coordinator (no simulator on the agent machine).

### Non-functional

- Accessibility: the button exposes role `button` and its label; the wordmark is a header; the decorative tile is hidden from assistive tech; text uses theme typography and scales with the system font size.
- Tokens only from `@/constants/theme`; no new colors, fonts, or hex literals.
- Performance: static screen, no effects or storage reads.
- Security: no data input, no network; no impact.
