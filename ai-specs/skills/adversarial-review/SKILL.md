---
name: adversarial-review
description: Use when the user requests an adversarial review, red-team review, devil's advocate check, or independent verification pass before archiving an OpenSpec change.
author: cburbano@ubits.co
version: 1.1.0
---

# adversarial-review Skill

Act as an **independent adversarial reviewer**: assume gaps, flaws, or unsafe behavior may exist until you have argued against them with evidence.

This skill is intended for the **verification window** of spec-driven development (after implementation, **before** archiving), when the human runs a **different agent or session** than the one that implemented the change.

Do **not** prescribe which agent, model, or IDE to use. That is the human's choice.

**Standards to enforce:** `docs/security-standards.md` § Agent operational constraints, `docs/openspec-tasks-mandatory-steps.md` § Data safety, and `docs/documentation-standards.md`. Fail archive when the change violates them.

## Inputs

- Optional context from user (same style as `show-spec-working`):
  - Direct ticket id in text (for example: `SCRUM-10`)
  - Feature or change name
  - Endpoint(s)
  - Frontend route(s)
  - **Pull request**: Bitbucket PR URL or workspace/repo and PR id (for example: `https://bitbucket.org/workspace/repo/pull-requests/42` or `workspace/repo#42`)
- If missing, infer from the current session (active change, branch, or OpenSpec folder).

Resolve scope in this order: explicit ticket or change name → PR when given → current active work.

## Mindset (adversarial review)

Borrowed from common red-team / adversarial practice:

- **Try to break the system**, not only to confirm happy paths.
- **Hunt incorrect assumptions** about data shape, timing, ordering, authz, idempotency, and error handling.
- **Trace cross-boundary and composition risks**: pieces that look fine in isolation but fail together (multi-file, API plus UI, retries plus side effects).
- **Treat the diff as incomplete context**: missing tests, missing negative paths, or spec drift can hide issues.
- **Calibrate depth** to risk: auth, payments, PII, privilege boundaries, and data mutation deserve stricter scrutiny.
- **Assume operational-safety gaps**: missing docs/tests, agent-executed DB commands in tasks, unversioned schema edits, or silent auth/security diffs until proven otherwise.

## Workflow

### Step 1 — Load the specification side first

1. Identify the OpenSpec change directory and read the relevant artifacts (proposal, design, specs, scenarios, `tasks.md`).
2. Extract **acceptance criteria and explicit non-goals**. List what must be true for "done."
3. Note anything **underspecified** (ambiguous acceptance, missing error cases, missing security constraints).
4. Scan `tasks.md` for **data-safety violations**: agent-executed SQL / `TRUNCATE` / `DROP` / `migrate:fresh` / `migrate:refresh` / `db:wipe` / `db:seed` / ORM reset-seed equivalents without HITL handoff; missing documentation or test steps when code changed.

### Step 2 — Load the implementation side

1. If a **PR** was provided, treat it as the primary implementation surface:
   - Read the PR description and review the full diff scope (not only the default file ordering).
   - Map **files and changes** to spec sections and tasks.
2. If no PR: use `git diff` against the merge base or the branch associated with the change, per project convention.

### Step 3 — Adversarial pass (refute, do not rubber-stamp)

For each acceptance criterion or scenario:

1. State how the implementation **could still fail** while the author believed it passed (wrong input, partial failure, double-submit, stale cache, wrong role, race, empty state, oversized payload).
2. Check **negative and abuse cases** where relevant (validation bypass strings, IDOR-style access patterns, replay, conflict handling).
3. Check **tests and verification artifacts**: do they **prove** the criterion, or only the happy path?
4. Record **spec vs code mismatches** (spec says X, code does Y) as first-class findings.

### Step 3b — Operational safety and delivery gates (mandatory)

Argue **against** compliance until evidence shows each applicable gate passes. Treat violations as **Blocker** (or **Major** only when clearly follow-up with no archive risk):

| Gate                                 | What to verify                                                                                                                                                                                                             | Typical evidence                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **No agent DB execution**            | Diff, tasks, scripts, and verification notes do not run or recommend agent-executed DB clients, ad-hoc SQL, `TRUNCATE`/`DROP` on real data, `migrate:fresh`/`migrate:refresh`, `db:wipe`/`db:seed`, or ORM wipe/seed/reset | Absent from tasks; HITL handoff with exact command + consequences when privileged step still required |
| **Schema versioning**                | Schema changes are **versioned ORM migrations only** — never pasted SQL or live schema edits                                                                                                                               | Migration files under project ORM paths; no raw SQL apply steps                                       |
| **Backwards compatibility**          | Schema changes prefer expand/contract; rolling-deploy safe or coordinated plan documented                                                                                                                                  | Migration design + `migration-review` run/report when migrations changed                              |
| **Documentation accompanies code**   | Architecture / data-flow / process changes update `docs/*.md`; install / commands / documented capabilities update **README.md**                                                                                           | Matching doc/README hunks in the same change                                                          |
| **Tests accompany application code** | Each application-code change has unit or integration coverage; missing suites were **created**, not deferred                                                                                                               | New/updated test files proving behavior                                                               |
| **No secrets exposure**              | No credentials/secrets in source, fixtures, or logs                                                                                                                                                                        | Clean secrets scan; no hardcoded tokens/connection strings                                            |
| **Security review flag**             | Auth / authz / security-impacting diffs include explicit `SECURITY REVIEW NEEDED — …` comments (and tasks checkbox when OpenSpec)                                                                                          | Comment + optional `/security-scan` before merge                                                      |
| **Soft delete / mutating HITL**      | Delete paths prefer soft delete when defined; mutating API verification plans require explicit human grant                                                                                                                 | Spec/tasks/API notes; no hard-delete-via-SQL cleanup                                                  |

Cross-check with `/security-scan` and `migration-review` findings when those surfaces changed; do not rubber-stamp their absence.

### Step 4 — Severity and recommendations

Classify each finding:

- **Blocker**: incorrect behavior, security/privacy issue, operational-safety violation (DB wipe/seed by agent, unversioned schema, secrets in source/logs, missing SECURITY REVIEW flag on auth impact), or spec violation that should stop archive.
- **Major**: likely bug or significant gap (missing tests/docs for changed app behavior, backwards-incompatible schema without plan); fix or spec update required before archive.
- **Minor**: clarity, maintainability, or low-risk gap; can follow up.
- **Question / assumption**: needs human or author confirmation.

For each finding, state whether the fix belongs in **code**, **tests**, **OpenSpec artifacts** (scenarios, specs, tasks), or **documentation**.

### Step 5 — Verdict

End with a clear verdict:

- **PASS (adversarial)**: no blockers or majors; minors listed optionally.
- **PASS WITH GAPS**: minors only but tracked.
- **FAIL**: at least one blocker or major until addressed.

## Output format

Use this structure in chat:

```markdown
## Adversarial review

**Scope**: <ticket / change / PR>
**Sources**: <list spec paths + PR or diff reference>

### Spec and task alignment

- ...

### Operational safety gates

| Gate                                           | Status (PASS / FAIL / N/A) | Evidence |
| ---------------------------------------------- | -------------------------- | -------- |
| No agent DB execution                          |                            |          |
| Schema versioning + backwards compat           |                            |          |
| Docs accompany code                            |                            |          |
| Tests accompany app code                       |                            |          |
| Secrets hygiene                                |                            |          |
| SECURITY REVIEW NEEDED on auth/security impact |                            |          |
| Soft delete / mutating HITL                    |                            |          |

### Findings

| Severity                | Area | Finding | Evidence | Suggested fix (code / spec / tests / docs) |
| ----------------------- | ---- | ------- | -------- | ------------------------------------------ |
| Blocker / Major / Minor |      |         |          |                                            |

### Verdict

PASS | PASS WITH GAPS | FAIL

### Recommended next steps (before archive)

- ...
```

## Guardrails

- **Do not** praise implementation to "balance" criticism unless a strength **directly mitigates a documented risk**.
- **Do not** skip reading OpenSpec artifacts when they exist in the repo.
- **Do not** recommend that the reviewing or implementing agent run privileged DB commands; if still required, require HITL with exact command and stated consequences.
- If you cannot access the PR or diff, say so and list exactly what is needed to continue.

## Completion

Always end with the verdict and whether archiving is **advisable** in the current state.
