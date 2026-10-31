# Proposal

## Why

The final ranking shipped as a yellow winner card and a plain list, with no mascot and no avatars. The design review (`docs/design/review/README.md` § 8 and § 12) asks for the approved layout: a crowned mascot header, a podium for the top players, avatar rows for the rest, and side-by-side actions. The ranking is the end of the night (peak-end), so it should feel like a celebration.

## What Changes

- Header: eyebrow with the category and the game length ("La Previa · 10 rondas", adapted for points and open games), the 48 pt winking mascot with a token-drawn crown, and the title "¡Ganó {nombre}!" or, on a tie for first, "¡Empate arriba!" plus "{A} y {B} comparten el primer puesto."
- Podium for the first three players: avatars above the steps (sole winner 64 pt with a crown, co-winners 60 pt, others 52 pt), steps colored `primary` / `surfaceSoft` / `surface` by position, tied players sharing step height and number. Two-player games show two steps.
- Rows from the fourth player on: position, 32 pt avatar, name, and score, negative scores in `negative`.
- Actions side by side: "Inicio" (white) and "Otra partida" (`primary`), with the same behavior as today's "Volver al inicio" and "Jugar otra vez".
- Long names are truncated with an ellipsis on the podium and in rows; accessibility labels keep the full name.
- Unchanged: the redirect without a finished game, the finished game not being resumable, the empty upsell slot (HU-09), and the final refusal penalty shown by the turn screen before the ranking.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `final-ranking`: the winner highlight becomes a header plus podium; the tie wording changes; the ranking becomes podium plus rows with avatars; the action labels change.

## Impact

- Code: `src/features/results/**` and its tests only; `src/app/results.tsx` unchanged.
- Platforms: iOS, Android, and web. No new dependency and no new development build (pure React Native views and existing `Mascot` / `PlayerAvatar`).
- No auth, authorization, or security impact.
