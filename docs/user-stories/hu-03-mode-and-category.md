# HU-03 — Choose mode and category

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Status     | Implemented (OpenSpec change archived, PR open)           |
| Priority   | P0 — playable loop                                        |
| Depends on | HU-00                                                     |
| Blocks     | HU-09 (adds locks and paywall entry here)                 |
| Screen     | Elegir modo → Elegir categoría (two steps, one story)     |
| PRD        | §5.2, §6.1, §7.1                                          |

## User Story

**As a** player starting a game,
**I want** to pick whether we play as a group of friends or as a couple, and then pick a category,
**So that** the cards match who is in the room and the mood we want.

## Context

Mode decides the number of players and the tone of the content; the category decides the theme. At launch there is one category per mode, but the picker must already behave as a list so new packs can be added without redesign. The two steps are one story because their hand-off (mode filters categories) is easier to get right in one piece.

## Acceptance Criteria

**Mode**

- [ ] From "Nueva partida" the user sees two large options: "Amigos" (2 to 12 players) and "Pareja" (exactly 2), each with a one-line description of the content tone.
- [ ] Pareja uses the pink couple accent; Amigos uses the primary flame accent.
- [ ] Choosing a mode goes to the category list for that mode.

**Category**

- [ ] The user sees only the categories of the chosen mode, each as a large card with name and short description (La Previa for Amigos, Entre Dos for Pareja at launch).
- [ ] Choosing a category goes to the game setup screen with that mode and category already applied.
- [ ] Category names and descriptions are in Colombian Spanish and are marked provisional in the content, not in the UI.
- [ ] The user can go back from the category list to the mode screen, and from the mode screen to home.

**Shared**

- [ ] Both screens follow the Prendidos look and are usable one-handed.
- [ ] The category cards leave an obvious place for a lock badge on paid content (HU-09), hidden for now.

## Out of Scope

- Locked categories, lock badge behavior, and opening the paywall (HU-09).
- Sin Filtro (it is a switch in setup, HU-10, not a category).
- More than one category per mode (future packs).

## Business Value

Routes each group to content that fits them, which is the main lever for the "fun on the first try" promise.

## Original

The sections above are the original product story (written with `write-us`).

## Enhanced (enrich-us, technical detail)

Status after enrichment: **Ready for proposal** (OpenSpec change `hu-03-mode-and-category`).

### Ownership (from the README map)

| Story | Route file (replaces the placeholder) | Feature folder | Also owns |
| ----- | ------------------------------------- | -------------- | --------- |
| HU-03 | `src/app/new-game/mode.tsx`, `src/app/new-game/category.tsx` | `src/features/category-picker/` | its tests, its OpenSpec change, an optional `.maestro/` flow |

Everything else (`_layout.tsx`, `src/features/game|device|content|navigation`, `src/components/ui`, `theme.ts`, `package.json`, `app.json`, `__mocks__`) is read-only.

### Modules and files

| Path | Contents |
| ---- | -------- |
| `src/features/category-picker/copy.ts` | All Spanish copy (usted): titles, back label, mode names, player-range line built from `playerLimitsByMode`, tone lines, empty-list message |
| `src/features/category-picker/mode-accent.ts` | `accentByMode: Record<GameMode, string>` → `Colors.primary` (friends), `Colors.couple` (couple) |
| `src/features/category-picker/choice-card.tsx` | `ChoiceCard`: large pressable card (ink outline, hard `ink` shadow, accent fill, `Radius.xl`), title + optional subtitle + optional description, `lockBadge?: ReactNode` slot in the top-right corner (not rendered when absent — HU-09 fills it) |
| `src/features/category-picker/back-link.tsx` | Top-left 48 pt "Volver" control: `router.back()` when the stack can go back, else `router.replace(fallback)` |
| `src/features/category-picker/mode-picker-screen.tsx` | Mode screen: title, two `ChoiceCard`s (Amigos, Pareja); press → `setMode(mode)` then `router.push(routes.newGame.category)` |
| `src/features/category-picker/category-picker-screen.tsx` | Category screen: `<Redirect href={routes.newGame.mode} />` when the draft has no mode; else `categoriesForMode(mode)` as `ChoiceCard`s with the mode accent; press → `setCategoryId(id)` then `router.push(routes.newGame.setup)`; empty list → message |
| `src/app/new-game/mode.tsx`, `src/app/new-game/category.tsx` | Thin default exports rendering the feature screens |
| `src/features/category-picker/__tests__/*-test.tsx` | RNTL v14 tests (async `render` / `fireEvent`), `expo-router` mocked |

### Data and contracts used (no new types)

- `GameMode`, `Category` from `@/features/content/card-types`; `categoriesForMode(mode)` from `@/features/content/catalog` — category names and descriptions come from the content JSON, never from the UI copy.
- `useNewGameDraft()` → `mode`, `setMode` (clears the category when the mode changes), `setCategoryId`; `playerLimitsByMode` from `@/features/game`.
- `routes.home`, `routes.newGame.mode|category|setup` from `@/features/navigation/routes`. No route params.
- No endpoints (no backend). No storage writes (the draft lives in memory).

### Behavior details

- Mode order: Amigos first, Pareja second. Player line: "De 2 a 12 jugadores" / "Solo 2 jugadores", computed from `playerLimitsByMode`.
- Category description is optional in `Category`; the card hides the line when it is missing.
- Back: mode → home (fallback `routes.home`); category → mode (fallback `routes.newGame.mode`). Hardware back and the iOS swipe keep working through the Stack.
- One-handed: the choices sit in the lower part of the screen, full width, each at least 120 pt high.

### Definition of done

- Tests first (TDD) for: both mode options with tone lines and accents; mode press sets the draft and navigates; category list filtered by mode with name and description; category press sets the draft and navigates to setup; redirect without a mode; back links; hidden lock slot.
- `npm test` green with global coverage ≥ 90 %, `npx expo lint`, `npx tsc --noEmit` clean.
- Visual check on the web build by the coordinator (no simulator on the agent machine).

### Non-functional

- Accessibility: each card is one `button` with a combined label (name, players, tone); titles marked `header`; touch targets ≥ 48 pt; `ink` text on `primary` / `couple` meets contrast (design tokens).
- Performance: the catalog is cached by `loadCatalog()`; no extra work on render.
- Security and privacy: no data leaves the device; nothing persisted.
