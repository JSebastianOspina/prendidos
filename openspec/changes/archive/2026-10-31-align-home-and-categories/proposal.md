# Proposal

## Why

The first playable build follows the tokens but not the approved layouts of Inicio, the mode screen, and the category screen (see `docs/design/review/README.md` §§ 2–3). The proposal merges mode selection into Inicio, so choosing who plays takes one tap less, and turns the orange category card into an informative white card.

## What Changes

- Inicio shows a header row (64 pt logo tile with the mascot icon art on `brandRed` + red "Prendidos" wordmark), the heading "¿Con quién va a jugar hoy?", two large mode cards (Amigos on `primary`, Pareja on `couple`, each with a decorative token-drawn illustration, title, and subtitle), and the footer "Tome con moderación. Si tomó, no maneje."
- Tapping a mode card on Inicio clears the previous draft (keeping remembered players), stores the mode, and opens the category screen. **BREAKING**: the "Nueva partida" button and the tagline are removed.
- The separate mode screen goes away: `/new-game/mode` only redirects to Inicio. The category screen redirects to Inicio when the draft has no mode, and its back control falls back to Inicio.
- The category screen gets a square outlined back button next to the mode title ("Amigos" / "Pareja"), a subtitle, and cards that flow from the top.
- Amigos: each category is a white card with its name, description plus card count, three level bars, and a "GRATIS" chip when every level is free.
- Pareja: each category is a white card with its name, one row per level (level name, card count, "GRATIS" on free levels), and a "Jugar <category>" button. No locks, prices, or purchase copy.

Platforms: iOS, Android, web. No new dependency and no new development build. No auth/authz impact (the 18+ gate is untouched).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `home-screen`: the brand header becomes the logo row + wordmark; "Start a new game" is replaced by the mode choice on Inicio; adds the moderation footer.
- `category-picker`: the mode-choice requirement moves to Inicio; the category list gains the mode header, subtitle, card count, level bars, free chip, and the Pareja level rows; the missing-mode redirect and the back fallback point to Inicio.
- `app-shell`: the screen flow becomes 18+ → Inicio (modo) → Categoría → Setup → Turno → Ranking.

## Impact

- Code: `src/features/home/**`, `src/features/category-picker/**`, `src/app/new-game/mode.tsx`, `src/app/new-game/category.tsx`. `mode-picker-screen.tsx` and its test are deleted.
- Shared follow-ups (not edited here): remove `routes.newGame.mode` from `src/features/navigation/routes.ts` (and its test), its `Stack.Screen` in `src/app/_layout.tsx`, the `new-game/mode` stub in the age-gate flow test, and point the setup screen's not-ready redirect (`src/features/setup/setup-screen.tsx`) at `routes.home`.
