---
name: sync-agent-symlinks
description: Analyze and synchronize agent skill exposure after ai-specs skill changes (additions, removals, renames). Use when skills are added/removed in ai-specs and .claude/skills and .cursor/skills must stay aligned through symlinks.
author: cburbano@ubits.co
version: 1.1.0
---

# sync-agent-symlinks Skill

Keep agent-facing skill structures synchronized with `ai-specs/skills` as the canonical source.

**Canonical implementation:** `scripts/sync-skills.sh`. This skill adds pre/post analysis and reporting around that script — do not duplicate its symlink logic manually.

Use this skill after any change in `ai-specs/skills` (new skill, removed skill, renamed skill, moved skill), especially when you need to avoid stale or broken symlinks.

## Scope and Safety Rules

- Canonical source is `ai-specs/skills`.
- Mirror targets are:
  - `.claude/skills`
  - `.cursor/skills`
- The script manages only entries that are symlinks to `../../ai-specs/skills/<skill-name>`.
- Do not delete non-symlink directories in mirror targets unless the user explicitly asks.
- Never overwrite a real directory automatically; report it as a conflict.

## Workflow

### Step 1 - Build inventories (before sync)

Collect three inventories:

1. Canonical skills from `ai-specs/skills/*/SKILL.md`
2. Mirror entries in `.claude/skills`
3. Mirror entries in `.cursor/skills`

From mirror entries, classify:

- `linked`: valid symlink pointing to existing canonical skill
- `broken`: symlink target missing
- `orphan`: symlink points to canonical namespace but skill no longer exists
- `conflict`: non-symlink entry with same name as canonical skill
- `external`: entry not managed by canonical symlink policy (leave unchanged)

### Step 2 - Compute sync plan

For each mirror target, predict what the script will do:

- `to_add`: canonical skills missing in mirror target
- `to_fix`: broken canonical symlinks that should be recreated
- `to_remove`: orphan canonical symlinks with no canonical source
- `to_skip`: conflicts and external entries (report only)

### Step 3 - Run canonical sync

Execute:

```bash
bash scripts/sync-skills.sh
```

Do **not** manually run `ln -s` or `rm` for canonical symlinks — the script handles add, fix, and orphan removal idempotently.

### Step 4 - Verify integrity (after sync)

After the script completes:

- Confirm every canonical skill exists in both mirrors as a valid symlink, or is explicitly listed as conflict.
- Confirm no broken canonical symlinks remain.
- Confirm external entries remain untouched.

### Step 5 - Report results

Return a concise sync report combining pre-sync inventory and script output:

- Canonical skills count
- Per mirror target:
  - added
  - fixed
  - removed
  - conflicts
  - skipped external entries
- Remaining blockers (if any)

## Add/Remove Scenarios

### Scenario A - New skill added in ai-specs

Expected behavior (via `scripts/sync-skills.sh`):

- Add missing symlink in `.claude/skills`
- Add missing symlink in `.cursor/skills`
- Verify both links resolve to canonical folder

### Scenario B - Skill removed from ai-specs

Expected behavior (via `scripts/sync-skills.sh`):

- Remove orphan canonical symlink from `.claude/skills`
- Remove orphan canonical symlink from `.cursor/skills`
- Keep non-canonical directories untouched and report them

## Red Flags

Never:

- treat `ai-specs` as non-canonical
- auto-delete real directories in mirror targets
- leave broken canonical symlinks after sync
- silently skip conflicts without reporting
- duplicate symlink commands that `scripts/sync-skills.sh` already implements

Always:

- analyze before changing
- run `bash scripts/sync-skills.sh` for the actual sync
- preserve non-canonical entries
- provide a final sync report with blockers
