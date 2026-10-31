# Proposal

## Why

Prendidos is an 18+ drinking game: both stores expect an age confirmation with a responsible-drinking notice before any alcohol content, and the PRD (§8) makes it a one-time gate. HU-00 left only a placeholder at `src/app/age-gate.tsx` (story: `docs/user-stories/hu-01-age-gate.md`).

## What Changes

- Replace the age-gate placeholder with the branded 18+ screen: `brandRed` logo tile with the "Prendidos" wordmark, the question, a short responsible-drinking notice, a primary "Soy mayor de 18 años" button and a visible secondary decline.
- Confirming persists the age through the existing `confirmAge()` (HU-00) and the protected stack moves the user to Inicio.
- Declining shows an adults-only message and keeps the user on the screen.
- Actions are a fixed footer so small phones never scroll the primary button away.
- Maestro flow `.maestro/age-gate.yaml`.

## Capabilities

### New Capabilities

- `age-gate`: the one-time 18+ confirmation that guards the whole app on first use.

### Modified Capabilities

- None (the `app-shell` guard and `device-state` persistence from HU-00 are reused unchanged).

## Impact

- Code: `src/app/age-gate.tsx`, new `src/features/age-gate/` (screen, copy, tests), `.maestro/age-gate.yaml`.
- No new dependencies, no native changes, no new development build. Platforms: iOS, Android, web.
- Security: age gating (store-compliance gate, not identity verification) — SECURITY REVIEW NEEDED flag carried in tasks. Only an ISO timestamp is stored on-device; no personal data.
