# HU-09 — Paywall and locked content

| Field      | Value                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| Status     | Draft — not scheduled for the first playable build                       |
| Priority   | P1                                                                       |
| Depends on | HU-08, HU-03, HU-05, HU-06                                               |
| Blocks     | —                                                                        |
| Screen     | Paywall (sheet) + lock states on category picker, turn screen, ranking   |
| PRD        | §7.1                                                                     |

## User Story

**As a** player who runs into locked content,
**I want** to see clearly what is locked and what unlocking it gives me, at the moment it matters,
**So that** I can decide to buy without being interrupted or tricked.

## Context

The PRD defines four points of sale and insists they be non-intrusive: locked categories with a padlock, the Sin Filtro switch (HU-10), a one-time soft paywall in Pareja when escalation reaches Picante, and a small upsell on the final ranking. The free experience must stay complete.

## Acceptance Criteria

- [ ] A single paywall sheet shows the relevant product(s) with name, what they unlock, price, a buy button, and "Restaurar compras"; it can always be dismissed.
- [ ] In the category picker, locked categories show a padlock and open the paywall instead of starting a game.
- [ ] In a Pareja game with Picante or Prendido locked, when escalation would reach Picante the soft paywall appears once ("Desbloquea el siguiente nivel"). Dismissing it continues the game with Suave only and the sheet does not appear again in that game.
- [ ] After a successful purchase from the soft paywall, the game continues into the unlocked levels without restarting.
- [ ] The final ranking shows a small, non-blocking upsell to the locked content of the mode just played; it is absent when everything is owned.
- [ ] Paid content uses the brand red surface with white text, as in the design tokens.
- [ ] Nothing is ever hidden or enabled remotely; locked content is described honestly.

## Out of Scope

- Sin Filtro switch lock (HU-10).
- Discounts, timers, or urgency mechanics.

## Business Value

Turns natural moments of desire into purchases while keeping store compliance and the free experience intact.
