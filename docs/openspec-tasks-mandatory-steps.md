---
description: Enforce mandatory steps from openspec/config.yaml when creating tasks.md artifacts and ensure agent executes all manual tests
alwaysApply: true
---

# OpenSpec Tasks: Mandatory Steps Enforcement

When creating or updating `tasks.md` artifacts in OpenSpec changes, you MUST:

> **Customization note:** Keep durable OpenSpec rules in `openspec/config.yaml` (OpenSpec 1.16: `context`, `rules.<artifactId>` for `proposal` / `specs` / `design` / `tasks`, and `operations.apply.guidance` / `operations.archive.guidance` — there is no `rules.apply` or `rules._global`) and in this file / `docs/security-standards.md` (§ Agent operational constraints). Do **not** edit OpenSpec-generated skills or commands under `.cursor/` or `.claude/` — they are overwritten by `openspec update`. Harness skills belong in `ai-specs/skills/` and are linked with `scripts/sync-skills.sh`.

> **Project context (Prendidos):** native party/drinking game app for Android and iPhone — Expo SDK 58, React Native 0.88, React 19.3, TypeScript strict, Expo Router (`src/app/`), EAS, npm. **No backend today**: content and game state live on-device, so there are no servers to start. Unit/component tests: Jest via `jest-expo` + `@testing-library/react-native` (`npx jest`). E2E: **Maestro** flows in `.maestro/` (`maestro test .maestro/`) on iOS Simulator / Android emulator. Mandatory verification before any task is done: `npx expo lint` and `npx tsc --noEmit`. Backend/persistence steps below apply **only if a backend layer is added later**.

## 1. Read openspec/config.yaml First

**BEFORE** creating or updating any `tasks.md` file, you MUST read `openspec/config.yaml` to understand:

- Project context and the mandatory steps defined in `rules.tasks` and `operations.apply.guidance`
- Branch naming conventions (trunk-based: short-lived branches off `main`)
- Task structure requirements
- Testing and documentation requirements

## 2. Data safety and testing compromise (always apply)

These rules bind both `/propose` (what goes into `tasks.md`) and `/apply` (how the agent executes). They align with `docs/security-standards.md` § Agent operational constraints (Harness invariant). Prendidos has no database today; the DB rules below stay in force and become directly applicable **if a backend/persistence layer is added later**. The same spirit applies to on-device data (e.g. AsyncStorage / SQLite / SecureStore): never wipe or rewrite it with ad-hoc scripts — use the app's own flows or official test-runner isolation.

1. **No direct database access by the agent**
   - Never run SQL clients, ORM REPLs, raw DB CLIs, ad-hoc scripts that query/mutate tables, or shell one-liners against the DB.
   - The agent must **never execute** (hooks will deny): `migrate:fresh`, `migrate:refresh`, `db:wipe`, `db:seed`, `prisma migrate reset`, `prisma db seed`, `TRUNCATE`, `DROP`, or project-equivalent wipe/seed/reset commands.
   - If a backend/persistence layer is added later, schema changes MUST be expressed only as **versioned migrations** of the chosen ORM (e.g. Prisma) — never pasted/executed SQL outside migrations. Prefer **backwards-compatible** (expand/contract) changes; run `migration-review` when migration files change.

2. **Human-in-the-loop for blocked-but-necessary commands**
   - Blocking an agent command does **not** mean skipping a needed step. If a change legitimately requires a dangerous/privileged command (example, if a backend is added later: a seed file was just edited and local verification needs `npx prisma db seed` or `npm run db:seed`), the agent MUST:
     1. Explain **why** the command is required and the **consequences** (data rewritten, wiped, reseeds, etc.).
     2. Give the human the **exact command** to paste in their own terminal (cwd + full command).
     3. **Wait** for the human to run it and confirm the outcome (success/failure, relevant output).
     4. Continue the workflow using that confirmation — do not invent side-step workarounds that mute the hook.
   - Prefer human-executed privileged ops; the agent monitors, instructs, and resumes after confirmation. This is active HITL, not abandonment of the task.
   - Still forbid inventing alternate SQL or undocumented scripts to achieve the same wipe/seed/reset.

3. **Observe and mutate only through the app, HTTP endpoints, or official test runners**
   - Today (no backend): verify behavior through the running app (Maestro flows) and test assertions — not by reading or editing device storage directly.
   - If a backend is added later: manual verification of persistence uses **GET/POST/PUT/PATCH/DELETE** (or documented layer e2e scripts), not DB queries.
   - Automated unit/component tests via the project's test runner (Jest via `jest-expo`) are allowed: they may use mocks or the project's isolated test harness without the agent opening a DB session.

4. **Soft delete preferred; HITL always for destructive/mutating paths**
   - If the product path is soft delete, the agent MAY exercise that DELETE (or equivalent) endpoint **after human confirmation** (see below). Cleanup uses the **same API** — never SQL.
   - **If the project has no soft delete**, HITL still applies: the agent explains why the mutating/destructive action is needed, how the human should approve or run it, waits for confirmation, then continues. Prefer unit tests over exercising hard delete against shared data when possible.
   - Do **not** hard-delete or recreate rows via SQL “to clean up”.

5. **Human confirmation before mutating endpoints (session grant)**
   - Applies only if a backend layer is added (none today). Before the **first** mutating call in a session (POST/PUT/PATCH/DELETE, soft-delete included) against a running API, the agent MUST:
     - Present the **test plan**: methods, URLs, whether deletes are soft or hard, intended cleanup, and consequences.
     - Wait for **explicit human approval**.
   - One approval may cover the whole planned mutating set for that Step N+2/N+3 run (do not ask per curl when the plan was approved).
   - Pure **GET** / read-only checks do not require this grant.
   - Unit tests, lint, typecheck, and other non-API suite commands do not require per-call confirmation.
   - Project e2e (Maestro — see Step N+3): flows run against a local simulator/emulator with on-device data, so they are isolated by default; state that in the report and proceed after stating the command. If flows ever hit a shared or non-ephemeral backend, obtain the same style of session grant once before running.

6. **Auth / authorization / security impact flag**
   - Any change that touches authentication, authorization, guards, roles, permissions, delete filters, secrets handling, age gating, or public/private route exposure MUST include an explicit comment in code and a `tasks.md` checkbox: `SECURITY REVIEW NEEDED — auth/authz/security impact` so a human or `/security-scan` can review before merge.

7. **Documentation**
   - Architecture / data-flow / process changes → update relevant `docs/*.md` (and API docs if a backend is added).
   - Install, commands, or documented product capabilities → update the repo **README.md** (and `docs/development_guide.md` when local setup changes).

## 3. Mandatory Steps

All implementation tasks MUST include these steps in the correct order:

### Step 0: Create Feature Branch (MUST BE FIRST)

- **Location**: Must be the very first step (Step 0)
- **Branch naming**: `feature/[ticket-id]` or `feature/[change-name]`, cut from `main` (trunk-based, short-lived; no `develop`)
- **Action**: Create and switch to feature branch before any code changes
- **Commits**: Conventional Commits

### Mandatory Steps (Must Be Included):

- **Step N**: Review and Update Existing Unit Tests (MANDATORY) — create missing automated tests (Jest + React Native Testing Library) for application code changes
- **Step N+1**: Run Unit Tests, Lint, and Typecheck (MANDATORY) — `npx jest`, `npx expo lint`, `npx tsc --noEmit`; **no direct DB access**
- **Step N+2**: Manual Endpoint Testing with curl (MANDATORY only if a backend layer is added — none today; mark N/A in `tasks.md`) — **AGENT MUST EXECUTE** after human mutating-plan grant
- **Step N+3**: E2E Testing with Maestro (MANDATORY if applicable) — **AGENT MUST EXECUTE**. Maestro is the project E2E tool per `docs/development_guide.md`
- **Step N+4**: Update Technical Documentation (MANDATORY) — including README when install/commands/features change
- **Step N+5**: Security / schema gate (MANDATORY when applicable) — `SECURITY REVIEW NEEDED` comments + `/security-scan` when security surface changed; `migration-review` only if a backend schema exists

## 4. Manual Testing Requirements - CRITICAL: Agent Must Execute

**IMPORTANT**: The coding agent (AI) MUST perform all manual testing steps itself (after any required human grant). **Do not** ask the user to run Jest/lint/typecheck/Maestro (or curl, if a backend exists) in the agent's place — the user **approves** mutating API plans and **manually runs only privileged/destructive commands blocked for the agent** (seed/wipe/reset/etc.) when those are necessary. Ordinary tests must still be executed by the agent to mark tasks as completed in `tasks.md`.

### Step N+1: Run Unit Tests, Lint, and Typecheck (MANDATORY)

**Agent Responsibility**: Execute the project's unit/component suites plus lint and typecheck, report results, and produce a report artifact. Do **not** open any database or device storage to “verify state”.

**Implementation Steps** (Agent must perform):

1. **Prepare Test Environment**:
   - Ensure test dependencies (`jest-expo`, `@testing-library/react-native`) are installed per `docs/development_guide.md`
   - Document the exact test command(s) that will be executed
   - Do not capture SQL baselines or run DB clients

2. **Run Targeted Unit Tests First**:
   - Execute focused tests for the modified module(s) and related behavior (e.g. `npx jest path/to/changed`)
   - Confirm failures are resolved and no new regressions appear in targeted scope
   - Capture command output summary (passed/failed/skipped)

3. **Run Broader Unit Test Suite**:
   - Execute the suite required by `openspec/config.yaml` (default: `npx jest`, or justified subset if configured)
   - Record total test counts, failures, runtime, and any flaky behavior observed

4. **Run Lint and Typecheck (always mandatory)**:
   - `npx expo lint` — must pass with no errors
   - `npx tsc --noEmit` — must pass with no errors
   - A task is never done while either fails

5. **Assert via tests only**:
   - Rely on test assertions, mocks, and project test harnesses
   - If a suite unexpectedly needs shared live data mutation (only possible if a backend is added):
     1. Stop and obtain a human grant (same style as Step N+2)
     2. Use **only** the official runner’s isolation / teardown mechanisms documented for the project — never open a DB session
     3. Document in the report: grant scope, isolation/teardown mechanism used, and cleanup outcome

6. **Create Unit Test Verification Report in Spec Folder**:
   - Save report under the current change folder in `specs/<change-name>/reports/`
   - Use this filename pattern: `YYYY-MM-DD-step-N+1-unit-test-verification.md`
   - Include executed commands and summarized results (no DB dump / SQL metric sections)

7. **Mark Task as Completed**: Only after unit tests, lint, and typecheck pass (or approved exceptions are documented) and the report file is created, mark Step N+1 as completed in `tasks.md`.

**Report Template** (store in `specs/<change-name>/reports/`):

```markdown
# Step N+1 Report - Unit Tests, Lint, Typecheck

- Date: YYYY-MM-DD
- Change: <change-name>
- Agent: <agent-name>

## Commands Executed

- `npx jest <targeted paths>`
- `npx jest`
- `npx expo lint`
- `npx tsc --noEmit`

## Unit Test Results

- Targeted tests: X passed, Y failed, Z skipped
- Full/required suite: X passed, Y failed, Z skipped
- Runtime: <duration>
- Notes: <flaky tests, retries, exceptions>

## Lint and Typecheck

- `npx expo lint`: PASS/FAIL (<errors/warnings>)
- `npx tsc --noEmit`: PASS/FAIL (<errors>)

## Data safety

- Direct DB / device-storage access used: No
- Human mutating grant required: No / Yes (reason)
- Isolation / teardown (if grant used): <mechanism>
- Cleanup outcome: <none / restored via runner teardown / …>

## Outcome

- Step N+1 status: PASS/FAIL
- Blocking issues: <none or list>
```

**Dependencies**:

- Test runner and project test dependencies installed
- Permission to create report files in `specs/<change-name>/reports/`

**Notes**:

- **The agent MUST execute tests, lint, and typecheck itself** - never ask the user to run them
- This step is mandatory even when code changes look small
- Report naming must follow the required pattern for traceability
- **Task completion in tasks.md can only be marked after report creation**

### Step N+2: Manual Endpoint Testing with curl (only if a backend layer is added — none today)

> **Prendidos today:** there is no backend or HTTP API, so this step is **N/A**. In `tasks.md`, include a single line `N+2 — Manual endpoint testing: N/A (no backend)` instead of the full checklist. The rules below become MANDATORY for every new endpoint as soon as a backend layer is added.

**Agent Responsibility**: The coding agent MUST execute curl commands and verify responses **via the HTTP API only**. This is NOT optional and cannot be delegated to the user (aside from the mutating-plan approval).

**Implementation Steps** (Agent must perform):

1. **Prepare Test Environment**:
   - Ensure the backend server is running (start if needed)
   - Optional read-only **GET** probe to confirm the API is healthy
   - Identify which calls will mutate state (POST/PUT/PATCH/DELETE, including soft-delete)

2. **Obtain human grant for mutating calls** (if any):
   - Present the plan and consequences (soft vs hard delete); wait for explicit approval
   - Record the approval in the report (`who` / `when` / `scope`)

3. **Test GET Endpoints** (if any) — no grant required:
   - Execute `curl -X GET [endpoint-url] [headers]`
   - Verify response **status code** against the API contract (e.g. 200, 404)
   - Verify response **body structure and content** match the expected resource shape
   - Document the curl command and response

4. **Test POST Endpoints** (CREATE) — requires grant:
   - Execute `curl -X POST …` with request body
   - Verify status (e.g. 201, 400, 422) and that the body contains the created resource (or contract-compliant error)
   - **Cleanup via API**: soft-delete or documented delete of the created resource — never SQL

5. **Test PUT/PATCH Endpoints** (UPDATE) — requires grant:
   - Capture prior representation via GET when possible
   - Execute update; verify status and body contain the updated resource
   - **Cleanup via API**: PATCH/PUT back to prior values when safe; do not use SQL

6. **Test DELETE Endpoints** — requires grant:
   - Prefer **soft delete** when the project supports it; verify via GET filters / absence from normal lists per API contract
   - If only hard delete exists: state consequences clearly in the grant request; prefer unit tests over hard delete on shared data when possible
   - Cleanup: never recreate rows via SQL

7. **Test Error Cases**:
   - Invalid data (validation errors), non-existent resources (404), unauthorized access (if applicable)
   - Verify **error response format** matches the API specification
   - Prefer non-mutating error cases when possible

8. **Create Endpoint Verification Report**:
   - Save under `specs/<change-name>/reports/` as `YYYY-MM-DD-step-N+2-endpoint-verification.md`
   - Include grant scope, all curls, status/body notes, cleanup actions

9. **Mark Task as Completed**: Only after curl tests pass, cleanup via API is done, and the report exists

**Dependencies** (backend only):

- Backend server running (agent must start if needed)
- curl command-line tool
- Explicit human grant when mutations are planned

**Notes**:

- Once a backend exists, this step is MANDATORY for all new endpoints
- **Never** verify “database state” with SQL — use GET endpoints
- Do not skip manual testing even if unit tests pass
- **Task completion in tasks.md can only be marked after successful execution of required curl tests and report creation**

### Step N+3: E2E Testing with Maestro (MANDATORY if applicable)

**Agent Responsibility**: The coding agent MUST execute all E2E tests using **Maestro**, the project E2E tool per `docs/development_guide.md` (see also `docs/base-standards.md` §2.4). This is NOT optional and cannot be delegated to the user (aside from a shared-data grant when required).

**When This Applies** (include this step in `tasks.md` when any apply):

- Changes that affect user-facing functionality, screens, routes, or UI components
- Changes to game flows, user workflows, or interactions (gestures, navigation, haptics-driven flows)
- Changes to on-device persistence that the user can observe (saved players, settings, progress)
- Integration between the app and a backend, if one is added later

**Implementation Steps** (Agent must perform):

1. **Prepare Test Environment**:
   - Start the app on an iOS Simulator or Android emulator: Metro via `npx expo start` (Expo Go or an installed development build), or a development build via `npx expo run:ios` / `npx expo run:android`
   - Confirm Maestro is installed (`maestro --version`) and flows exist under `.maestro/` per `docs/development_guide.md`
   - Prepare any env values without committing secrets

2. **Shared-data grant (when needed)**:
   - Default: flows run against a local simulator/emulator with on-device data — document that isolation and proceed after stating the command
   - If e2e ever mutates shared/non-ephemeral data (e.g. a backend added later): obtain a **one-time human grant** listing consequences

3. **Run Maestro Flows**:
   - Execute existing flows: `maestro test .maestro/` (or a single flow: `maestro test .maestro/<flow>.yaml`); use `maestro studio` for interactive debugging
   - **Add or update Maestro flows** in `.maestro/` for new/changed user workflows when coverage is missing — this is mandatory when the change introduces uncovered flows
   - Capture command output: passed / failed / skipped

4. **Execute User Workflows**:
   - Cover the complete user workflow from start to finish in Maestro flows
   - Use `launchApp`, `tapOn`, `inputText`, `scrollUntilVisible`, and assertions (`assertVisible`, `assertNotVisible`); prefer `testID`-based selectors (`id:`) over visible text
   - Verify expected outcomes at each step

5. **Test Error Scenarios**:
   - Form/input validation errors
   - Error messages display correctly
   - Error recovery flows where applicable

6. **Verify Persistence via UI (never SQL or direct storage reads)**:
   - After creating/updating data through the UI, verify it appears correctly in the relevant screens (including after relaunching the app when persistence is in scope)
   - If a backend is added later, optionally confirm via GET endpoints if that matches the product contract
   - Do **not** open a database or read device storage directly to verify persistence

7. **Restore Test Environment**:
   - Reset app state via the app's own flows, Maestro's `clearState` / `launchApp: clearState: true`, or official project scripts — never ad-hoc SQL or storage hacks
   - Ensure no stuck simulator/emulator sessions or leftover state that would block CI or the next run
   - Confirm environment is restored before marking the step complete

8. **Create E2E Verification Report** (mandatory whenever this step applies):
   - Save under `specs/<change-name>/reports/` as `YYYY-MM-DD-step-N+3-e2e-verification.md`
   - Include: commands, device/platform used, grant or isolation declaration, scenarios, passed/failed/skipped, persistence checks (UI), cleanup/restore outcome

9. **Mark Task as Completed**: Only after all E2E tests pass, environment is restored, and the report exists

**Report Template** (store in `specs/<change-name>/reports/`):

```markdown
# Step N+3 Report - E2E (Maestro)

- Date: YYYY-MM-DD
- Change: <change-name>
- Agent: <agent-name>
- Device(s): <iOS Simulator model + OS / Android emulator API level>
- App runtime: <Expo Go via npx expo start / development build>

## Commands Executed

- `<maestro test .maestro/ …>`

## Grant / Isolation

- Shared-data grant: No / Yes (<scope>)
- Isolation documented: <local simulator/emulator with on-device data, or quote from development_guide>

## Results

- Passed: X / Failed: Y / Skipped: Z
- Flows added or updated: <list or none>

## Persistence verified (UI — no SQL / direct storage reads)

- <checks>

## Environment restored

- Cleanup actions: <clearState / in-app reset / scripts>
- Leftover sessions/state cleared: Yes/No

## Outcome

- Step N+3 status: PASS/FAIL
- Blocking issues: <none or list>
```

**Dependencies**:

- App running on an iOS Simulator or Android emulator (agent must start it if needed)
- Backend server running — only if a backend layer is added (none today)
- Maestro installed and flows in `.maestro/` per `docs/development_guide.md`
- Permission to create report files in `specs/<change-name>/reports/`

**Notes**:

- **The agent MUST execute all E2E tests itself** — never ask the user to run tests
- Prefer existing Maestro flows; add new ones when the change introduces uncovered flows
- Always restore the environment after tests that modify data (in-app flows / `clearState` / scripts only)
- **Task completion in tasks.md can only be marked after successful E2E execution, restore, and report creation**

### Step N+4: Update Technical Documentation (MANDATORY)

Follow `docs/documentation-standards.md`. At minimum:

- Data model / architecture / process changes (and API changes, if a backend is added) → update the matching `docs/*.md`
- Install, commands, or documented capabilities → update the product **README.md**
- When documenting delete behaviors, state soft-delete fields explicitly if the project uses soft delete

### Step N+5: Security / schema gate (MANDATORY when applicable)

Include this section in `tasks.md` whenever the change touches security or schema:

- [ ] Add explicit `SECURITY REVIEW NEEDED — …` comments on auth/authz/security-sensitive code
- [ ] Run `/security-scan` (or schedule it before merge) when security surface changed
- [ ] If a backend is added and ORM schema/migrations changed: ensure versioned migration only, backwards-compatible design, and run `migration-review`
- [ ] Confirm no secrets in source, `app.json` / `app.config.*`, EAS config, or logs

## 5. Verification Checklist

Before finalizing any `tasks.md` file, verify:

- [ ] Step 0 (Create Feature Branch) is the FIRST step
- [ ] All mandatory steps from config.yaml are included
- [ ] Steps are numbered sequentially
- [ ] Mandatory steps are clearly marked with "(MANDATORY)" label
- [ ] Branch naming follows the convention: `feature/[ticket-id]` or `feature/[change-name]` off `main` (or project convention from config)
- [ ] Step N+1 includes `npx jest`, `npx expo lint`, `npx tsc --noEmit`, and report path (`…-unit-test-verification.md`) — no direct DB/storage verification tasks; shared-mutation cases document grant + runner teardown/cleanup
- [ ] Step N+2 is marked N/A while there is no backend; if a backend exists, it includes human mutating-plan grant, HTTP status/body/error checks, API-only cleanup, and report `…-endpoint-verification.md`
- [ ] Manual testing steps explicitly state "AGENT MUST EXECUTE"
- [ ] No tasks instruct the agent to **execute** SQL, truncate, wipe, seed, or migrate reset — if those are needed, tasks say the agent must hand the **exact command** to the human (HITL) and wait
- [ ] E2E step is included when changes affect UI, screens, game flows, or app–backend integration
- [ ] E2E step uses Maestro (per `docs/development_guide.md`); includes app start on simulator/emulator, `.maestro/` flows, `maestro test`, workflows, errors, UI persistence, restore, and report `…-e2e-verification.md`
- [ ] Documentation step covers `docs/*.md` and README when needed
- [ ] Security / schema gate present when auth, security surface, or schema changes

## 6. When This Applies

This rule applies when:

- Creating `tasks.md` via `/opsx:propose` (OpenSpec 1.16 `core` profile; Harness alias: `/propose`)
- Creating `tasks.md` via `/opsx:ff` or `/opsx:continue` only when the expanded profile is enabled
- Updating existing `tasks.md` files
- Any task creation that involves app code changes (or backend changes, if a backend is added)
- Implementing tasks from `tasks.md` via `/opsx:apply` (Harness alias: `/apply`) — the agent must execute manual tests

## 7. Example Structure

```markdown
## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [ ] 0.1 Create feature branch `feature/player-setup-screen` from `main`
- [ ] 0.2 Verify branch creation and current branch status

## 1. App: Game Logic Tests (TDD)

...

## 8. App: Review and Update Existing Unit Tests (MANDATORY)

- [ ] 8.1 Review existing tests; create missing Jest / React Native Testing Library tests for new/changed code

## 9. App: Run Unit Tests, Lint, and Typecheck (MANDATORY)

- [ ] 9.1 Run targeted unit tests for changed modules (`npx jest <paths>`; no direct DB/storage access)
- [ ] 9.2 Run required broader unit test suite from config (`npx jest`)
- [ ] 9.3 Run `npx expo lint` and `npx tsc --noEmit`; both must pass
- [ ] 9.4 If suite needs shared live mutation: obtain HITL grant; use official runner teardown only; document cleanup
- [ ] 9.5 Create report `specs/<change-name>/reports/YYYY-MM-DD-step-N+1-unit-test-verification.md`
- [ ] 9.6 Mark step complete only after tests, lint, and typecheck pass and report exists

## 10. Manual Endpoint Testing with curl — N/A (no backend today)

- [ ] 10.1 Confirm the change adds no backend/API surface; record N/A
<!-- If a backend layer is added: ensure server running; obtain mutating-plan grant;
     test GET/POST/PUT/PATCH/DELETE (soft-delete preferred, API-only cleanup, no SQL);
     test error cases; create report YYYY-MM-DD-step-N+2-endpoint-verification.md -->

## 11. App: E2E Testing with Maestro (MANDATORY if applicable - AGENT MUST EXECUTE)

- [ ] 11.1 Start the app on iOS Simulator / Android emulator (`npx expo start` or `npx expo run:ios|android`); confirm Maestro installed and `.maestro/` flows present
- [ ] 11.2 Document isolation (local device data); obtain human grant only if e2e mutates shared data
- [ ] 11.3 Run `maestro test .maestro/`; capture passed/failed/skipped
- [ ] 11.4 Add or update Maestro flows in `.maestro/` when new/changed flows lack coverage
- [ ] 11.5 Cover full user workflows, error/validation/recovery scenarios
- [ ] 11.6 Verify persistence via UI (relaunch when in scope; never SQL or direct storage reads)
- [ ] 11.7 Restore environment via `clearState` / in-app reset / official scripts
- [ ] 11.8 Create report `YYYY-MM-DD-step-N+3-e2e-verification.md`

## 16. Update Technical Documentation (MANDATORY)

- [ ] 16.1 Update docs/\*.md affected by architecture/data-flow
- [ ] 16.2 Update README.md if install/commands/features changed

## 17. Security / schema gate (MANDATORY when applicable)

- [ ] 17.1 SECURITY REVIEW NEEDED comments on auth/authz/security impact
- [ ] 17.2 /security-scan if security surface changed; migration-review only if a backend schema changed
```

## 8. Agent Execution Requirements

**CRITICAL**: When implementing tasks from `tasks.md` (via `/opsx:apply` or Harness alias `/apply`), the coding agent MUST:

1. **Execute All Manual Tests**: Never ask the user to run Jest, lint, typecheck, E2E tests (or curl commands, if a backend exists). The agent must:
   - Run `npx jest`, `npx expo lint`, and `npx tsc --noEmit` before declaring any task done
   - Start the app on a simulator/emulator if needed (`npx expo start`, or a development build via `npx expo run:ios|android`)
   - If a backend layer is added later: start its server, ask for **mutating-plan approval** when needed, then execute curls itself
   - Execute applicable e2e with Maestro (`maestro test .maestro/`) per `docs/development_guide.md`
   - Verify outcomes via the app UI and test runner output (and HTTP, if a backend exists) only — never SQL or direct storage reads
   - Clean up via in-app flows, Maestro `clearState`, API, or official scripts (soft-delete preferred); restore environment and clear leftover simulator/emulator state

2. **Mark Tasks as Completed**: Tasks can ONLY be marked as completed (`[x]`) in `tasks.md` AFTER:
   - Required grants obtained
   - Required tests, lint, and typecheck executed and verified
   - Cleanup completed for agent-created fixtures/state
   - Environment restored for E2E when applicable
   - Outcomes documented in the required report files under `specs/<change-name>/reports/`

3. **Never**:
   - Execute direct DB queries or destructive migrate/wipe/seed/truncate/drop commands from the agent shell (hooks deny them)
   - Skip a legitimately required privileged step — hand the **exact command** to the human, wait, then continue (HITL)
   - Bypass the hook with alternate SQL or undocumented scripts
   - Ask the user to run Jest/lint/typecheck/Maestro (or curl) in the agent's place (approval and privileged HITL ≠ ordinary test execution)
   - Mark tasks complete without executing required agent-side tests
   - Skip manual testing steps

4. **Document Test Execution**:
   - Commands for Jest, lint, typecheck, and Maestro, with results
   - Curl commands, responses, human grant scope (if a backend exists)
   - Soft-delete vs hard-delete determination (if applicable)
   - E2E scenarios, device/platform, passed/failed/skipped, persistence checks (UI), cleanup/restore
   - Issues and resolutions

## Failure to Follow

If you create tasks without following these mandatory steps, the user will need to manually fix the tasks.md file. Always read `openspec/config.yaml` first and ensure all mandatory steps are included.

**If you implement tasks without executing manual tests yourself, you are violating this rule. The agent must execute all tests to mark tasks as completed.**
