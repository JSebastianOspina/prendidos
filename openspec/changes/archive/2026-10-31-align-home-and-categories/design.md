# Design

## Context

See proposal.md (Why). Sources: `docs/design/prototype/inicio.dc.html`, `categorias.dc.html`, `pareja.dc.html`, and the review renders. The repo has no `react-native-svg`; dependencies are owned by the coordinator, so illustrations and icons must be drawn with `View`s and text. Screens may only read the game through `useNewGameDraft()` and navigate with `routes`. The category screen already reads the catalog through `categoriesForMode`; `loadCatalog()` is the other public function of `@/features/content/catalog`.

## Goals / Non-Goals

**Goals:** match the proposal layout with existing tokens and primitives; keep every interactive element ≥ 48 pt with roles and labels; work at 375 × 667 (both screens scroll).

**Non-Goals:** "Continuar partida", settings button, locks, prices, "Pase total", "Restaurar compras", the Pareja "Sin desbloquear…" note, removing `routes.newGame.mode` (shared files).

## Decisions

1. **Mode cards on home.** A `ModeCard` in `src/features/home/` (clay card: ink outline, 6 pt hard shadow, sinks on press) with an absolutely positioned illustration top-right. Heights follow the prototype (Amigos 210, Pareja 180) as `minHeight` so large text can grow. Tap → `reset()`, `setMode(mode)`, `router.push(routes.newGame.category)`. `reset` and `setMode` are both state updates in the same handler, so the mode survives the reset (verified by test).
2. **Illustrations drawn with Views.** Friends: three outlined circles (`surfaceSoft`, `levelEasy`, `points`) layered in order, the middle one with two eye dots and a smile made from a bottom-rounded, top-borderless outlined `View`. Couple: a heart built from a 45°-rotated square and two circles, drawn twice: an ink silhouette enlarged by the outline width, then the `background` fill on top, so only the outer edge shows. Alternatives: `react-native-svg` (new dependency, not ours to add), `expo-symbols` (no web, no outline/fill control). Both illustrations are hidden from accessibility.
3. **Logo tile.** `<Mascot art="icon" size={50}/>` inside the existing outlined `brandRed` tile (64 pt with a 3 pt border), hidden from screen readers since the wordmark names the app.
4. **Copy (usted).** "¿Con quién va a jugar hoy?", "Tome con moderación. Si tomó, no maneje.", "Elija una categoría. La partida arranca suave y se va calentando sola." The prototype's mode subtitles and Pareja subtitle need no change.
5. **Card counts.** A pure helper `standardCardCounts(categoryId)` in `category-picker/` counts `loadCatalog().cards` by level for `heat === 'standard'`. Sin Filtro (`spicy`) is an opt-in layer that the proposal shows as its own card, so it is not counted here (La Previa: 101, Entre Dos: 30 per level). Cheap: the catalog is cached.
6. **Free chip.** Data-driven from `Category.freeDifficulties`: the "GRATIS" chip shows when all three levels are free (La Previa); in Pareja rows, "GRATIS" shows on free levels (Entre Dos: Suave). Nothing marks paid levels: no lock, no price. This follows `pareja.dc.html` minus purchases and tells the truth of the data model, even though the engine does not gate levels yet.
7. **Two category card layouts, chosen by mode.** Amigos: `CategoryCard`, the whole card is one button labelled "name. description. N cartas. Gratis". Pareja: `CoupleCategoryCard`, a non-pressable white card with level rows (level fill colors from `LevelColors`) and a primary `Button` "Jugar <name>". The old `ChoiceCard` and `PickerLayout` are replaced; the lock badge slot moves to `CategoryCard`'s header corner.
8. **Back button.** `BackLink` becomes a 48 × 48 white, outlined square with a 4 pt hard shadow and a Fredoka "‹" glyph; the accessible label stays "Volver"; fallback is `routes.home`.
9. **Mode route.** `src/app/new-game/mode.tsx` renders `<Redirect href={routes.home} />`. `mode-picker-screen.tsx`, its test, and the now unused `playerRangeLabel` mode copy are deleted. The Pareja header chip "2 jugadores" reads `playerLimitsByMode.couple.max`.

## Risks / Trade-offs

- [View-drawn heart looks slightly different from the SVG] → Acceptable for interim art; the coordinator checks it on the web build.
- [Counts exclude Sin Filtro, so La Previa reads 101 while 191 cards exist] → Recorded here; revisit when Sin Filtro gets its own card (HU-09).
- [`routes.newGame.mode` stays until a shared change removes it] → The route only redirects; listed as a shared change request.
