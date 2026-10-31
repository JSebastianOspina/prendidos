# HU-10 — Sin Filtro switch

| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Status     | Draft — not scheduled for the first playable build    |
| Priority   | P1                                                    |
| Depends on | HU-04, HU-08, HU-09, HU-07 (spicy cards exist)        |
| Blocks     | —                                                     |
| Screen     | Setup (switch) + turn screen (spicy cards mixed in)   |
| PRD        | §5.3, §6.4, §7.1                                      |

## User Story

**As a** group of friends who want the game hotter,
**I want** to turn on "Retos Sin Filtro" in the setup,
**So that** bolder cards mix into our category without changing anything else.

## Context

Sin Filtro is an opt-in layer inside Amigos categories, not a category of its own. It must be off on first use, remember the last choice, and be clearly a paid unlock so the stores and users see it honestly.

## Acceptance Criteria

- [ ] In Amigos setup, a "Retos Sin Filtro" switch appears under the options. It is absent in Pareja.
- [ ] On first use the switch is off. Afterwards it opens with the last value chosen on this phone.
- [ ] When the layer is not owned, the switch shows a padlock and tapping it opens the paywall for the Sin Filtro pack (or Pase total) instead of turning on.
- [ ] When on, Sin Filtro cards of the chosen category mix with the standard ones in the same level escalation; when off, none appear.
- [ ] The card itself does not need to look different; the content speaks for itself.

## Out of Scope

- Sin Filtro in Pareja (never).
- Writing the spicy cards (HU-07).

## Business Value

The main differentiator and the first paid pack; the switch is where that value is discovered.
