---
name: security-scan
description: Run a security audit covering OWASP Top 10, secrets detection, dependency vulnerabilities, IAM/env-var hygiene, and Harness agent operational constraints (HITL, schema, docs/tests, SECURITY REVIEW flags). Use before opening a PR on security-sensitive changes.
author: UBITS
version: 1.2.0
---

# security-scan Skill

**Canonical workflow** for security audits in Harness. The `security-auditor` agent references this skill for standard scans and adds deep-investigation expertise only when issues are flagged.

Use when a change touches authentication, authorization, data handling, environment config, AWS infrastructure, schema/migrations, or destructive/operational scripts — or when a PR is flagged as security-sensitive / carries `SECURITY REVIEW NEEDED` comments.

**Standards to enforce:** `docs/security-standards.md` (including § Agent operational constraints), `docs/openspec-tasks-mandatory-steps.md` § Data safety, and secrets/logging rules therein.

## Instructions

Run a security scan on: $ARGUMENTS (defaults to current diff if empty).

### Phase 1 — OWASP Top 10 Review

Review changed code for:

- **A01 Broken Access Control**: missing auth guards, insecure direct object references, missing ownership checks
- **A02 Cryptographic Failures**: plaintext secrets, weak hashing, HTTP in production, JWT `alg:none`
- **A03 Injection**: raw SQL from user input, command injection, XSS in rendered content
- **A05 Security Misconfiguration**: wildcard CORS, verbose error messages, debug endpoints
- **A07 Auth Failures**: missing token validation, no rate limiting, session mismanagement
- **A09 Logging Failures**: sensitive data in logs, missing security event logging

### Phase 2 — Secrets Detection

Scan the diff for:

- Hardcoded API keys, tokens, passwords, or connection strings
- Private keys or certificates committed to source
- `.env` values accidentally included in committed files
- AWS credentials or IAM keys in code or CDK stacks
- Secrets appearing in log statements, fixtures, or committed test data

**Never allow credentials or secrets in source or logs.** Flag as CRITICAL and block the PR.

### Phase 3 — Dependency Audit

Run `npm audit --audit-level=moderate` and report:

- Total vulnerabilities by severity (CRITICAL, HIGH, MODERATE)
- Affected packages and available fix versions
- Whether HIGH/CRITICAL vulnerabilities block the PR (they do — per pipeline gates)

### Phase 4 — IAM and Environment Hygiene (serverless code only)

If the change includes Lambda, CDK, or AWS config:

- Verify IAM roles follow least-privilege — no wildcard `*` on actions or resources
- Verify secrets are loaded from SSM Parameter Store or Secrets Manager, not hardcoded
- Verify no sensitive values are passed directly in CDK `environment` blocks

### Phase 5 — Agent operational constraints & delivery gates

Align with `docs/security-standards.md` § Agent operational constraints. Treat failures as BLOCKED unless genuinely N/A:

1. **No agent DB execution**
   - Diff, scripts, docs, or OpenSpec tasks must not instruct the agent to run SQL clients, ad-hoc DB scripts, `TRUNCATE`, `DROP` on tables with real data, `migrate:fresh` / `migrate:refresh`, `db:wipe` / `db:seed`, or ORM wipe/seed/reset equivalents.
   - If a privileged command is still required: require HITL — exact cwd + command, **explicit confirmation**, and stated **consequences**. Do not suggest bypass SQL.

2. **Schema changes**
   - Must be **versioned ORM migrations** only (never direct SQL apply).
   - Must prefer **backwards-compatible** expand/contract design.
   - When migration files changed, require `migration-review` before merge.

3. **Security review comments**
   - Any auth / authz / guards / roles / permissions / secrets handling / route exposure change MUST include an explicit `SECURITY REVIEW NEEDED — …` comment in code (and tasks checkbox when OpenSpec applies). Missing flag → ISSUES FOUND / BLOCKED for that surface.

4. **Documentation & tests accompany code**
   - Architecture / data-flow / process changes (endpoints, workers, subscribers, listeners, scheduled jobs) → matching `docs/*.md` updates.
   - Install / commands / documented product capabilities → **README.md** updates.
   - Application code changes → unit or integration tests present or newly created.
   - Gaps → report under this phase (High/BLOCKED when the change is security-sensitive; still ISSUES FOUND otherwise).

5. **Soft delete / mutating paths**
   - Prefer soft delete when the project defines it; cleanup via API only.
   - Mutating API verification plans need an explicit human grant; never recommend hard-delete-via-SQL cleanup.

**Do not** execute privileged DB commands as part of this scan. Observe via diff, HTTP contracts, and official test runners only.

### Output Format

```
## Security Scan Report

### OWASP — [PASS / ISSUES FOUND]
[List of issues with file:line references, or "No issues found"]

### Secrets — [PASS / ISSUES FOUND]
[List of findings, or "No secrets detected"]

### Dependencies — [PASS / X vulnerabilities]
[Table: package | severity | fix version]

### IAM/Env — [PASS / ISSUES FOUND / N/A]
[Findings or "Not applicable"]

### Operational constraints — [PASS / ISSUES FOUND / N/A]
| Check | Status | Notes |
|-------|--------|-------|
| No agent DB / destructive without HITL | | |
| Versioned + backwards-compatible schema | | |
| SECURITY REVIEW NEEDED on auth/security impact | | |
| Docs accompany code (docs/*.md + README when needed) | | |
| Tests accompany application code | | |
| Soft delete / mutating HITL hygiene | | |

### Verdict
[APPROVED — safe to proceed] OR [BLOCKED — must fix before PR]
```

## Notes

- A CRITICAL or HIGH dependency vulnerability without a fix requires explicit risk acceptance documented on the PR.
- Secrets in source or logs, agent-executed destructive DB paths, and unflagged auth/security impacts are default **BLOCKED**.
- This skill reports findings — it does not auto-fix. For deep investigation of flagged issues, adopt **`ai-specs/agents/security-auditor.md`**.
- Refer to `docs/security-standards.md` for the full UBITS security baseline and Harness invariant operational constraints.
- Schema deep-dive: run **`migration-review`** when migration files are in scope; do not duplicate its full checklist here — confirm it was run and cite gaps.
