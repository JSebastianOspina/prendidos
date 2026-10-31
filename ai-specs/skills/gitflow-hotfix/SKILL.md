---
name: gitflow-hotfix
description: Manage git flow hotfixes — hotfix start creates a hotfix/x.x.x branch from main; hotfix finish merges to main and develop, creates the patch tag, and pushes everything to Bitbucket.
author: UBITS
version: 1.0.0
---

# gitflow-hotfix Skill

Use when a critical bug is found in production (main) that cannot wait for the next regular release.

## Instructions

Execute git flow hotfix command: $ARGUMENTS.

`$ARGUMENTS` must be one of:

- `start [version]` — e.g., `start 1.3.1`
- `finish [version]` — e.g., `finish 1.3.1`

---

## hotfix start

### Step 1 — Pre-hotfix Checks

```bash
git status           # must be clean
git checkout main
git pull origin main
```

Verify:

- Working tree is clean
- `main` is up to date with `origin/main`
- The patch version makes sense (current production is `1.3.0` → hotfix is `1.3.1`)

### Step 2 — Determine the Hotfix Version

If no version is provided, read the current tag from `main` and suggest the next patch version:

```bash
git describe --tags --abbrev=0  # e.g., v1.3.0
```

Suggest `v1.3.1`. Confirm with the user.

### Step 3 — Create the Hotfix Branch

```bash
git flow hotfix start $VERSION
# Creates: hotfix/$VERSION from main
```

### Step 4 — Inform

Output:

- The hotfix branch created: `hotfix/$VERSION`
- Instruct the dev to implement the fix, run tests, and then run `/gitflow-hotfix finish $VERSION`

---

## hotfix finish

### Step 1 — Verify the Hotfix Is Ready

```bash
git status   # clean
git log --oneline main..HEAD   # show the hotfix commits
```

Confirm the fix is implemented and tested.

### Step 2 — Bump Version and Update CHANGELOG

Update `package.json` with the hotfix version:

```bash
npm version $VERSION --no-git-tag-version
```

Update `CHANGELOG.md` under a new `## [$VERSION] — YYYY-MM-DD` section:

```markdown
## [$VERSION] — YYYY-MM-DD

### Hotfix

- [Description of what was fixed and why it was critical]
```

Commit:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to $VERSION for hotfix"
```

### Step 3 — Finish the Hotfix

```bash
git flow hotfix finish $VERSION
# Merges hotfix/$VERSION → main (with tag v$VERSION)
# Merges hotfix/$VERSION → develop
# Deletes hotfix/$VERSION branch
```

When prompted for the tag message: use `"Hotfix v$VERSION: [brief description of the fix]"`.

### Step 4 — Push Everything

```bash
git push origin main
git push origin develop
git push origin --tags
```

### Step 5 — Report

Output:

- The hotfix version deployed: `v$VERSION`
- The tag created
- The CHANGELOG entry added
- Confirm main, develop, and tag are pushed
- Recommend notifying the team and updating the related Jira ticket

## Notes

- Hotfixes go directly to `main` — they bypass the normal release cycle.
- Always merge back to `develop` — missing this step causes the fix to be lost in the next release.
- The fix must be minimal and focused — if the fix is large, question whether it should be a hotfix or a regular feature release.
- `git flow` CLI must be installed: `brew install git-flow-avh` (macOS).
