---
name: migration-review
description: Review Prisma or TypeORM database migrations for safety before merging. Checks versioned-only schema changes, destructive operations, missing indexes, backwards compatibility, HITL for privileged DB ops, and rollback feasibility.
author: UBITS
version: 1.1.0
---

# migration-review Skill

Use before merging any branch that contains database schema changes — Prisma migrations (`prisma/migrations/`) or TypeORM migration files.

**Standards to enforce:** `docs/security-standards.md` § Agent operational constraints, `docs/data-model.md` Migration Notes, and `docs/openspec-tasks-mandatory-steps.md` § Data safety.

All schema changes MUST be expressed as **versioned migrations** of the project ORM — never as agent-executed SQL or live schema edits. Prefer **backwards-compatible** expand/contract changes.

## Instructions

Review the migration files in: $ARGUMENTS (defaults to all migration files in the current diff).

### Phase 0 — Versioning and process compliance

Before safety content review, verify:

- Schema changes land only under the project's **versioned migration** folders (Prisma / TypeORM) — flag any ad-hoc SQL scripts, manual APPLY steps, or "run this SQL in prod" notes meant for the agent.
- Tasks / PR instructions do **not** tell the agent to execute DB clients, `TRUNCATE`, `DROP` on tables with real data, `migrate:fresh` / `migrate:refresh`, `db:wipe` / `db:seed`, or ORM wipe/seed/reset.
- If a privileged command is still required for local verification: require **HITL** — exact command, stated consequences, explicit human confirmation — then continue. Do not recommend bypass SQL.
- Soft delete: if the migration introduces hard-delete semantics where the project prefers soft delete (`deletedAt` / `deletedBy`, etc.), flag and cross-check `docs/data-model.md`.
- Documentation: schema / data-model / migration process updates must accompany `docs/data-model.md` (and related `docs/*.md`); install/seed command changes must update README when applicable.
- Application code consuming the new schema must have matching automated tests (unit/integration); note gaps for the author to fix (do not invent DB verification via SQL).

**Do not** run migrations, seeds, or DB queries as part of this review.

### Phase 1 — Destructive Operation Detection

Flag any migration that contains:

- `DROP TABLE` or `DROP COLUMN` without a corresponding data backup or soft-delete strategy
- `ALTER COLUMN` that reduces column length or changes type in a breaking way
- `DELETE FROM` bulk operations without a `WHERE` clause
- Removal of a column still referenced by application code in `develop` or `main`
- Any pattern that implies production wipe/seed (`TRUNCATE` of shared tables, recreate-from-scratch without expand/contract)

### Phase 2 — Index Safety

Check for:

- New indexes on large tables created without `CONCURRENTLY` (flag as risk for production)
- Missing indexes on foreign key columns
- Unique constraints added to columns that may contain duplicates at migration time

### Phase 3 — Backwards Compatibility

Assess whether the migration is safe during a rolling deployment (previous app version still running). **Backwards compatibility is mandatory** unless a coordinated deploy plan is explicitly documented on the PR:

| Operation                           | Safety                                   |
| ----------------------------------- | ---------------------------------------- |
| Add nullable column                 | SAFE                                     |
| Add NOT NULL column without default | UNSAFE — backfill required first         |
| Rename column                       | UNSAFE — use expand-contract pattern     |
| Add new table                       | SAFE                                     |
| Drop table                          | UNSAFE — remove all app references first |
| Add index CONCURRENTLY              | SAFE                                     |

Expand/contract expected path: add → dual-write/read → backfill → switch → drop in a later migration.

### Phase 4 — Rollback Feasibility

Evaluate whether the migration can be reversed:

- Is there a `down` migration (TypeORM) or a rollback script?
- Can the change be reverted without data loss?
- Is a rollback plan documented in the PR?

### Output Format

```
## Migration Review Report

### Migrations Reviewed
[List of migration files and their timestamps]

### Process compliance — [SAFE / RISKS FOUND]
[Versioned-only, no agent DB execution, HITL when privileged, docs/tests coupling notes]

### Destructive Operations — [SAFE / RISKS FOUND]
[Details or "None detected"]

### Index Safety — [SAFE / WARNINGS]
[Details or "All indexes are safe"]

### Backwards Compatibility — [COMPATIBLE / BREAKING]
[Per-migration compatibility assessment]

### Rollback — [REVERSIBLE / IRREVERSIBLE]
[Details and rollback plan if needed]

### Verdict
[APPROVED] OR [REQUIRES CHANGES: list what must be fixed]
```

## Notes

- A BREAKING migration must be accompanied by a feature flag or coordinated deploy plan documented in the PR — otherwise **REQUIRES CHANGES**.
- Always check the current `develop` branch for application code that references the columns/tables being modified.
- UBITS uses both Prisma (preferred for new projects) and TypeORM (legacy). Identify which ORM is used before reviewing.
- Cross-link: if auth/authz or delete filters change with the migration, expect `SECURITY REVIEW NEEDED — …` comments and consider `/security-scan`.
