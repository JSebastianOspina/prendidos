---
name: gitflow-release
description: Execute a full git flow release — start the release branch, bump the version, update CHANGELOG.md from commits, finish the release, and push main, develop, and the version tag to Bitbucket.
author: UBITS
version: 1.0.0
---

# gitflow-release Skill

Use when the team is ready to cut a new release from the `develop` branch.

## Instructions

Execute git flow release for version: $ARGUMENTS.

If no version is provided in `$ARGUMENTS`, read the current version from `package.json` and suggest the next semantic version based on the commits since the last release.

### Step 1 — Pre-release Checks

Before starting:

```bash
git status           # must be clean
git checkout develop
git pull origin develop
```

Verify:

- Working tree is clean (no uncommitted changes)
- `develop` is up to date with `origin/develop`
- All required pipeline checks are green on `develop`

### Step 2 — Determine the Version

If `$ARGUMENTS` contains a version (e.g., `1.4.0`), use it directly.

Otherwise, analyze commits since the last tag to suggest a version:

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

- Any `feat:` commit → minor bump (1.3.0 → 1.4.0)
- Any `fix:` commit only → patch bump (1.3.0 → 1.3.1)
- Any `BREAKING CHANGE:` → major bump (1.3.0 → 2.0.0)

Confirm the version with the user before proceeding.

### Step 3 — Start the Release Branch

```bash
git flow release start $VERSION
# Creates: release/$VERSION from develop
```

### Step 4 — Bump Version

Update `package.json` (and `package-lock.json`) with the new version:

```bash
npm version $VERSION --no-git-tag-version
```

If a monorepo: update the root `package.json` and all `apps/*/package.json` that require version bumps.

### Step 5 — Update CHANGELOG.md

Read the git log since the last tag and group commits by type:

```markdown
## [$VERSION] — YYYY-MM-DD

### Features

- [feat commit messages]

### Bug Fixes

- [fix commit messages]

### Internal / Refactor

- [chore, refactor, docs commits]
```

If `CHANGELOG.md` does not exist, create it with the standard format.

Commit the version and changelog changes:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to $VERSION and update CHANGELOG"
```

### Step 6 — Finish the Release

```bash
git flow release finish $VERSION
# Merges release/$VERSION → main, tags vX.Y.Z, merges main → develop, deletes release branch
```

When prompted for the tag message: use `"Release v$VERSION"`.

### Step 7 — Push Everything

```bash
git push origin main
git push origin develop
git push origin --tags
```

### Step 8 — Report

Output:

- The version released: `v$VERSION`
- The tag created
- The CHANGELOG section added
- Confirm main, develop, and tag are pushed

## Notes

- `git flow` CLI must be installed: `brew install git-flow-avh` (macOS) or `apt install git-flow`.
- Never skip the CHANGELOG update — releases without changelogs lose traceability.
- After the release, communicate the version to the team via the project's Slack/communication channel.
