# Design

## Context

HU-00 left `src/app/new-game/mode.tsx` and `category.tsx` as placeholders. The draft (`useNewGameDraft()`), the catalog (`categoriesForMode`), `playerLimitsByMode`, `routes`, tokens, and UI primitives already exist and are read-only for this story. Both routes sit inside the root layout's age-protected `Stack` with `headerShown: false`, so each screen draws its own back control.

## Goals / Non-Goals

**Goals:** mode picker, per-mode category list, draft updates, back navigation, one-handed layout, a hidden lock-badge slot for HU-09.

**Non-Goals:** locks and paywall (HU-09), Sin Filtro (HU-10), more categories (content), any change to shared files.

## Decisions

1. **Feature folder `src/features/category-picker/`** holds `copy.ts`, `mode-accent.ts`, `choice-card.tsx`, `back-link.tsx`, `mode-picker-screen.tsx`, `category-picker-screen.tsx`. Route files only re-export the screen as default.
2. **`ChoiceCard`** is local (not in `components/ui`, which is read-only): a full-width `Pressable` with `BorderWidth.regular` ink outline, `Radius.xl`, a hard `ink` shadow layer offset by `ShadowOffset.card`, accent fill, min height 120, and `PressedTravel` on press — the same clay language as `Button`. `CardFrame` is not reused because it is not pressable and its radius/shadow belong to the game card. One `accessibilityRole="button"` per card with a combined label. A `lockBadge?: ReactNode` prop renders in the top-right corner only when provided (HU-09 passes it; nothing at launch).
3. **Accents**: `accentByMode` maps `friends → Colors.primary`, `couple → Colors.couple`; text stays `ink` (contrast passes per design tokens). Category cards take their mode's accent.
4. **Player line** is built in `copy.ts` from `playerLimitsByMode` ("De 2 a 12 jugadores" / "Solo 2 jugadores"), so limits are not duplicated.
5. **Copy**: mode names "Amigos" / "Pareja" and tone lines are UI copy; category names and descriptions come from content only.
6. **Missing mode** on the category screen: render `<Redirect href={routes.newGame.mode} />` (expo-router) instead of a hidden default — the placeholder's `mode = 'friends'` fallback is dropped.
7. **Back**: `BackLink` calls `router.back()` when `router.canGoBack()`, else `router.replace(fallback)` (home for mode, mode for category), covering deep links and web reloads.
8. **Navigation order**: set the draft first, then `router.push(...)`; React batches the state update before the next screen reads it.
9. **One-handed**: header (back + title + subtitle) on top, choices pushed to the lower part (`justifyContent: 'flex-end'`), scrollable via `ScreenContainer scroll` for small screens and future packs.

## Risks / Trade-offs

- `ChoiceCard` repeats the clay-shadow pattern of `Button`/`CardFrame` (pattern noted). **Shared change requested (not done):** promote a pressable card primitive to `src/components/ui/` once HU-02/HU-04 show the same need.
- A Phase C reconciliation is needed for `app-shell`'s placeholder requirement once all screens are replaced (owned by HU-00/coordinator).
- No simulator here: visual check is left to the coordinator on the web build.
- A very fast double tap on a card can call `router.push` twice (same as every `Button` in the app today). Accepted for the MVP; if it shows up on device, add a shared press-once guard (shared UI change, not done here).
