---
name: code-auditing
description: Run a 6-phase code quality audit covering security, operational safety (HITL/DB), documentation and test coupling, performance, type safety, dead code, and library best practices. Ends with a prioritized action plan.
author: UBITS
version: 1.1.0
---

# Code Auditing Skill

Comprehensive methodology for systematic code quality audits.

**Standards to enforce:** `docs/security-standards.md` § Agent operational constraints, `docs/openspec-tasks-mandatory-steps.md`, `docs/documentation-standards.md`, and `docs/data-model.md` migration notes. Align findings with those documents — do not invent softer rules.

## When to Use

- Comprehensive code quality audits
- Security vulnerability assessments
- Technical debt identification
- Pre-release code reviews
- Best practices verification
- Library and dependency audits
- Verification that delivery gates (docs, tests, schema safety, security flags) accompany code changes

## Audit Phases

### Phase 0: Pre-Analysis Setup

1. Check for project configuration files (package.json, tsconfig.json, etc.)
2. Identify tech stack and main libraries
3. Check for linting/formatting configs
4. Run existing linting/testing commands as baseline
5. Load documentation for identified core libraries
6. Load `docs/security-standards.md` § Agent operational constraints and `docs/openspec-tasks-mandatory-steps.md` § Data safety

### Phase 1: Discovery

1. Find all code files by type
2. Create tracking list for each file
3. Group files by module/feature for contextual analysis
4. Note companion surfaces: OpenSpec `tasks.md`, migration folders, `docs/*.md`, README, and test trees tied to the audit scope

### Phase 2: File-by-File Analysis

For each file, analyze for:

- Dead code (unused functions, variables, imports)
- Code smells and anti-patterns
- Custom implementations that could use established libraries
- Security vulnerabilities
- Operational-safety violations (agent DB access, destructive commands, missing HITL)
- Performance issues
- Outdated patterns or deprecated APIs
- Missing error handling
- Overly complex functions
- Duplicate code
- Missing `SECURITY REVIEW NEEDED` comments on auth/authz/security impact

### Phase 3: Best Practices Verification

For every library and framework:

1. Retrieve official documentation
2. Compare implementation against official patterns
3. Identify deviations from recommendations
4. Note outdated usage patterns
5. Flag discouraged anti-patterns

### Phase 4: Pattern Detection

Look for recurring issues:

- Common anti-patterns across files
- Duplicated logic that could be abstracted
- Inconsistent coding styles
- Missing error handling patterns
- Recurring delivery-gate gaps (untagged security diffs, schema edits without migrations, code without tests/docs)

### Phase 5: Library Recommendations

For custom implementations:

1. Check if current libraries provide the functionality
2. Search for mature ecosystem packages
3. Verify library health (commits, issues, activity)
4. Check compatibility with project setup

### Phase 6: Comprehensive Report

Generate detailed report with:

- Executive summary
- Critical issues requiring immediate attention
- Operational safety / delivery-gate summary
- File-by-file findings
- Prioritized action plan
- Effort estimates
- Library recommendations

## Issue Priority Levels

- **Critical** - Security vulnerabilities, secrets in source/logs, agent-executed destructive DB paths, broken functionality
- **High Priority** - Unversioned schema changes, backwards-incompatible migrations without plan, missing tests/docs for app changes, missing SECURITY REVIEW flags on auth impact, performance bottlenecks, unmaintainable code
- **Medium Priority** - Code quality, best practices deviations
- **Low Priority** - Style, minor improvements
- **Quick Wins** - Less than 30 minutes to fix

## Analysis Categories

### Security

- Hardcoded secrets; credentials or secrets in logs
- SQL injection risks
- XSS vulnerabilities
- Missing input validation
- Exposed sensitive data
- Auth / authz / security-impacting changes **without** an explicit `SECURITY REVIEW NEEDED — …` comment

### Operational safety (Harness invariant)

- Agent-executed or agent-suggested direct DB access (SQL clients, ORM REPLs, ad-hoc query scripts)
- Destructive/privileged commands without HITL: `migrate:fresh`, `migrate:refresh`, `db:wipe`, `db:seed`, `TRUNCATE`, `DROP` on tables with real data, ORM wipe/seed/reset equivalents
- Destructive steps that omit explicit human confirmation and consequence statement
- Schema changes expressed as direct SQL execution instead of **versioned ORM migrations**
- Schema changes that break backwards compatibility without expand/contract or coordinated deploy plan
- Hard-delete / SQL cleanup when soft delete is the project path; missing human grant for mutating API plans

**Do not** recommend that the auditor (or implementer) run privileged DB commands to "verify" findings. Prefer HTTP/API observation, official test runners, and `migration-review` / `/security-scan`.

### Delivery coupling (docs and tests)

- Architecture / data-flow / process changes (HTTP endpoints, workers, subscribers, listeners, scheduled jobs, etc.) without matching `docs/*.md` updates
- Install / commands / documented capability changes without **README.md** updates
- Application code changes without corresponding automated unit or integration tests (create if missing — flag as High when absent)

### Performance

- Inefficient algorithms
- Blocking operations
- Memory leaks
- Missing caching opportunities
- N+1 query patterns

### TypeScript/Type Safety

- Missing type annotations
- Use of `any` type
- Custom types duplicating official types
- Missing @types packages

### Async/Promise Issues

- Missing await keywords
- Unhandled promise rejections
- Callback hell

### Dead Code

- Unused imports and exports
- Unused functions, classes, and methods
- Unused variables and types
- Unreachable code blocks
- Unused files (not imported anywhere)
- Unused dependencies

**Tools:**

- JavaScript/TypeScript: `npx knip --reporter json`
- Python: `deadcode . --dry`

**Important:** Always verify tool findings before reporting. Check for:

- Dynamic imports (`import(variable)`)
- Framework patterns (React components, decorators)
- Re-exports for public API
- Entry points (CLI scripts, serverless handlers)

## Resources

See the reference documents for complete methodologies:

- `references/audit-methodology.md` - Full 6-phase audit process with detailed checklists
- `references/dead-code-methodology.md` - Dead code detection tools, verification, and cleanup workflows

Also read:

- `docs/security-standards.md` § Agent operational constraints
- `docs/openspec-tasks-mandatory-steps.md` § Data safety and testing compromise

## Quick Reference

### Before Starting

- [ ] Read project configuration files
- [ ] Load security / OpenSpec data-safety standards
- [ ] Identify tech stack and libraries
- [ ] Run existing linters as baseline
- [ ] Create file tracking list

### During Audit

- [ ] Mark files as in-progress
- [ ] Analyze each category systematically (including operational safety + delivery coupling)
- [ ] Note specific line numbers
- [ ] Document before/after examples
- [ ] Mark files as completed

### After Audit

- [ ] Categorize all findings by priority
- [ ] Generate comprehensive report (include operational safety summary)
- [ ] Save report to project root
- [ ] Provide brief console summary
