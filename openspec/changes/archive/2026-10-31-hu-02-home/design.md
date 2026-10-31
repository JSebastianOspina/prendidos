# Design

## Context

HU-00 left a placeholder at `src/app/index.tsx`, the age guard in `_layout.tsx` (`Stack.Protected`), `useNewGameDraft()` with `reset()`, `routes`, theme tokens, and UI primitives (`AppText`, `Button`, `ScreenContainer`). Mascot art does not exist yet (HU-15). This story may edit only `src/app/index.tsx` and `src/features/home/`.

## Goals / Non-Goals

**Goals:** a static, token-only screen; one tested action; layout regions that HU-08 and HU-12 can fill without redesign.

**Non-Goals:** reading `activeSession` (HU-12), purchases (HU-08/09), animation, mascot art.

## Decisions

1. **Thin route, screen in the feature folder.** `src/app/index.tsx` default-exports a component that renders `HomeScreen` from `src/features/home/home-screen.tsx`, so the screen is testable and covered (coverage is collected on `src/features/**` only).
2. **Logo tile stand-in.** A 64 pt `brandRed` square, 3 pt `ink` border, `Radius.md`, with a hard `ink` shadow layer offset by `ShadowOffset.card` (same technique as `Button`), holding a white "P" in `Typography.title`. Hidden from assistive tech (`accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`) because the wordmark already names the app. HU-15 swaps the "P" for the mascot icon. Alternative rejected: shipping an AI-draft mascot crop (forbidden by design tokens).
3. **Wordmark** is `AppText variant="display"` in `Colors.brandRed` on `background` (5.8:1, allowed only for the wordmark), `accessibilityRole="header"`.
4. **Layout:** `ScreenContainer` with two flex regions — a `brand` region (`flex: 1`, centered) and an `actions` region at the bottom (gap `Spacing.md`). The primary button is therefore always in the lower half. The actions region holds commented slots: above the primary button for HU-12's dark "Continuar partida", below it for HU-08's "Restaurar compras" link. They render nothing now; no props or flags are added for them (YAGNI — those stories own the condition).
5. **New game handler:** `reset()` then `router.push(routes.newGame.mode)`. `reset()` rebuilds from device state, so last players and Sin Filtro stay preloaded while mode/category/options are cleared. `push` (not `replace`) so the mode screen can go back to home.
6. **Copy** lives in `src/features/home/copy.ts` (`homeCopy`). Tagline: "El juego de retos para prender la fiesta con sus amigos o su pareja." — usted voice, one line, says what the game is.
7. **Tests** render `HomeScreen` inside `DeviceStateProvider` → `GameProvider` → `NewGameDraftProvider`, mock `expo-router`, and read the draft through a tiny probe component that calls `useNewGameDraft()` (public API only).

## Risks / Trade-offs

- [Tagline wraps to two lines on narrow phones at large font scale] → acceptable; it is centered body text and the button stays bottom-anchored.
- [Short screens at large font scale could squeeze the brand region] → the brand region shrinks first; the button keeps its fixed height. Visual check on device is left to the coordinator.

## Shared changes requested

None.
