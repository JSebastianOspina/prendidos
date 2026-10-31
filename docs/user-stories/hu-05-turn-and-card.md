# HU-05 — Turn and card screen

| Field      | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| Status     | Ready for enrichment                                         |
| Priority   | P0 — playable loop                                           |
| Depends on | HU-00                                                        |
| Blocks     | HU-09 (couple soft paywall), HU-11 (alternative penalties)   |
| Screen     | Turno: carta al jugador                                      |
| PRD        | §5.4–§5.9, §6.3, §9; card layouts in `docs/content/card-templates.md` |

## User Story

**As the** player whose turn it is,
**I want** to see my card big and clear, with my name, the level, the points, and the penalty, and mark whether I did it,
**So that** the group plays fast, out loud, with few taps between turns.

## Context

This is where the game lives: a party-sized card, three decisions (Cumplió, No cumplió, Cambiar), and the phone passes to the next person. The rules (points, penalties, escalation, swaps, interludes) already exist in HU-00; this story is about showing them so a group across a table can read them in one glance.

## Acceptance Criteria

**Card**

- [ ] The screen shows whose turn it is (player name, large), the current round and level, and the card: headline, instruction text, points badge, and penalty line ("Toma 2 tragos — por aguafiestas").
- [ ] Reto and Verdad are visually distinguishable; Verdad is clearly a question to answer, Reto an action to do.
- [ ] The card text speaks to the current player with their gender agreement; mentions of another player show a real name from the table (the partner in Pareja).
- [ ] A card that involves touch shows "Solo si la otra persona acepta". A card that reaches outside the room shows the short outside-contact reminder.
- [ ] The level color (Suave green, Picante orange, Prendido red with white text) is visible on the card.

**Actions**

- [ ] Two large buttons, "Cumplió" and "No cumplió". Cumplió adds the points and moves to the next player. No cumplió subtracts half the points rounded up, shows the penalty clearly for a moment, then moves to the next player.
- [ ] A "Cambiar carta" action replaces the card without penalty once per player per game; after it is used, the action is visibly unavailable for that player.
- [ ] A running score is visible without leaving the screen (for example a compact scoreboard or the current player's score next to their name).
- [ ] An "Terminar partida" action, out of the way of the main buttons, asks for confirmation and goes to the ranking.

**Group cards**

- [ ] "Todos los que…" and "Yo nunca" appear as a yellow interlude card addressed to the whole group, with no points and a single "Siguiente" button; afterwards the turn continues with the player who was due.

**End**

- [ ] When the end condition is met, the screen goes to the ranking automatically.

**Feel**

- [ ] Big type readable from across a table, large buttons, no more than two taps per turn, portrait, one-handed.

## Out of Scope

- The couple soft paywall when escalation reaches Picante (HU-09).
- Alternative penalties for "No toma" players (HU-11) — they see the drink penalty for now.
- Card illustrations and mascot reactions (HU-15).
- In-app voting on whether a challenge was done (never; PRD §5.7).

## Business Value

The turn screen is the product; its clarity and pace decide whether the group finishes the game and comes back.

## Original

The sections above are the original product story (written with `write-us`).

## Enhanced (enrich-us, technical detail)

Status after enrichment: **Ready for proposal** (OpenSpec change `hu-05-turn-and-card`).

### Ownership (from `docs/user-stories/README.md`)

| Story | Route file (replaces the placeholder) | Feature folder | Also owns |
| ----- | ------------------------------------- | -------------- | --------- |
| HU-05 | `src/app/play.tsx` | `src/features/play/` | Card face components (from `docs/content/card-templates.md`), its tests, its OpenSpec change, an optional `.maestro/` flow |

### Modules and files

| Path | Contents |
| ---- | -------- |
| `src/app/play.tsx` | Thin route: default export renders `PlayScreen` |
| `src/features/play/play-screen.tsx` | Screen: header (round, level, "Terminar"), turn name + score, scoreboard, card face, penalty row, swap, actions; refusal and end-confirmation overlays; navigation effects |
| `src/features/play/card-face.tsx` | `IndividualCardFace` (level-colored strip with Reto/Verdad tag and points badge, headline, body, consent and outside-contact notes) and `GroupCardFace` (yellow `CardFrame tone="group"`, "Para todo el grupo", fixed headline by type when the card has none) |
| `src/features/play/play-overlay.tsx` | In-tree modal overlay (scrim + white panel) used for the refusal penalty and the end confirmation |
| `src/features/play/copy.ts` | All Spanish copy plus formatters (`roundLabel`, `drinksLabel`, `penaltyLine`, `pointsLabel`) |
| `src/features/play/__tests__/*-test.tsx` | Copy formatter tests, card face tests, screen tests through real `DeviceStateProvider` → `GameProvider` with an injected catalog and environment |

### Data (read-only, through `useGame()`)

`session` (`currentRound`, `settings.endCondition`, `settings.players`, `scores`, `status`), `currentPlayer`, `currentCard` (`type`, `points`, `penalty.drinks`, `requiresConsent`, `reachesOutside`), `currentCardCopy` (`headline?`, `body`, `penaltyQuip?`), `currentDifficulty`, `isGroupInterlude`, `canSwap`, `lastOutcome`, actions `completeCard`, `refuseCard`, `swapCard`, `nextAfterGroupCard`, `endGame`. No endpoints (no backend).

### Behavior

- **No session** → `router.replace(routes.home)`. **Finished** with no refusal penalty pending → `router.replace(routes.results)`.
- **No cumplió** → `refuseCard()`, then an overlay shows "{name} no cumplió", "Toma N trago(s) — {quip}" and "−N pts" from `lastOutcome`; "Siguiente" dismisses it. If the game finished on that refusal, dismissing navigates to the ranking.
- **Terminar partida** (small link in the header, away from the thumb zone) → confirmation overlay → `endGame()` → ranking.
- **Cambiar carta** pill: enabled while `canSwap`; afterwards disabled with the label "Ya cambió su carta".
- **Group interlude**: no turn name, no points, no swap, single "Siguiente" (`nextAfterGroupCard()`).
- Taps per turn: Cumplió = 1; No cumplió = 2 (refuse + dismiss); group card = 1.

### Non-functional

- Tokens and primitives only (`Colors`, `LevelColors`, `Typography`, `Spacing`, `Radius`, `TouchTarget`, `AppText`, `Button`, `CardFrame`, `LevelBadge`). No new colors, fonts or hex.
- Accessibility: buttons with role and label; overlays `accessibilityViewIsModal`; turn name as header; level badge has its own label.
- Performance: no animation dependency; renders straight from context.
- Privacy/security: no data leaves the device; nothing in route params.

### Definition of done

TDD tests green with global coverage ≥ 90 %, `npx expo lint` and `npx tsc --noEmit` clean, OpenSpec change archived, PR opened to `main`. Visual check on the web build by the coordinator (no simulator on the agent machine).
