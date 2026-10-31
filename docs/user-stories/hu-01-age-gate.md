# HU-01 — Age confirmation (18+)

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Status     | Ready for enrichment                           |
| Priority   | P0 — playable loop                             |
| Depends on | HU-00                                          |
| Blocks     | —                                              |
| Screen     | Verificación de edad (first screen on first use) |
| PRD        | §8                                             |

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
