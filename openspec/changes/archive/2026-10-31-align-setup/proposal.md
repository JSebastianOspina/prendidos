# Proposal

## Why

The first playable setup screen follows the tokens but not the approved layout (`docs/design/review/README.md` § 4 · Setup): no back button, no avatars, long chip lists, every player row expanded, and a plain "Empezar" button. The interim avatar art has shipped (`brand-art`), so the screen can now show and change each player's cat.

## What Changes

- Header: square outlined back button (router back, falling back to the category screen), the category name as eyebrow, and the title "¿Quiénes juegan?".
- Player row card: a 56 pt avatar button ("Cambiar avatar de {nombre}") with a `primary` swap badge that moves to the next free avatar, the name field, a one-line gender segmented control, and the "No toma" toggle (`ink` when on).
- From the third player on, rows show as a one-line summary (36 pt avatar, "Caro · Mujer") that expands on tap; every row keeps a remove control while above the minimum.
- Dashed "+ Agregar jugador" button.
- The level and end-condition lists and the "Barajar" button become one row of three summary chips (FIN, NIVELES, ORDEN). FIN and NIVELES open the unchanged option lists inline; ORDEN shuffles.
- Start button "¡A jugar! · N jugadores" (was "Empezar").
- Opening setup without a mode or category now sends the user to Inicio, where the mode is chosen since mode selection moved to home (the mode route is going away).
- Unchanged: limits (2–12 Amigos, exactly 2 Pareja), the missing-name validation, name trimming and the 20-character limit, the draft is never reset here, and the Sin Filtro slot.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-setup`: preloaded players (redirect to Inicio when mode or category is missing), editing players (avatar change, collapsed rows), turn order (ORDEN chip), level filter and end condition (summary chips that open the lists), the start button label, and a new header requirement.

## Impact

- Code: `src/features/setup/**` and its tests; the route file `src/app/new-game/setup.tsx` keeps rendering `SetupScreen`.
- No new dependencies, no native changes, no new development build. Platforms: iOS, Android, web.
- No auth or security impact.
