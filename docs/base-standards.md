---
description: This document contains all development rules and guidelines for this project, applicable to all AI agents (Claude, Cursor, Codex, Gemini, etc.).
alwaysApply: true
---

## 1. Core Principles

- **Small tasks, one at a time**: Always work in baby steps, one at a time. Never go forward more than one step.
- **Test-Driven Development**: Start with failing tests for any new functionality (TDD), according to the task details.
- **Type Safety**: All code must be fully typed.
- **Clear Naming**: Use clear, descriptive names for all variables and functions.
- **Incremental Changes**: Prefer incremental, focused changes over large, complex modifications.
- **Question Assumptions**: Always question assumptions and inferences.
- **Pattern Detection**: Detect and highlight repeated code patterns.
- **Test Coverage**: Maintain ≥ 90% line coverage across all layers unless project setup overrides this target.

## 2. Language Standards

- **English Only**: All technical artifacts must always use English, including:
  - Code (variables, functions, classes, comments, error messages, log messages)
  - Documentation (README, guides, API docs)
  - Jira tickets (titles, descriptions, comments)
  - Data schemas and database names
  - Configuration files and scripts
  - Git commit messages
  - Test names and descriptions
- **Exception — Product Requirements Document**: `docs/prd.md` is written in Spanish by product decision. All other documentation stays in English; user-facing product copy is Spanish.

## 2.1 Project Context

| Area                 | Value                                                                                                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product              | **Prendidos** — native party game for Android and iPhone. Players pick a category and play challenges with friends or a partner; challenges have difficulty levels and completing them earns points. It is a drinking game (alcohol references → 18+ audience). |
| Tech stack           | Expo / React Native mobile app only (see §2.3 and §2.4). No backend yet — content and game state live on-device.                                                                                                                                                |
| Architecture pattern | Feature-oriented Expo Router app: routes in `src/app/`, UI in `src/components/`, game/domain logic as pure TypeScript modules outside `src/app/` (see `docs/frontend-standards.md`).                                                                            |
| Branching strategy   | Trunk-based: short-lived branches off `main`, merged via pull request. No `develop` branch.                                                                                                                                                                     |
| Commit convention    | Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).                                                                                                                                                                                |

## 2.2 Naming Conventions

| Artifact                 | Convention                                                     | Example                                     |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------- |
| Files and folders        | kebab-case                                                     | `themed-text.tsx`, `challenge-card.tsx`     |
| Platform-specific files  | kebab-case + platform suffix                                   | `app-tabs.web.tsx`, `animated-icon.web.tsx` |
| Expo Router routes       | kebab-case files in `src/app/`; `[param]` for dynamic segments | `src/app/category/[category-id].tsx`        |
| React components         | PascalCase export                                              | `ChallengeCard`, `ThemedText`               |
| Hooks                    | `use-*.ts` file, `useCamelCase` export                         | `use-theme.ts` → `useTheme`                 |
| Classes / types          | PascalCase                                                     | `Challenge`, `GameSession`                  |
| Functions / variables    | camelCase                                                      | `pickNextChallenge`, `totalPoints`          |
| Constants (module-level) | camelCase or PascalCase objects                                | `Colors`, `Fonts`                           |

Harness enforces **kebab-case** for TypeScript source file names in CI (`templates/bitbucket-pipelines.yml`). Override these defaults if the team changes conventions, and update the pipeline lint step accordingly.

## 2.3 Platform: Expo / React Native

This is an **Expo / React Native** mobile application (Expo SDK 58, Expo Router, EAS). Prioritize mobile-first patterns, performance, and cross-platform compatibility.

- **Expo has changed — do not trust your training data.** Before writing code that touches an Expo, EAS, or React Native API, read the `expo` major version in `package.json` and fetch the matching docs (`https://docs.expo.dev/versions/v<major>.0.0/`) or https://docs.expo.dev/llms.txt. Never answer from memory.
- Install dependencies only with `npx expo install <package>`. Run `npx expo lint` and `npx tsc --noEmit` before declaring any task done.
- Never create or edit `ios/` or `android/` by hand (Continuous Native Generation) — configure native behavior in `app.json` and config plugins.
- Full platform rules (commands, routing, EAS, native code): [`docs/frontend-standards.md` § Expo Platform Rules](./frontend-standards.md#expo-platform-rules).

## 2.4 Canonical Technology Stack

**Single source of truth for stack decisions.** Agents, skills, OpenSpec config, C4 diagrams, CI templates, and layer standards MUST align with this section. Conflicting references (for example NestJS in one file and Express in another) cause silent agent failures.

Harness ships **default profiles per layer**. Each project may override them during setup in the corresponding `docs/*-standards.md` file. When a layer standard has `Customized: Yes`, that file wins over Harness defaults.

| Layer                    | Harness default                                                | Common alternatives                 | Override in                           |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------- | ------------------------------------- |
| Layer                    | Prendidos (customized)                                         | Harness default                     | Override in                           |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------- | ------------------------------------- |
| Mobile app               | **Expo SDK 58** + React Native 0.88 + Expo Router + `@expo/ui` | React + `@flux-ui/core`             | `docs/frontend-standards.md`          |
| Unit / component tests   | **Jest** (`jest-expo`) + React Native Testing Library (90%)    | Jest                                | `docs/frontend-standards.md`          |
| E2E testing              | **Maestro** (iOS Simulator / Android emulator)                 | Cypress                             | `docs/development_guide.md`, pipeline |
| Build and release        | **EAS** Build / Submit / Update                                | —                                   | `docs/development_guide.md`           |
| Backend API              | **None yet** (not applicable)                                  | NestJS + Prisma + PostgreSQL        | `docs/backend-standards.md`           |
| Serverless               | **None yet** (not applicable)                                  | AWS Lambda + CDK (TypeScript)       | `docs/serverless-standards.md`        |

**Agent rule:** Before generating code, tests, or architecture docs, read §2.4 and the relevant layer standard. Do not assume a backend, a web-only React stack, Flux UI, Cypress, or Playwright — this project is an Expo mobile app with no backend.

**Propagation checklist** (update together when the stack changes):

- `docs/base-standards.md` §2.4 (this section)
- `docs/backend-standards.md`, `docs/frontend-standards.md`, `docs/development_guide.md`
- `ai-specs/agents/backend-developer.md`, `ai-specs/agents/frontend-developer.md`
- `docs/architecture/c4-*.md` and `ai-specs/skills/c4-model/SKILL.md`
- `docs/openspec-tasks-mandatory-steps.md` (E2E tooling)
- `templates/openspec-config.example.yaml`, `templates/bitbucket-pipelines.yml`
- `openspec/config.yaml` in each project repo (after `openspec init`)

## 2.5 Version control platform

- **GitHub** is the current VCS hosting platform for Prendidos (`origin` → `github.com/JSebastianOspina/prendidos`). Use GitHub pull requests; the GitHub CLI (`gh`) is allowed.
- Harness Bitbucket artifacts (`.bitbucket/`, `bitbucket-pipelines.yml`, `templates/bitbucket-pipelines.yml`, and the `bitbucket-pr` skill) are kept **for a future migration to Bitbucket** and are not active today. Do not run `bitbucket-pr` against this repo.
- The `commit` skill applies for commit message format (Conventional Commits); push to the GitHub `origin`.
- The `gitflow-release` / `gitflow-hotfix` skills assume git flow with a `develop` branch and do **not** apply — this project is trunk-based (§2.1).

## 3. Specific standards

For detailed standards and guidelines specific to different areas of the project, refer to:

- [Product Requirements (PRD)](./prd.md) - Product goal, audience, game mechanics, content, monetization, compliance, and MVP scope (in Spanish). Read before writing user stories or OpenSpec proposals

- [Backend Standards](./backend-standards.md) - **Not applicable yet** (no backend) — Harness template kept for when one is added
- [Frontend Standards](./frontend-standards.md) - Expo / React Native platform rules, components, UI/UX guidelines, and frontend architecture
- [Serverless Standards](./serverless-standards.md) - **Not applicable yet** (no serverless layer) — Harness template kept for later
- [Development Guide](./development_guide.md) - Local setup, commands, testing, and EAS workflows
- [Data Model](./data-model.md) - On-device domain entities (categories, cards, players, game sessions, device state, products, entitlements)
- [Security Standards](./security-standards.md) - OWASP Top 10, secrets management, auth standards, and dependency hygiene
- [Documentation Standards](./documentation-standards.md) - Technical documentation structure, formatting, and maintenance guidelines, including AI standards like this document
- [OpenSpec Tasks Mandatory Steps](./openspec-tasks-mandatory-steps.md) - Required checklist and execution rules when creating or updating OpenSpec `tasks.md` files
- [Architecture (C4)](./architecture/) - Context, container, and component diagrams (Mermaid `flowchart`; see `/c4-model`)

## 4. Project Skills

- Skills live in `ai-specs/skills`.
- When a request matches a skill, load and follow the corresponding `SKILL.md` automatically before continuing.
- Also load any referenced files in the skill folder (for example, `references/*.md`) when the skill requires them.

## 5. OpenSpec Workflow (1.16)

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) **1.16** (Harness was written for 1.5.0) with the default **`core` profile**, configured for Claude Code. Use these slash commands in the AI chat (Harness aliases in parentheses):

| Step               | OpenSpec command | Harness alias |
| ------------------ | ---------------- | ------------- |
| Explore (optional) | `/opsx:explore`  | —             |
| Propose            | `/opsx:propose`  | `/propose`    |
| Apply              | `/opsx:apply`    | `/apply`      |
| Sync (optional)    | `/opsx:sync`     | —             |
| Archive            | `/opsx:archive`  | `/archive`    |

Expanded-profile commands (`/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:verify`, `/opsx:bulk-archive`, `/opsx:onboard`) are optional and require `openspec config profile` plus `openspec update` in the project. Do not use them as the default Harness workflow.

Recommended Harness flow: `write-us` → `enrich-us` → `/propose` → `/apply` → `adversarial-review` → `/archive` → `commit`.

### Where to customize OpenSpec (do not edit generated agent files)

OpenSpec may install or refresh skills/commands under `.cursor/` and `.claude/` (`openspec update`). **Do not put project-specific rules there** — they will be lost on upgrade.

| Put durable changes in                                                                                      | Purpose                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `openspec/config.yaml`                                                                                      | `context`, `rules.<artifact>` (`proposal`, `specs`, `design`, `tasks`) and `operations.<apply             | archive>.guidance` — injected by OpenSpec into prompts |
| `docs/` (esp. `openspec-tasks-mandatory-steps.md`, `security-standards.md` § Agent operational constraints) | Always-apply standards referenced by config                                                               |
| `ai-specs/agents/`, `ai-specs/hooks/`, `ai-specs/skills/`                                                   | Harness-owned agents, hooks, and skills (symlink with `scripts/sync-skills.sh` / `scripts/sync-hooks.sh`) |
| `templates/`, `scripts/`                                                                                    | Scaffolding and sync tooling                                                                              |

Harness-owned skills under `ai-specs/skills/` are the only skills you should edit when you want them visible in `.cursor/skills/` and `.claude/skills/` via relative symlinks. Leave OpenSpec-generated apply/propose/archive skill bodies untouched.

## 6. Planning Model Requirement

Planning workflows must run with Opus high reasoning.

This requirement applies to:

- `enrich-us`
- `/opsx:propose` (Harness alias: `/propose`)
- `/opsx:explore` (when used before proposing)

Before starting any of these workflows, verify the session is using Opus high reasoning. If it is not, **self-correct** by adding `"model": "claude-opus-5-5"` to `.claude/settings.json` (use the `update-config` skill or edit directly), then continue — do not stop and ask the user. Do the same to come back to sonnet medium for any other step.

## 7. Symlink Integrity and Multi-Agent Portability

- **Canonical Source**: Keep reusable artifacts in `ai-specs` as the canonical source. Agent-specific paths (such as `.claude` and `.cursor`) should reference them through symlinks when possible.
- **Agent Hooks**: Deterministic hooks live in `ai-specs/hooks/`. Run `bash scripts/sync-hooks.sh` to expose them to Cursor (`.cursor/hooks.json`) and Claude Code (`.claude/settings.json` hooks block).
- **Harness Evals**: Golden-task regression tests live in `ai-specs/evals/`. Run `bash scripts/run-evals.sh` after changes to skills, standards, hooks, agents, or model config.
- **Human dev guardrails**: Pre-commit and devcontainer templates live in `templates/`. Run `bash scripts/setup-dev-tooling.sh` so rules apply outside the agent too.
- **Update Safety**: Whenever a file is renamed, moved, or its suffix changes, verify and update all symlinks that target it before considering the change complete.
- **New Artifact Linking**: Whenever creating a new artifact that requires multi-agent exposure (for example new agents or skills in `ai-specs`), create the corresponding symlinks from the expected agent-specific reference paths.
- **External Customization Review**: Whenever customization is introduced outside `ai-specs`, evaluate whether it should be moved into `ai-specs` and replaced with symlinks from the original locations.
- **Completion Gate**: A change is incomplete if it leaves broken symlinks, stale targets, or duplicated canonical artifacts across agent-specific folders.

## 8. Mandatory OpenSpec Artifact Updates for Post-Apply Changes

When a new fix/change request appears after `/opsx:apply` (or `/apply`) and before `/opsx:archive` (or `/archive`), agents must treat it as a spec update first, not as an informal "fix this quickly". It's the core principle of OpenSpec: documentation is the source of truth.

Required order:

1. Update the current OpenSpec change artifacts that are affected (for example: scenarios, requirements/specs, and `tasks.md`). Don't add tasks as "bugfixes" but as part of the initial design, thus in the proper section
2. If artifact regeneration is needed, run the corresponding OpenSpec step before coding: `/opsx:propose` in the `core` profile, or `/opsx:continue` / `/opsx:ff` only when the expanded profile is enabled
3. Implement code only after artifacts reflect the new request
4. Re-run verification against the updated artifacts before archiving (`adversarial-review` skill in Harness; `/opsx:verify` only when the expanded profile is enabled)

Do not apply direct code-only fixes in this window without updating OpenSpec artifacts.
