---
description: Security baseline — secrets, auth, OWASP, dependency hygiene, and compliance. Customize per project.
alwaysApply: true
---

# Security Standards

## Status

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| Customized     | Yes                                       |
| Mandatory scan | `/security-scan` before merging to `main` |

---

## Baseline (always apply)

- **Never** hardcode credentials, API keys, tokens, or connection strings in source code or docs
- **Never** commit `.env` files — use `templates/*.env.example` and keep `.env` in `.gitignore`
- **Never** log secrets, tokens, or PII
- Run `/security-scan` before merging security-sensitive changes

---

## Compliance and Sensitive Data

- Applicable standards: OWASP MASVS (mobile) as the baseline; Apple App Store Review Guidelines and Google Play policies (alcohol-related content, in-app purchases); GDPR / local privacy law only if personal data is ever collected.
- Sensitive data handled: **payments**, through App Store / Google Play in-app purchases only. The app never sees card data. No accounts and no server-side personal data today; player names are entered locally and never leave the device.
- Age-restricted content: the app promotes alcohol consumption → an **18+ age confirmation** gate before first play, store age ratings set accordingly (App Store 17+/alcohol references; Google Play mature), and no targeting of minors in copy or assets.
- Data retention and deletion: all data is on-device; uninstalling the app removes it. If accounts or a backend are added, define retention and a deletion flow here first.

---

## Secrets Management

- Approved secret stores: EAS environment variables with **secret** visibility for build-time credentials; `expo-secure-store` for sensitive values on the device.
- Anything prefixed `EXPO_PUBLIC_` or placed in `app.json` / `app.config.*` is bundled into the app and is **public** — never put secrets there.
- Store credentials (App Store Connect API key, Google Play service account) are managed by EAS (`eas credentials`) and never committed.
- Rotation policy: rotate any credential immediately if it appears in a commit, log, or bundle.

---

## Authentication and Authorization

- Auth mechanism: none today (no user accounts).
- Authorization model: premium content is gated by **store entitlements**. Verify entitlements through the store SDK on launch and before unlocking content; a local cache may be used offline but must be re-verified when online.
- If accounts or a backend are added, mark the change `SECURITY REVIEW NEEDED` and fill this section first.

---

## OWASP and Input Validation

- Required checks (OWASP MASVS): insecure data storage (MASVS-STORAGE), insecure communication (MASVS-NETWORK — HTTPS only), code tampering of purchase state (MASVS-RESILIENCE), and dependency vulnerabilities.
- Input validation: player names are trimmed and length-limited; bundled content is typed and validated by unit tests.
- Deep links (`prendidos://`): validate route params with Expo Router typed routes; never trust params to unlock premium content.
- File upload rules: not applicable.

---

## Dependency and Supply Chain

- Vulnerability scan: `node scripts/audit-gate.js` in CI (wraps `npm audit`); HIGH/CRITICAL advisories block merge.
- Exceptions: only in `.audit-allowlist.json`, one entry per advisory ID with a `reason` and a `reviewBy` date (max ~2 months). Expired entries fail CI. Add an exception only when no non-breaking fix exists and the package is not shipped in the app bundle; note it in the PR.
- Update SLA: HIGH/CRITICAL within 7 days; regular updates follow Expo SDK upgrades (`npx expo install --fix`).
- Lockfile and approval policy: `package-lock.json` is committed; new dependencies are added only with `npx expo install`, preferring Expo modules; a new native dependency requires justification in the OpenSpec design.

---

## Frontend Security

- Token storage policy: no tokens today; if added, use `expo-secure-store` only (never `AsyncStorage`).
- Web build: `react-native-web` output exists but is not a product target; if web is shipped, add CSP and XSS rules here.
- Exposed configuration: treat the JS bundle and EAS Update payloads as public.

---

## Environment-Specific Rules

| Rule                   | Development            | Preview (internal)         | Production           |
| ---------------------- | ---------------------- | -------------------------- | -------------------- |
| HTTPS required         | Yes                    | Yes                        | Yes                  |
| Verbose errors exposed | Yes (dev menu, LogBox) | No                         | No                   |
| Debug tooling allowed  | Yes                    | Dev client only            | No                   |
| Real user data         | No                     | No                         | Yes (on-device only) |
| Purchases              | Store sandbox          | Store sandbox / TestFlight | Live store           |
| Secrets storage        | EAS env (development)  | EAS env (preview)          | EAS env (production) |

---

## Agent operational constraints (Harness invariant — do not remove)

> **DO NOT DELETE, SHORTEN, OR REWRITE THIS SECTION** when customizing this file in Stage 2 (`README.md` § Customize `docs/`).  
> Fill only the project-specific sections above (`Compliance`, `Secrets`, `Auth`, `OWASP`, etc.).  
> You may _add_ project notes _after_ this section; never replace the rules below.

These rules always apply to AI coding agents (OpenSpec `/propose` → `/apply`, hooks, and skills). Details and task checklists: `docs/openspec-tasks-mandatory-steps.md`.

- **No direct DB execution by the agent**: do not run SQL clients, ORM REPLs, ad-hoc query scripts, `TRUNCATE`, `DROP`, `migrate:fresh` / `migrate:refresh`, `db:wipe`, `db:seed`, `prisma migrate reset`, `prisma db seed`, or equivalent privileged wipe/seed/reset commands for the project's ORM. Harness hooks deny these patterns.
- **Human-in-the-loop (HITL), not skip**: if a blocked command is still required (e.g. verifying a seed-file change needs `npx prisma db seed` or `npm run db:seed`), the agent must explain **why**, state **consequences**, give the human the **exact** cwd + command, wait for confirmation, then continue. Do not abandon the step and do not bypass the hook with alternate SQL.
- **API-only observation/mutation by the agent**: verify and clean up test data through HTTP endpoints (or official unit/integration/e2e runners). Never ad-hoc SQL “to check state”.
- **Soft delete preferred**: when the project defines soft delete, agents may exercise that DELETE (or equivalent) path after a human mutating-plan grant; clean up via API only. **If the project has no soft delete**, HITL still applies for mutating/destructive actions — the agent explains why the action is needed, how the human should run it (or approves the API plan), waits, then continues.
- **Human grant for mutating endpoints**: before the first mutating call in a session (`POST` / `PUT` / `PATCH` / `DELETE`, including soft-delete), present the plan and consequences and wait for explicit approval; one grant may cover the approved plan. Read-only `GET` and ordinary Jest/unit suites do not require this grant.
- **Schema**: all schema changes via **versioned migrations** of the project ORM (Harness default: Prisma); prefer backwards-compatible expand/contract; run `migration-review` before merge when migration files change.
- **Security review flag**: comment `SECURITY REVIEW NEEDED — …` on auth/authz/security-impacting code so it can be scanned (`/security-scan`) before merge.
- **OpenSpec customization**: do **not** edit OpenSpec-generated skills/commands under `.cursor/` or `.claude/` (lost on `openspec update`). Put durable rules in `openspec/config.yaml`, `docs/`, and Harness-owned `ai-specs/` (symlink skills with `scripts/sync-skills.sh`).
