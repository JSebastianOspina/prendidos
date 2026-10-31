---
name: bitbucket-pr
description: Create a Bitbucket pull request automatically — fills the PR template, sets reviewers only from .bitbucket/CODEOWNERS + teams.yaml , links the Jira ticket, and targets the correct branch per gitflow conventions.
author: UBITS
version: 1.5.1
---

# bitbucket-pr Skill

Use when the user explicitly asks to open a Bitbucket pull request (after commits are ready and local checks have passed).

## Instructions

Create a Bitbucket PR for: $ARGUMENTS (ticket ID or description; defaults to current branch context).

### Step 0 — Preconditions (do not skip)

**Branch must exist on `origin` before create.** The Bitbucket create API only accepts source branches that are already pushed.

1. Check tracking / ahead-behind:

```bash
git status -sb
git rev-list --left-right --count "origin/$(git branch --show-current)...HEAD" 2>/dev/null || true
```

2. If the branch is missing on remote or local is ahead, try:

```bash
git push -u origin HEAD
```

3. **Agent sandbox reality (proven failure modes):**
   - SSH to `bitbucket.org` often fails with DNS errors (`Could not resolve hostname`, `-65563`) inside the agent sandbox. Retrying the same `git push`/`git fetch` with elevated permissions does **not** reliably fix SSH DNS resolution — do not spin forever retrying it; ask the human instead (see 4).
   - This SSH/DNS limitation is specific to **git operations**. It does **not** apply to the `curl` REST API calls used later in this skill — those calls target `api.bitbucket.org` over HTTPS and reliably succeed once `required_permissions` is requested upfront (see Step 6 § Network / sandbox rules — this is the proven, required pattern, not a fallback to try only after a failure).
   - Embedding `BITBUCKET_USER` (email with `@`) in an HTTPS remote URL breaks parsing; never put credentials in the git URL.
   - Atlassian API tokens that work for the **PR REST API** may still fail for **git HTTPS** auth.

4. If push fails from the agent: ask the human to run `git push -u origin HEAD` in their own terminal, wait for confirmation (or re-check `0	0` ahead/behind), then continue. Do **not** invent a PR against an unpushed branch.

5. Auth env (never print secrets):

```bash
# Expect BITBUCKET_USER (Atlassian account email) + BITBUCKET_TOKEN (API token)
# Useful scopes for this skill: read:repository, read:pullrequest, write:pullrequest, read:workspace
# Do NOT call GET /2.0/user — many tokens lack read:user and it is not required to create PRs.
```

6. Prefer host **`https://api.bitbucket.org/2.0/...`**. Do not rely on `https://bitbucket.org/!api/2.0/...` (observed `401` even when `api.bitbucket.org` works).

7. If an open PR already exists for this source branch, report its URL and stop (do not create a duplicate):

```bash
curl -sS -u "${BITBUCKET_USER}:${BITBUCKET_TOKEN}" \
  --get "https://api.bitbucket.org/2.0/repositories/<workspace>/<repo>/pullrequests" \
  --data-urlencode 'q=source.branch.name="<source-branch>" AND state="OPEN"' \
  --data-urlencode 'pagelen=5' \
  -o /tmp/pr-open-check.json -w "\nhttp=%{http_code}\n"
```

Every `curl` call in this skill — including this one — must follow Step 6 § Network / sandbox rules from the start: **its own shell invocation** (no `&&`, `;`, or pipes with any other command, not even `git status` or `echo`) **and** `required_permissions: ["full_network"]` requested on that same call. Do not run it once without permissions "to see if it works first" — it is already known to fail with `CONNECT tunnel failed` / `http=000` in that mode, so requesting permissions upfront avoids a guaranteed failed attempt. Parse JSON (`jq`) in a **separate** follow-up command with no network involved.

### Step 1 — Inspect Current State

Run:

```bash
git status
git branch --show-current
git remote show origin | sed -n 's/.*HEAD branch: //p'
```

Resolve the **destination base** (see Step 2), then:

```bash
git fetch origin "<destination>"
git log --oneline "origin/<destination>..HEAD"
git diff --stat "origin/<destination>..HEAD"
```

If `git fetch` fails for the same sandbox/DNS reasons as push, use the last known local `origin/<destination>` and warn that the base may be stale — or ask the human to fetch.

Identify:

- Current branch name
- Destination branch name
- All commits that will be part of this PR
- Files changed (paths relative to repo root — needed for CODEOWNERS matching)
- Workspace / repo slug from `origin` (e.g. `techubits` / `user-event-manager-services`)

### Step 2 — Determine Target Branch (gitflow)

| Source branch | Preferred target     |
| ------------- | -------------------- |
| `feature/*`   | `develop`            |
| `release/*`   | `main` AND `develop` |
| `hotfix/*`    | `main` AND `develop` |
| `bugfix/*`    | `develop`            |

**Fallback:** If `origin/develop` does not exist, use the repo default branch from `git remote show origin` (`master` or `main`). Never invent a destination that is not on the remote.

### Step 3 — Resolve Jira Ticket

If a Jira ticket ID is in `$ARGUMENTS` or embedded in the branch name (e.g. `feature/UBITS-234-enrollment`):

- Use the ticket ID for the PR title prefix: `[UBITS-234]`
- Include the Jira URL in the PR description

If no ticket ID is found: use the branch description and commit messages to infer the PR title.

### Step 4 — Build PR Description

Use the template from `references/pr-description.md` (or `.bitbucket/pull-request-template.md` if present). Fill in:

- **Title**: `[TICKET-ID] Short imperative description` (max 72 chars). Optional conventional style: `[TICKET-ID] type: short description` (e.g. `feat`, `fix`, `refactor`).
- **Summary**: What changed and why (2–4 bullet points from the commits)
- **Type of change**: Feature / Bug fix / Refactor / Docs / Config
- **Test plan**: What was tested (unit, integration, manual)
- **Breaking changes**: Yes/No — if yes, describe the impact
- **Checklist**: auto-check items that are verifiably true from the diff

**Bitbucket Cloud checkboxes:** Do **not** use GitHub-style `- [ ]` / `- [x]` — Bitbucket
strips them and renders plain bullets. Use Unicode `☐` (unchecked) and `:ballot_box_with_check:` (checked)
exactly as in `references/pr-description.md`.

**Harness hook safety:** Keep the PR body free of literal tokens that trigger the destructive-shell hook when passed through a shell command (`TRUNCATE`, `DROP TABLE`, `DROP DATABASE`, `migrate:fresh`, `migrate:refresh`, `db:wipe`, `db:seed`). Prefer the wording already in `references/pr-description.md`.

Write the filled body with the agent **Write** tool to `/tmp/pr-body.md` (or accept a path the user already provided). Never build the PR description via a shell heredoc that embeds the full markdown.

### Step 5 — Resolve Reviewers (`.bitbucket` files are mandatory for reviewers)

Bitbucket **UI** may suggest code owners on create. Creating a PR via **REST API without an explicit `reviewers` list leaves the PR at 0 reviewers**. This skill assigns reviewers **only** from `.bitbucket/CODEOWNERS` + `.bitbucket/teams.yaml`.

**Hard ban — never call these endpoints for reviewer selection:**

- `…/effective-default-reviewers`
- Any other “default reviewers” / repository-settings reviewer list API

Do **not** invent reviewers from memory, prior PRs, or hardcoded UUID examples in this skill. UUID resolution via workspace members (5.5) is allowed **only after** ownership files exist and owners were matched from them.

#### 5.0 Gate — require ownership files

Prefer files from the **destination** branch (Bitbucket’s rule):

```bash
git show "origin/<destination>:.bitbucket/CODEOWNERS"
git show "origin/<destination>:.bitbucket/teams.yaml"
```

If missing on destination, fall back to the working tree `.bitbucket/CODEOWNERS` and `.bitbucket/teams.yaml`.

**Both files must be present** (destination or working tree) to resolve and attach reviewers.

If either file is missing:

1. **Stop** and ask the human to create them before continuing with reviewers.
2. Tell them the templates live in the **Harness** project under `.bitbucket/` (copy `.bitbucket/CODEOWNERS` and `.bitbucket/teams.yaml` from the Harness checkout into this repo, then adapt team names / emails).
3. Remind them Bitbucket reads CODEOWNERS from the **destination** branch — merge or land these files on that branch before they take effect in the UI.
4. **Do not** call `effective-default-reviewers` or any default-reviewer API. **Do not** ask for ad-hoc reviewer emails/UUIDs as a substitute for the files.
5. Offer two choices and wait for an explicit answer:
   - **A (preferred):** Create/add the `.bitbucket` files (from Harness), then re-run this skill so reviewers can be assigned.
   - **B:** Proceed **without reviewers** — create the PR with **no** `reviewers` array (or an empty list). Reviewer assignment stays blocked until the files exist.

If the user chooses **B**, skip 5.1–5.6, omit reviewers in the create payload, and in Step 7 report clearly that the PR has **0 reviewers** because ownership files were missing. Never backfill reviewers via API afterward.

#### 5.1 Read ownership config

With both files available (from 5.0), load CODEOWNERS + `teams.yaml` content from destination (preferred) or working tree.

#### 5.2 Match changed paths to CODEOWNERS

- Ignore comment lines (`#…`).
- Each rule: `<pattern> <owner> [<owner>…]` (gitignore-like patterns; last matching rule wins per file).
- Collect the union of owners for all files in `git diff --name-only origin/<destination>..HEAD`.
- Owners may be: `email@…`, `@username`, `@workspace/group`, or `@teams/<team-name>` (optional `:all` / `:random(N)` / `:least_busy(N)` suffix).

#### 5.3 Expand `@teams/<name>` via `teams.yaml`

For each `@teams/<name>`:

1. Load team `name` from `teams.yaml` (`contributors` + `reviews.strategy` / `reviews.select`).
2. Inline CODEOWNERS strategy **overrides** `teams.yaml` (`@teams/foo:all` → all contributors).
3. Otherwise apply `reviews.strategy` + `reviews.select`:
   - `all` → every contributor
   - `random` → pick `select` (default 1)
   - `least_busy` → prefer contributors with fewer open PR review assignments when countable via API; if counts are unavailable, pick `select` stable distinct members (document the fallback) — **never pick 0**
4. Contributors are emails or `"@username"` strings.

If CODEOWNERS references `@teams/<name>` but that team is missing from `teams.yaml`, warn and skip that owner; do not fall back to default-reviewer APIs.

#### 5.4 (Removed) — no API default-reviewer fallback

There is **no** fallback to `effective-default-reviewers` or repository default reviewers. Missing or unusable `.bitbucket` ownership config → gate in 5.0 (create files or proceed with zero reviewers).

#### 5.5 Resolve identities to Bitbucket user UUIDs

Only when 5.0–5.3 produced owner emails/`@username` strings, map them via workspace members:

```bash
curl -sS -u "${BITBUCKET_USER}:${BITBUCKET_TOKEN}" \
  -o /tmp/ws-members.json -w "\nhttp=%{http_code}\n" \
  "https://api.bitbucket.org/2.0/workspaces/<workspace>/members?pagelen=100"
```

Run this as its **own** shell call with `required_permissions: ["full_network"]` set from the start (see Step 6 § Network / sandbox rules — the same requirement applies here, not only to the create/verify calls). Parse `/tmp/ws-members.json` with `jq` in a separate command, then delete it with the agent Delete tool.

Match emails to members (display name / nickname heuristics are OK when email is not returned). Skip unresolved entries and warn; do not abort if ≥1 UUID resolved.

Auth: use `BITBUCKET_USER` + `BITBUCKET_TOKEN` (Basic). Never print the token. Never put the token in the process list via `https://user:token@...` git remotes.

#### 5.6 Final reviewer list

- Deduplicate by UUID.
- **Exclude the PR author when identifiable — never via `/2.0/user`:**
  1. Prefer the local git identity email (matches `teams.yaml` contributors in normal setups):
     ```bash
     git config user.email
     # fallback if empty:
     git log -1 --format='%ae'
     ```
  2. Match that email (case-insensitive) against resolved owners / workspace members and drop the matching UUID from `reviewers`.
  3. If no usable git email is available, **skip author exclusion** (warn once) and keep the CODEOWNERS-derived list as-is.
  4. Author exclusion is best-effort only. **Never block or delay the PR create (`POST …/pullrequests`) because the author could not be identified.** The create API authenticates with `BITBUCKET_USER`/`BITBUCKET_TOKEN`; it does not need `/2.0/user` or a git email.
- Target size: honor `select` from teams (often 2). If only one UUID resolved, still attach that one.
- Payload shape: `"reviewers": [ {"uuid": "{…}"}, … ]`
- If files existed but **zero** UUIDs resolved: create the PR **without** reviewers, warn in Step 7, and do **not** call default-reviewer APIs to fill the gap. If create returned empty reviewers but Step 5 produced UUIDs, `PUT` those same CODEOWNERS-derived UUIDs only.

### Step 6 — Create the PR with split shell commands (required)

**Do not use `bb`.** It is not installed in this environment and must not be part of the flow.

**Do not use Python/Node helper scripts or multi-step shell generators** to build the payload — those are easy to trip Harness destructive-command hooks when the PR body is inlined.

#### Network / sandbox rules (required pattern — apply from the first attempt, do not discover this by trial and error)

This is a **known, documented failure mode with a known fix**. Do not run any `curl` to `api.bitbucket.org` without both conditions below already in place — a first "plain" attempt is expected to fail and wastes a round-trip:

| Pattern | Result |
| -------- | -------------- |
| `curl … api.bitbucket.org …` as its **own** shell call, **with** `required_permissions: ["full_network"]` set on that call | Succeeds — this is the only pattern to use |
| Same `curl`, but **without** `required_permissions` requested | Fails: `curl: (56) CONNECT tunnel failed, response 403`, `http=000` |
| `curl` chained with **any** other command in the same shell invocation — via `&&`, `;`, or a pipe (`\| tee …`, `\| jq …`), even something as innocuous as `git status && … && curl …` | Fails the same way: sandbox proxy `CONNECT tunnel failed, 403` to `api.bitbucket.org` |
| SSH `git push` / `git fetch` | DNS failure inside sandbox (different issue — see Step 0.3; do not confuse with the `curl` case, and do not assume permission-escalation fixes it) |

**Required split — every single step, no exceptions:**

1. Write `/tmp/pr-body.md` with the Write tool (or use the path the user attached).
2. Build `/tmp/pr-payload.json` with **only** `jq` (no network, no `curl`, in that command).
3. `POST` with `curl` as its **own** shell call — nothing else in the same invocation — **and** `required_permissions: ["full_network"]` passed on that call. If that specific call still fails, retry the identical command with `required_permissions: ["all"]` before considering it blocked. Capture output with `curl -o` and `-w "\nhttp=%{http_code}\n"`; inspect the file in a separate follow-up command.
4. Verify with a **standalone** `curl` GET to the new PR id — same rule: its own call, `required_permissions: ["full_network"]` (then `["all"]` if needed).
5. Delete temp files with the agent **Delete** tool (never shell `rm` — Harness hooks block it).

This applies to **every** `curl` in this skill: the open-PR check (Step 0.7), the workspace-members lookup (Step 5.5), create (Command B), verify (Command C), and update (Command E). None of them should ever be attempted without `required_permissions` already set.

#### Exact example (copy and adapt)

```bash
# --- Command A: build payload only (no network) ---
WORKSPACE="techubits"
REPO="user-event-manager-services"
SOURCE_BRANCH="$(git branch --show-current)"
DEST_BRANCH="develop"   # from Step 2
TITLE="[PTT-3107] Alert Slack on access-control lookup failure"

# PR body must already exist at /tmp/pr-body.md (Write tool)
# reviewers UUIDs MUST come from Step 5 (CODEOWNERS + teams.yaml → members).
# Omit the reviewers key entirely when Step 5.0 choice B or zero UUIDs resolved.
jq -n \
  --arg title "$TITLE" \
  --rawfile description /tmp/pr-body.md \
  --arg source "$SOURCE_BRANCH" \
  --arg dest "$DEST_BRANCH" \
  '{
    title: $title,
    description: $description,
    source: { branch: { name: $source } },
    destination: { branch: { name: $dest } },
    close_source_branch: true,
    reviewers: [
      { "uuid": "{…from-step-5…}" },
      { "uuid": "{…from-step-5…}" }
    ]
  }' > /tmp/pr-payload.json
```

```bash
# --- Command B: POST only ---
# Run as its OWN shell call: no other command in the same invocation (no &&, ;, or pipes),
# AND request required_permissions: ["full_network"] on this call from the start.
# If it still fails, retry this identical command with required_permissions: ["all"].
curl -sS -u "${BITBUCKET_USER}:${BITBUCKET_TOKEN}" \
  -H "Content-Type: application/json" \
  -X POST \
  -d @/tmp/pr-payload.json \
  -o /tmp/pr-response.json \
  -w "\nhttp=%{http_code}\n" \
  "https://api.bitbucket.org/2.0/repositories/techubits/user-event-manager-services/pullrequests"
```

```bash
# --- Command C: verify ---
# Same rule as Command B: its own call, required_permissions: ["full_network"] (then ["all"] if needed).
curl -sS -u "${BITBUCKET_USER}:${BITBUCKET_TOKEN}" \
  -o /tmp/pr-verify.json -w "\nhttp=%{http_code}\n" \
  "https://api.bitbucket.org/2.0/repositories/techubits/user-event-manager-services/pullrequests/<id>"
```

Expect `http=201` on create (Command B) and `http=200` on verify (Command C). Inspect both response files with `jq` in separate follow-up commands.

- If Step 5 produced reviewer UUIDs: confirm `reviewers` is non-empty. If empty, `PUT` **only** those same CODEOWNERS/teams-derived UUIDs (never default-reviewer API results).
- If Step 5.0 choice **B** (proceed without ownership files) or zero UUIDs resolved: omit the `reviewers` array; do **not** `PUT` reviewers afterward.

Example `PUT` only when repairing a create that dropped CODEOWNERS-resolved reviewers:

```bash
# Command D: build update payload (no network) — UUIDs from Step 5 only
jq -n \
  --arg title "$TITLE" \
  '{
    title: $title,
    reviewers: [
      { "uuid": "{…from-step-5…}" }
    ]
  }' > /tmp/pr-update.json
```

```bash
# Command E: PUT only
# Own shell call, required_permissions: ["full_network"] from the start (then ["all"] if it still fails).
curl -sS -u "${BITBUCKET_USER}:${BITBUCKET_TOKEN}" \
  -H "Content-Type: application/json" \
  -X PUT \
  -d @/tmp/pr-update.json \
  -o /tmp/pr-update-response.json -w "\nhttp=%{http_code}\n" \
  "https://api.bitbucket.org/2.0/repositories/techubits/user-event-manager-services/pullrequests/<id>"
```

Then delete `/tmp/pr-body.md`, `/tmp/pr-payload.json`, `/tmp/pr-response.json`, `/tmp/pr-verify.json`, `/tmp/ws-members.json`, `/tmp/pr-open-check.json`, `/tmp/pr-update.json`, `/tmp/pr-update-response.json` with the agent Delete tool (not shell `rm`).

**Only escalate to the human if a `curl` call still fails after retrying with `required_permissions: ["all"]`** (i.e. both `["full_network"]` and `["all"]` were tried on that exact call and it still errored, or it was blocked by a local hook / auth failure). In that case, give the user:

1. The Bitbucket UI create link: `https://bitbucket.org/<workspace>/<repo>/pull-requests/new?source=<branch>&dest=<destination>&t=1`
2. The exact `curl` command that failed, run as its own standalone call (token via env vars only — never paste the secret)
3. Ask them to run push (if needed) and/or the POST, then confirm before continuing

### Step 7 — Report

Output:

- The PR URL (`links.html.href`)
- The reviewers assigned (display names) — or explicitly **0 reviewers** if ownership files were missing / unresolved
- Destination branch used
- Any checklist items that need manual verification
- Warnings for missing `.bitbucket` files / unresolved CODEOWNERS emails / author exclusion skipped (no git email) / stale `origin/<destination>`

## Notes

- Never push directly to `main`, `master`, or `develop` — always go through a PR.
- PR titles: `[TICKET-ID] Short imperative description` (optional `type:` after the ticket, e.g. `[PTT-3082] feat: …`).
- Push may need the human’s terminal when agent SSH/DNS fails; creating the PR via API can still succeed afterward if the branch is on `origin`.
- **Every `curl` to `api.bitbucket.org` must be its own shell call (no `&&`/`;`/pipes with anything else) with `required_permissions: ["full_network"]` requested from the first attempt** (fallback `["all"]` only if that specific call still fails). Do not run any of these calls "plain" first to check if it works — see Step 6 § Network / sandbox rules.
- Reviewers require `.bitbucket/CODEOWNERS` + `.bitbucket/teams.yaml` (templates from the Harness project). **Never** use `effective-default-reviewers` or other default-reviewer APIs.
- **Never** call `GET /2.0/user` (scope often missing). Identify the author via `git config user.email` / `git log -1 --format='%ae'` only; if unavailable, skip exclusion and still create the PR.
- Review `references/pr-description.md` for the full PR template used in UBITS projects.
- Do not leave temporary PR payload/response JSON committed under `.bitbucket/`; delete after use.
- Never use GitHub CLI (`gh`) or `bb` for this skill.
