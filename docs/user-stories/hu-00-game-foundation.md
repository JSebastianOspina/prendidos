# HU-00 — Game foundation: rules, saved data, launch content, and screen flow

| Field      | Value                                                            |
| ---------- | ---------------------------------------------------------------- |
| Status     | Ready for enrichment                                             |
| Priority   | P0 — blocks every other story                                    |
| Depends on | `card-content-model` OpenSpec change archived and committed      |
| Blocks     | HU-01 … HU-15                                                    |
| Screen     | None (transversal). Leaves an empty placeholder for every screen |
| PRD        | §5 (whole section), §5.10, §6.1, §9                              |
| Builds on  | `src/features/content/` (types, text rendering, validator) and `docs/data-model.md` from `feature/card-content-model` |

## User Story

**As the** Prendidos team,
**I want** the game rules, the data the phone remembers, the launch content, and the order of the screens defined once in a single place,
**So that** every screen built afterwards behaves the same way, can be built by different people at the same time, and a partida plays identically no matter which screen touches it.

## Context

The repo today has the card content model and its validator, but no game rules, no saved data, no real cards, and the screens are still the Expo template. Six screens are about to be built in parallel by independent agents; if each one invents its own notion of "the current game" they will contradict each other and the app will not hold together. This story is the shared ground everyone stands on and must land before any screen work starts.

## Acceptance Criteria

**Game rules (observable through the rules alone, with no screen yet)**

- [ ] A game can be started from a complete setup (mode, category, players in turn order, selected levels, end condition) and reports the first player and the first card.
- [ ] Completing an individual card adds its points to the current player and passes the turn to the next player in order.
- [ ] Refusing an individual card subtracts half its points rounded up (7 → −4), reports the penalty to show, and passes the turn. Scores may go negative.
- [ ] Swapping a card gives the same player a different card with no penalty, and that player cannot swap again in the same game.
- [ ] A group card ("Todos los que…", "Yo nunca") appears as an interlude: no points, nobody's turn is consumed, and the next turn belongs to the player who was due anyway. Group cards are about 20 % of what comes out.
- [ ] No card repeats within a game. Cards never seen on this phone come out before cards already seen. When a level runs out of cards, its pool resets.
- [ ] Levels escalate with progress: with all three levels and a game by rounds, the first third is Suave, the second Picante, the last Prendido. By points goal, thirds are measured against the goal. With restricted levels, only the chosen levels are walked in that order. Within a level, cards come out from fewer to more points.
- [ ] A card aimed at a gender comes out only when a player of that gender exists other than the current player; otherwise it is skipped. A player marked "Prefiero no decir" is never picked by such a card.
- [ ] Card text shows the current player's name where it mentions the player, a random other player where it mentions another, the partner in Pareja mode, and the right gender agreement for the player mentioned; "Prefiero no decir" gets neutral wording.
- [ ] A game by rounds ends when the last round completes. A game by points goal ends when the round in which someone reached the goal is completed. An open game ends when the group ends it. Any game can be ended early.
- [ ] The final ranking orders players by score; tied players share the same position.
- [ ] While a game is still in progress, the current level, round, points, and whose turn it is can be read at any moment.

**Data the phone remembers**

- [ ] The phone remembers whether the 18+ confirmation was accepted, the last players (name, gender, "No toma"), the cards already seen, the last Sin Filtro choice, and the game in progress, and still remembers them after the app is closed and reopened.
- [ ] Nothing is remembered about past games (no history, no totals, no wins).
- [ ] Everything works with the phone offline.

**Launch content**

- [ ] The app ships with real cards for the two launch categories (La Previa for Amigos, Entre Dos for Pareja) in all three levels, enough to play a 10-round game with 6 players in La Previa without the pool resetting. HU-07 completes the catalog; this story brings the first playable batch.
- [ ] Every shipped card passes the content validator; a card that fails never reaches the app.
- [ ] For this story all content is treated as unlocked. Locks and purchases arrive with HU-08 and HU-09.

**Screen flow**

- [ ] The app opens into the Prendidos flow (18+ → Inicio → Modo → Categoría → Setup → Turno → Ranking) and the Expo template screens are gone.
- [ ] Each screen exists as an empty placeholder that shows its name, so another story can replace it without touching anything outside that screen.
- [ ] The app looks like Prendidos from the first placeholder: light cream background, ink outlines, flame palette, and the brand typography from the design tokens.
- [ ] Large buttons, large readable text, and portrait only.

**Builds on what exists, no duplicates**

- [ ] The card, category, level, mode, and gender vocabulary is the one already in `src/features/content/card-types.ts`; no second definition appears anywhere.
- [ ] Card text for a player is produced through the existing `renderGenderedText`; no second text renderer exists.
- [ ] The shipped content uses the same catalog shape the existing validator accepts, and the validator runs over it in a test.
- [ ] Game, player, settings, session, and device-state entities carry the names and fields of `docs/data-model.md`.

**Team enablement**

- [ ] A written ownership map says which files belong to which screen story and what is shared and read-only (see `README.md` in this folder).
- [ ] The storage choice is recorded as an ADR.

## Out of Scope

- Any real screen content beyond placeholders (HU-01 … HU-06).
- Purchases, locks, paywalls, Sin Filtro switch (HU-08, HU-09, HU-10).
- Alternative penalties for players who don't drink (HU-11) — for now they see the drink penalty.
- Resuming an interrupted game from the home screen (HU-12) — the game is saved, the button comes later.
- Analytics (HU-13), responsible-drinking messages (HU-14), illustrations and mascot (HU-15).

## Business Value

Lets six screens be built in parallel within the hour without contradicting each other, and guarantees the partida follows the PRD rules everywhere, which is the whole product promise.
