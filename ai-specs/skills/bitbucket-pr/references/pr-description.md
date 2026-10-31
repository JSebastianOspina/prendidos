# Pull Request Template

> Used by `/bitbucket-pr` skill. Copy to your project's `.bitbucket/pull-request-template.md`.
>
> **Bitbucket Cloud note:** GitHub-style `- [ ]` / `- [x]` task lists are **not** rendered
> (they collapse to plain bullets). Use Unicode checkboxes instead: `☐` (unchecked) and `:ballot_box_with_check:` (checked).
>
> **Harness hook note:** Do not put the literal tokens `TRUNCATE`, `DROP TABLE`, `DROP DATABASE`,
> `migrate:fresh`, `migrate:refresh`, `db:wipe`, or `db:seed` in this template. The PR body is often
> passed through a shell command; those strings trigger the destructive-command block hook as false positives.

---

## [TICKET-ID] Short description of what this PR does

### Type of Change
- ☐ Feature
- ☐ Bug fix
- ☐ Refactor
- ☐ Documentation
- ☐ Configuration / Infrastructure
- ☐ Hotfix

### Summary
<!-- What changed and why — 2-4 bullet points -->
-
-

### Jira Ticket
<!-- Link to the Jira ticket -->
[TICKET-ID](https://ubits.atlassian.net/browse/TICKET-ID)

### Test Plan
<!-- What was tested — check all that apply -->
- ☐ Unit tests pass (`npm test`)
- ☐ Integration tests pass
- ☐ Manual testing performed — describe what was tested:
  -
- ☐ No tests required — explain why:

### Breaking Changes
- ☐ No breaking changes
- ☐ Breaking change — describe impact and migration path:

### Security
- ☐ `/security-scan` passed — no HIGH/CRITICAL findings (required when auth/security-sensitive)
- ☐ No secrets or credentials introduced (code, logs, curl examples, reports)
- ☐ Auth/authorization logic unchanged **or** explicitly called out for review
- ☐ No direct SQL/DB CLI used; schema changes via versioned Prisma migrations only
- ☐ Schema change is backward compatible (or breaking impact + migration path documented)
- ☐ No destructive database reset operations used against real data

### Checklist
- ☐ Code follows kebab-case naming convention
- ☐ TypeScript types are complete — no `any`
- ☐ Automated tests added/updated for app code changes
- ☐ Brain `docs/*.md` / `api-spec.yml` / `data-model.md` updated when architecture/API/process changed
- ☐ Sibling `README.md` updated when install/commands/features changed
- ☐ CHANGELOG.md updated (for releases)
- ☐ ADR created if a significant architectural decision was made (`/create-adr`)
- ☐ OpenSpec tasks followed `docs/openspec-tasks-mandatory-steps.md` §0 (Team AI Usage Policy)
