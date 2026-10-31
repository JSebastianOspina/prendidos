---
name: write-cards
description: Use when writing new Prendidos game cards (retos, verdades, "Yo nunca", "Todos los que…"), rewriting legacy challenges from docs/content/legacy, or fixing card copy that is too explicit, too boring, gendered, or breaks App Store / Google Play drinking and sexual-content rules.
---

# Write Cards

## Overview

A Prendidos card is a **dare with social risk**, said by a Colombian friend, that any adult player can complete **without drinking**. Policy removes the explicit part; it must never remove the risk. A compliant card that nobody would scream at is a failed card.

**Violating the letter of the policy is violating the spirit.** A card that passes "technically" (a hug at `hard` level, an insult moved into the quip) is rejected.

## Before Writing

Read the references in this folder, every time:

- `references/policy.md` — hard rules, heat tiers (`standard` / `spicy`), consent, drinking, people outside the room
- `references/voice.md` — hook formulas, vocatives, slang, gender handling
- `references/mechanics.md` — dare families (calls, social media, closeness, confessions…) and twists. Seeds are shapes to remix, never copy

When writing new cards, spread a batch across families: no family gets more than a third of it, and at least one card should be a mechanic or twist combination that isn't in `mechanics.md`.

Inputs you need (ask if missing): category, difficulty, card type, heat tier, count — or the `legacyId`s to rewrite from `docs/content/legacy/legacy-challenges.json`.

## Rewriting a Legacy Card

1. **Name the kernel.** What made the original land: embarrassment, flirt tension, absurdity, confession, physical comedy? Write it down in `rationale`.
2. **Name the violation.** Which rule in `policy.md` it breaks.
3. **Keep the kernel, swap the vehicle.** Same kind of risk, different action. "Show a porn photo" → the kernel is *the group sees what's on your phone*, not porn.
4. **Hold the level.** A `hard` card stays the scariest thing in the deck within the rules. If the rewrite would fit `easy`, it is wrong — push the social risk up (audience, eye contact, duration, the group judges) until it earns its points.
5. **Keep the hook.** Reuse the original headline when it is clean ("¡Abra la jeta!", "Se puso chimba esto"); otherwise write a new one with a formula from `voice.md`.

## Quick Reference

| Must                                               | Never                                                        |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Doable sober: drinking is only the penalty         | Drinking as part of the dare (sips, tastings, sharing a drink) |
| Penalty is structured: `drinks` 1–3 + optional quip | Drink count or "tómese N" written in `body` or `quip`        |
| `requiresConsent: true` when touching someone      | Consent boilerplate in `body`; penalizing whoever says no    |
| Gender-safe: invariable words or `{m\|f\|n}` variants | "tímido", "solito", "ella", "mi perro" aimed at the player  |
| Calls and posts where the joke is on the player    | Exposing, scaring, or sexting the person outside; fake emergencies |
| Concrete: time, judge, or clear fail condition     | "Haga algo chistoso"                                         |

## Output

Return a JSON array. One object per card:

```json
{
  "id": "draft-la-previa-001",
  "sourceLegacyId": "B3352FE5",
  "categoryId": "la-previa",
  "type": "challenge",
  "difficulty": "medium",
  "heat": "spicy",
  "headline": "Llegó {el divo|la diva|la estrella} de la noche",
  "body": "Durante una ronda le dice que sí a todo lo que le pidan, dentro de lo legal y sin quitarse nada. El grupo decide cuándo se acaba.",
  "points": 16,
  "penalty": { "drinks": 2, "quip": "por aguafiestas" },
  "requiresConsent": false,
  "reachesOutside": false,
  "targetGender": null,
  "illustrationIdea": "mascot with diva lips and sunglasses",
  "rationale": "Kernel: total surrender to the group. Removed slur 'la más perra' and the insult quip; kept the persistent-rule mechanic.",
  "selfCheck": { "policy": "pass", "doableSober": true, "genderSafe": true, "levelHeld": true, "fun": 4 }
}
```

Give each card a draft ID, `draft-<categoryId>-<nnn>` numbered within the batch; the final ID is assigned when a human approves the card. New cards use `"sourceLegacyId": null`. Emoji are fine in `body` only when they are part of the dare ("mándele solo 🔥").

Before returning, validate the batch with `validateCards` (`src/features/content/validate-cards.ts`, wrapped as `{ categories, cards }`; until a CLI runner exists, through a temporary Jest test). Fix every `error`. A `warning` (banned phrase, amount to drink in copy) means reword unless the match is a false positive, which you explain in `rationale` for the human reviewer. The rules are listed at the top of `references/policy.md`.

`points` must fall in the level range: `easy` 1–10, `medium` 11–20, `hard` 21–30. `fun` is 1–5: would the group react out loud? Below 4, rewrite before returning.

## Common Mistakes

| Mistake                                        | Fix                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| Swapping the dare for an unrelated safe one (moan → shout a goal) | Keep the kernel: moan → a seductive voice reading something absurd |
| Sanitizing harmless slang ("chimba", "parce", "pailas") | Slang is the product; only slurs and insults go (see `voice.md`) |
| Consent rule hidden in the penalty text, or repeated in `body` | Set `requiresConsent: true`; the app shows the rule |
| `selfCheck.fun` always 4–5                     | Score against the original: a rewrite that is tamer than the legacy card at the same level is a 3 |
| Same headline style everywhere ("¡X de Y!")    | Rotate the formulas in `voice.md`                                      |
| Writing it for men by default                  | Read every word aloud for a woman and for a non-disclosed player       |
