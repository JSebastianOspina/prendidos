# HU-08 — Purchases and restore

| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Status     | Draft — not scheduled for the first playable build    |
| Priority   | P1                                                    |
| Depends on | HU-00, HU-02 (restore link on home)                   |
| Blocks     | HU-09, HU-10                                          |
| Screen     | None of its own (store sheets + restore action)       |
| PRD        | §5.10, §7                                             |

## User Story

**As a** player who wants more content,
**I want** to buy a pack or the Pase total and get my purchases back on a new phone,
**So that** I unlock content once and keep it.

## Context

Monetization is the second thing the MVP validates after retention. The three launch products are non-consumable: the Sin Filtro pack, the Entre Dos Picante + Prendido pack, and the Pase total that also covers all future content. Purchases must work offline once made, with the store as the source of truth.

## Acceptance Criteria

- [ ] The three launch products exist with their store names, descriptions, and prices shown as the store reports them (never hardcoded).
- [ ] Buying a product through the native store sheet unlocks the matching content immediately and stays unlocked after the app is closed, reopened, or used offline.
- [ ] The Pase total unlocks every category, level, and the Sin Filtro layer, including categories added later.
- [ ] "Restaurar compras" on the home screen recovers earlier purchases on the same store account and confirms the result in a short message.
- [ ] A cancelled or failed purchase leaves the content locked and shows a short, non-alarming message.
- [ ] No account, login, or personal data is required.

## Out of Scope

- Where purchases are offered (HU-09, HU-10).
- Subscriptions, consumables, promo codes.
- A backend for receipt validation (not in MVP).

## Business Value

Enables the conversion metric the MVP exists to measure.
