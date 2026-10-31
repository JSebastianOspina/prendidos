# Design

## Context

HU-00 provides `useDeviceState().confirmAge()` (persists `ageConfirmedAt` in `device.v1`) and a `Stack.Protected` root layout: `age-gate` is the only route allowed while `ageConfirmedAt` is unset, and it is removed once set. UI primitives (`ScreenContainer`, `AppText`, `Button`) and tokens live in shared, read-only files.

## Goals / Non-Goals

**Goals:** the screen in `src/features/age-gate/`, a thin route file, copy in one file, TDD component tests.

**Non-Goals:** real identity/age verification; mascot art (HU-15); in-game responsible-drinking reminders (HU-14); any shared-file edit.

## Decisions

- **Leave the gate through the guard, not the router.** `confirmAge()` updates `ageConfirmedAt`; the protected stack then swaps to Inicio. Calling `router.replace(routes.home)` in the same handler would run before the guard re-renders and could target a still-protected route. Alternative (navigate explicitly) rejected for that race.
- **Decline is local state, not persisted.** A mistaken tap must be recoverable, and persisting "minor" would need a new `DeviceState` field (shared file). Both actions stay visible after declining; every other route stays guarded, so nothing else is reachable.
- **Layout: scrollable content + fixed footer.** Brand, question and notice sit in a `ScrollView` with `flex: 1`; the footer below it, outside the scroll, holds the adults-only message (after declining) and the two buttons, so neither the primary action nor the decline feedback can scroll out of view on small phones or with Dynamic Type. `ScreenContainer` is used without `scroll`.
- **Brand without images.** A `brandRed` tile (ink border, `Radius.xl`, hard `ink` shadow layer like the shared primitives) with the "Prendidos" wordmark in white `title` text; contrast 6.1:1. No image assets until HU-15.
- **Copy.** `age-gate-copy.ts` exports one `ageGateCopy` object. Usted voice: question "¿Es mayor de 18 años?" (AC allows an equivalent of "¿Eres…?"); confirm "Soy mayor de 18 años"; decline "Soy menor de 18".
- **Accessibility.** Question is the `header`; decline message is announced (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`); buttons come from `Button` (60 pt).
- **Shared changes requested:** none required. Note for the coordinator: `openspec/specs/app-shell/spec.md` scenario "First launch" still says "the 18+ placeholder is shown"; the new `age-gate` capability supersedes it — left untouched to avoid conflicts with the other Phase B changes.

## Risks / Trade-offs

- [The redirect depends on HU-00's layout, which this change cannot edit] → an `expo-router/testing-library` flow test renders the real `src/app/_layout.tsx` with the real gate (other routes stubbed) and proves first open → gate, decline stays, confirm → `/`, and a restart skips the gate. It breaks loudly if the layout's guard changes.
- [A minor can simply tap confirm] → accepted: store policy asks for a confirmation, not verification (out of scope).
