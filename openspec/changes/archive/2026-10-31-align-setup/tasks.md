# Tasks

## 0. Branch

- [x] 0.1 Work on `feat/align-setup` cut from `origin/feat/player-avatar` (main + `Player.avatarId`); verify with `git branch --show-current`.

## 1. Rules

- [x] 1.1 Add failing tests in `setup-rules-test.ts` for `isRowExpanded`, `levelsSummary`, `playerSummary`, and `changeAvatar`; implement them in `setup-rules.ts` / `copy.ts`. Verify with `npm test -- setup-rules`.

## 2. Screen

- [x] 2.1 Update `setup-screen-test.tsx` first (header, avatar change, collapsed rows, remove from summary, summary chips and inline lists, ORDEN shuffle, "¡A jugar! · N jugadores"); see them fail.
- [x] 2.2 Build the header (back button, eyebrow, title) and the player row card (avatar button with swap badge, name, one-line gender control, "No toma", remove); verify the row tests pass.
- [x] 2.3 Add the collapsed summary rows and the dashed "+ Agregar jugador"; verify the collapse tests pass.
- [x] 2.4 Replace the level/end lists and "Barajar" with the FIN / NIVELES / ORDEN chips and the inline option panel, and rename the start button; verify the whole setup suite passes.

- [x] 2.5 Send setup without a mode or category to `routes.home` instead of `routes.newGame.mode` (test first); verify the redirect test passes.

## 3. Verification

- [x] 3.1 Run `npm test` (green, global coverage ≥ 90 %), `npx expo lint`, and `npx tsc --noEmit`, all clean.
- [x] 3.2 E2E (Maestro): N/A here — no setup flow exists in `.maestro/` and agents do not start simulators; the coordinator verifies the screen on the web build.
- [x] 3.3 Docs: no architecture or command change; the design review README already describes the target. Security: no auth/authz impact.

## Workflow follow-up

- Run `adversarial-review`, then archive the change (`openspec-archive-change`) and open the PR.
