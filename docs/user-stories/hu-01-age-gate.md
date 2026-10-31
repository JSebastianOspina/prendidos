# HU-01 — Age confirmation (18+)

> **Update (2026-10-31):** the design alignment changed this screen. The copy, layout, and mascot follow proposal board 1, and "Soy menor de edad" is a text link. The current behavior lives in `openspec/specs/age-gate/spec.md`; see `docs/design/review/README.md`. The sections below keep the original plan.

| Field      | Value                                            |
| ---------- | ------------------------------------------------ |
| Status     | Implemented (OpenSpec `hu-01-age-gate`)          |
| Priority   | P0 — playable loop                               |
| Depends on | HU-00                                            |
| Blocks     | —                                                |
| Screen     | Verificación de edad (first screen on first use) |
| PRD        | §8                                               |

## User Story

**As a** first-time user,
**I want** to confirm I am over 18 and read a short responsible-drinking notice before anything else,
**So that** the app is only used by adults and the stores accept it.

## Context

Prendidos is a drinking game rated 18+ (App Store) and Mature 17+ (Google Play). The stores expect an age confirmation before any alcohol-related content is shown, and the PRD makes it a one-time gate. Without it the app cannot be submitted.

## Acceptance Criteria

- [ ] On the very first open, before the home screen, the user sees a screen with the Prendidos brand, the question "¿Eres mayor de 18 años?" (or equivalent), a short responsible-drinking notice, and a large confirm button "Soy mayor de 18 años".
- [ ] Tapping the confirm button takes the user to the home screen and the question is never asked again on this phone, including after the app is closed and reopened.
- [ ] There is a visible way to decline. Declining keeps the user on this screen with a short message that the app is only for adults; nothing else in the app can be reached.
- [ ] The screen is readable at arm's length in a party setting: large text, one primary action, and all text in Colombian Spanish.
- [ ] The screen follows the Prendidos look (light background, ink outlines, flame palette) and works on small phones without scrolling the primary button out of view.

## Out of Scope

- Any real identity or age verification.
- Store review notes or rating questionnaire (release checklist, not a story).
- Responsible-drinking reminders during or after the game (HU-14).

## Business Value

Makes the app submittable to both stores and sets the responsible-drinking tone from the first second.

---

## Original

The user story above (User Story, Context, Acceptance Criteria, Out of Scope, Business Value) is the original product-level text.

## Enhanced

### Ownership (from `docs/user-stories/README.md`)

| Story | Route file (replaces the placeholder) | Feature folder           | Also owns                                                                 |
| ----- | ------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| HU-01 | `src/app/age-gate.tsx`                | `src/features/age-gate/` | Its tests, the OpenSpec change `hu-01-age-gate`, `.maestro/age-gate.yaml` |

### Functional detail

- **Screen layout (top to bottom, no scroll for the actions):** `brandRed` logo tile with the "Prendidos" wordmark in white (mascot art arrives with HU-15, no image), label "SOLO PARA MAYORES DE EDAD", question as the screen header (`title` variant), short responsible-drinking notice (`body`), and — after declining — the adults-only message. The brand/question/notice block sits in a `ScrollView` that takes the free space; the decline message and the two actions are a fixed footer outside it, so on small phones or with large font scaling the primary button never scrolls out of view.
- **Actions:** one primary `Button` "Soy mayor de 18 años" and one `secondary` `Button` "Soy menor de 18" (visible decline, less weight than the primary).
- **Confirm:** calls `useDeviceState().confirmAge()`, which persists `ageConfirmedAt` (`device.v1`). The `Stack.Protected` guard in `_layout.tsx` (HU-00) then removes the age gate and shows Inicio by itself; the screen does not call the router (calling `router.replace(routes.home)` in the same tick would race the guard).
- **Decline:** local screen state only (not persisted). Shows the message "Prendidos es solo para mayores de edad. Si es menor, aquí no hay nada para usted." as an alert (`accessibilityRole="alert"`, polite live region). Both buttons stay visible, so a mistaken tap can be corrected; no other route is reachable because every other route stays guarded.
- **Copy:** all strings in `src/features/age-gate/age-gate-copy.ts`, Colombian Spanish, usted voice. The question uses the usted form "¿Es mayor de 18 años?" (the AC allows "or equivalent").

### Files

| File                                                       | Change                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/features/age-gate/age-gate-copy.ts`                   | New: every user-facing string (`ageGateCopy`)                                                                  |
| `src/features/age-gate/age-gate-screen.tsx`                | New: `AgeGateScreen` (reads `useDeviceState()`)                                                                |
| `src/features/age-gate/__tests__/age-gate-screen-test.tsx` | New: RNTL tests (render, confirm persists, decline message)                                                    |
| `src/features/age-gate/__tests__/age-gate-flow-test.tsx`   | New: flow test over the real root layout (gate first, decline stays, confirm → Inicio, restart skips the gate) |
| `src/app/age-gate.tsx`                                     | Replace placeholder with a thin default export rendering `AgeGateScreen`                                       |
| `.maestro/age-gate.yaml`                                   | New: first-launch flow (clear state → decline → confirm → home)                                                |

No endpoints, no backend, no new dependencies, no shared-file edits.

### Non-functional

- **Accessibility:** question has `accessibilityRole="header"`; buttons are ≥ 60 pt high (`Button`); text keeps font scaling (Dynamic Type); contrast follows `design-tokens.md` (white on `brandRed` 6.1:1, `ink` on `background` 16.3:1).
- **Security / privacy:** no personal data; only an ISO timestamp is stored on-device. No real age verification (out of scope).
- **Performance:** static screen, no async work.

### Definition of done

- Tests written first and green; `src/features/**` coverage ≥ 90 %.
- `npm test`, `npx expo lint`, `npx tsc --noEmit` clean.
- OpenSpec change archived, delta merged into `openspec/specs/app-shell`.
- PR to `main` on `feature/hu-01-age-gate`; visual check on the web build left to the coordinator (no simulator on the agent machine).
