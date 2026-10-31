---
name: commit
description: Create focused commits and push to Bitbucket following repository standards. Bitbucket is the only supported VCS platform.
author: cburbano@ubits.co
version: 1.3.0
---
# commit Skill

Use at the end of the Harness workflow (after `/adversarial-review` and before or after `/archive`, per team convention) to commit changes and push the branch to **Bitbucket**. This skill does **not** open a pull request.

## Instructions

# Role

You are an expert in version control and release workflows. You create clear, comprehensive commits that align with project standards and make review and traceability straightforward.

# VCS platform

**Bitbucket is the only supported VCS hosting platform.** Do not use GitHub CLI (`gh`), GitHub Actions, or GitHub PR URLs. To open a pull request, the user must invoke the `bitbucket-pr` skill separately — never load or run it from this skill.

# Arguments

**Optional.** `$ARGUMENTS` may contain:

- **Nothing (empty)**: Stage and commit all relevant changes in the working tree, then push.
- **Feature/ticket identifiers**: e.g. ticket IDs (e.g. `UBITS-234`), branch names, or short feature labels. When provided, stage and commit **only** the changes that belong to those features; leave all other changes unstaged and uncommitted.
- **Description-only / no-git mode**: If the user **explicitly** says something like "only commit" (meaning only produce the commit text), "only description", "don't touch git", "just the message", or "dry run", then do **not** run any git commands. Only determine scope, list what would be staged, and output the proposed commit message (subject + body).

# Goal

1. Produce a **single, comprehensive commit** that accurately describes the relevant changes.
2. **Push** the branch to `origin` on Bitbucket.
3. **Stop.** Suggest that the user may run the `bitbucket-pr` skill if they want a PR — do **not** create a PR and do **not** load or follow `bitbucket-pr` automatically.

# Process and rules

## 0. Description-only / no-git mode (check first)

If the user **explicitly** requested no git operations (e.g. "only description", "don't touch git", "just the message", "dry run"):

- Perform **only** steps 1–3: inspect state, resolve scope, and write the full commit message (subject + body).
- **Do not** run `git add`, `git commit`, or `git push`.
- Output for the user:
  1. List of files (and hunks, if partial) that would be staged.
  2. The proposed commit message in a copy-pasteable block.
- Then stop; skip steps 4 and 5.

## 1. Inspect current state

- Run `git status` and `git diff` (and `git diff --staged` if needed) to list all modified, added, and deleted files.
- Identify the current branch. If not on a feature branch, create one from the base branch (e.g. `main` or `develop`) before committing, per gitflow conventions.

## 2. Resolve scope: full commit vs feature-scoped commit

- **If `$ARGUMENTS` is empty or not provided**
  - Treat all relevant changes (excluding files that should not be committed, e.g. `.env`, build artifacts, local config) as the scope for this commit.
  - Stage all of those and proceed to step 3.

- **If `$ARGUMENTS` is provided (e.g. ticket IDs or feature names)**
  - Map each argument to the changes that clearly belong to it (by path, ticket id in branch name, or context in diffs).
  - Stage **only** the files/hunks that belong to those features.
  - Leave any other modified files **unstaged** and do not include them in the commit.
  - If a file contains both feature-related and unrelated changes, use `git add -p` (or equivalent) to stage only the hunks that belong to the requested features.
  - If no changes clearly match the given arguments, report this and do not commit.

## 3. Commit message

- Write the commit message **in English** (per `docs/base-standards.md`).
- Make it **descriptive** and aligned with the team's commit convention (defined in `docs/base-standards.md` § Project Context during setup).
- Structure it so that:
  - **Subject line**: Short, imperative summary. Optionally prefix with a ticket id (e.g. `UBITS-234: Add enrollment export`).
  - **Body** (if needed): Bullet points or short paragraphs describing what changed and why. Reference ticket IDs here if they apply.
- Do not commit secrets, `.env`, or other sensitive or generated artifacts.

## 4. Commit and push

- Create the commit with the message from step 3.
- Push the current branch to Bitbucket: `git push -u origin HEAD` (or `git push origin <branch>` if upstream is already set).
- If push fails due to sandbox DNS/network restrictions, retry with unrestricted network / full permissions. Do not force-push.
- If push still fails, report the situation and ask the human to push from their terminal. Do **not** proceed to open a PR as a workaround.

## 5. Summary for the user (end here)

- Report what was committed (files and scope).
- If arguments were provided: confirm which features/tickets were included and that other changes were left unstaged.
- Confirm whether the push succeeded.
- **If the commit succeeded**, end with an explicit suggestion such as: you can open a Bitbucket PR by invoking the `bitbucket-pr` skill (optionally with a ticket id). Do **not** load, follow, or run `bitbucket-pr` unless the user explicitly asks in a later turn.

# References

- `docs/base-standards.md`: English-only for commit messages; Bitbucket as VCS platform.
- `ai-specs/skills/bitbucket-pr/SKILL.md`: Separate skill to create a Bitbucket PR (manual invocation only).

# Notes

- **No automatic PR**: This skill never creates a pull request and never auto-invokes `bitbucket-pr`. A post-commit suggestion is the only link between the two.
- **Description-only**: When the user asks for only the commit text, output the staging plan and message only; do not run any git commands.
- Do not run destructive git commands (e.g. `git push --force`) unless the user explicitly requests it.
- Never push directly to `main` or `develop`.
- If there are conflicts or the push is rejected, report the situation and suggest next steps (e.g. pull/rebase then push), but do not force-push unless the user asks.
