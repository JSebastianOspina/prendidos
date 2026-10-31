# Proposal

## Why

The game ends on HU-00's placeholder list. HU-06 gives the group a clear winner moment and a one-tap replay, which drives games per session (story `docs/user-stories/hu-06-final-ranking.md`).

## What Changes

- Replace the `src/app/results.tsx` placeholder with the final ranking screen built in `src/features/results/`.
- Winner highlight (name, score, `points` medal as the crown accent on the flame-yellow card); ties share the highlight ("Ana y Luis").
- Full ranking below, one row per shared position ("1. Ana y Luis"), negative scores in `negative`.
- "Jugar otra vez" refills the new-game draft with the finished game's settings and opens setup; "Volver al inicio" goes home. Both forget the finished game.
- No finished game on screen (cleared, deep link, in progress) → redirect home.
- Hidden slot reserved for the HU-09 upsell.

## Capabilities

### New Capabilities

- `final-ranking`: what the end-of-game screen shows (winner, ties, full ranking, negative scores) and where its two actions lead.

### Modified Capabilities

None. The engine already stops saving a finished game (`device-state`, `game-engine`).

## Impact

- Code: `src/app/results.tsx`, new `src/features/results/` (screen, components, pure helpers, copy, tests). No shared file changes.
- Platforms: iOS, Android, web. No native module, no new dependency, no new development build.
- Security: none (no auth, no data leaves the device).
