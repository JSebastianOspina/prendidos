#!/usr/bin/env bash
# upgrade-harness.sh — Safely pull portable Harness updates into an adopted project.
#
# Updates by default:
#   - ai-specs/skills/          (add + refresh; keeps project-local skills)
#   - scripts/sync-skills.sh
#   - scripts/upgrade-harness.sh (self)
#
# Never touches (project-customized):
#   - ai-specs/agents/
#   - docs/
#   - CLAUDE.md / AGENTS.md / openspec/ / README / package.json / …
#
# Optional:
#   --with-hooks   also refresh ai-specs/hooks/ + scripts/sync-hooks.sh
#   --prune        remove skills present locally but absent upstream (destructive)
#   --apply        write changes (default is dry-run / preview only)
#   --yes          skip confirmation when applying
#
# Usage:
#   bash scripts/upgrade-harness.sh /path/to/harness
#   bash scripts/upgrade-harness.sh /path/to/harness --apply
#   bash scripts/upgrade-harness.sh /path/to/harness --with-hooks --apply --yes

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SOURCE=""
APPLY=false
WITH_HOOKS=false
PRUNE=false
YES=false

usage() {
  cat <<'EOF'
Usage: bash scripts/upgrade-harness.sh <harness-source-path> [options]

Safely refresh portable Harness artifacts without overwriting project-customized
agents or docs.

Arguments:
  <harness-source-path>   Path to an up-to-date Harness checkout (or release tag worktree)

Options:
  --apply         Write changes (default: dry-run preview only)
  --with-hooks    Also refresh ai-specs/hooks/ and scripts/sync-hooks.sh
  --prune         Delete local skills/hooks files absent upstream (keeps local-only otherwise)
  --yes           Do not prompt for confirmation when --apply is set
  -h, --help      Show this help

Never updated by this script:
  ai-specs/agents/, docs/, OpenSpec config, project README, package manifests
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=true; shift ;;
    --with-hooks) WITH_HOOKS=true; shift ;;
    --prune) PRUNE=true; shift ;;
    --yes|-y) YES=true; shift ;;
    -h|--help) usage; exit 0 ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -n "$SOURCE" ]]; then
        echo "Error: unexpected argument: $1" >&2
        usage >&2
        exit 1
      fi
      SOURCE="$1"
      shift
      ;;
  esac
done

if [[ -z "$SOURCE" ]]; then
  usage >&2
  exit 1
fi

if [[ ! -d "$SOURCE" ]]; then
  echo "Error: harness source path does not exist: $SOURCE" >&2
  exit 1
fi

SOURCE="$(cd "$SOURCE" && pwd)"

if [[ "$SOURCE" == "$ROOT_DIR" ]]; then
  echo "Error: source path is the same as this project. Point at a separate Harness checkout." >&2
  exit 1
fi

missing=0
for rel in ai-specs/skills scripts/sync-skills.sh; do
  if [[ ! -e "$SOURCE/$rel" ]]; then
    echo "Error: upstream does not look like Harness (missing $rel): $SOURCE" >&2
    missing=1
  fi
done
if [[ "$WITH_HOOKS" == true && ! -d "$SOURCE/ai-specs/hooks" ]]; then
  echo "Error: --with-hooks requested but upstream has no ai-specs/hooks/: $SOURCE" >&2
  missing=1
fi
if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

ADDED=0
UPDATED=0
UNCHANGED=0
REMOVED=0
SKIPPED_LOCAL=0
FILES_UPDATED=0
FILES_UNCHANGED=0

declare -a REPORT_LINES=()
# Planned ops: "copy_dir|src|dest" | "copy_file|src|dest" | "rm_rf|path"
declare -a PLANNED_OPS=()

add_report() {
  REPORT_LINES+=("$1")
}

plan_copy_dir() {
  local src="$1"
  local dest="$2"
  PLANNED_OPS+=("copy_dir|$src|$dest")
}

plan_copy_file() {
  local src="$1"
  local dest="$2"
  PLANNED_OPS+=("copy_file|$src|$dest")
}

plan_rm_rf() {
  local path="$1"
  PLANNED_OPS+=("rm_rf|$path")
}

dirs_differ() {
  local a="$1"
  local b="$2"
  ! diff -rq "$a" "$b" >/dev/null 2>&1
}

plan_skill() {
  local name="$1"
  local src="$SOURCE/ai-specs/skills/$name"
  local dest="$ROOT_DIR/ai-specs/skills/$name"

  if [[ ! -d "$dest" ]]; then
    add_report "  + skill/$name (new)"
    ADDED=$((ADDED + 1))
    plan_copy_dir "$src" "$dest"
    return
  fi

  if dirs_differ "$src" "$dest"; then
    add_report "  ~ skill/$name (updated)"
    UPDATED=$((UPDATED + 1))
    plan_copy_dir "$src" "$dest"
  else
    UNCHANGED=$((UNCHANGED + 1))
  fi
}

plan_all_skills() {
  local src_skills="$SOURCE/ai-specs/skills"
  local dest_skills="$ROOT_DIR/ai-specs/skills"
  local skill_path name

  for skill_path in "$src_skills"/*/; do
    [[ -d "$skill_path" ]] || continue
    name=$(basename "$skill_path")
    plan_skill "$name"
  done

  if [[ ! -d "$dest_skills" ]]; then
    return
  fi

  for skill_path in "$dest_skills"/*/; do
    [[ -d "$skill_path" ]] || continue
    name=$(basename "$skill_path")
    if [[ -d "$src_skills/$name" ]]; then
      continue
    fi
    if [[ "$PRUNE" == true ]]; then
      add_report "  - skill/$name (prune: absent upstream)"
      REMOVED=$((REMOVED + 1))
      plan_rm_rf "$skill_path"
    else
      add_report "  = skill/$name (local-only, kept)"
      SKIPPED_LOCAL=$((SKIPPED_LOCAL + 1))
    fi
  done
}

plan_hooks_tree() {
  local src="$SOURCE/ai-specs/hooks"
  local dest="$ROOT_DIR/ai-specs/hooks"

  if [[ ! -d "$dest" ]]; then
    add_report "  + hooks/ (new tree)"
    ADDED=$((ADDED + 1))
    plan_copy_dir "$src" "$dest"
    return
  fi

  if dirs_differ "$src" "$dest"; then
    add_report "  ~ hooks/ (updated)"
    UPDATED=$((UPDATED + 1))
    plan_copy_dir "$src" "$dest"
  else
    UNCHANGED=$((UNCHANGED + 1))
    add_report "  = hooks/ (unchanged)"
  fi
}

plan_file() {
  local rel="$1"
  local src="$SOURCE/$rel"
  local dest="$ROOT_DIR/$rel"

  if [[ ! -f "$src" ]]; then
    echo "Warning: upstream missing $rel — skipped" >&2
    return
  fi

  if [[ -f "$dest" ]] && diff -q "$src" "$dest" >/dev/null 2>&1; then
    FILES_UNCHANGED=$((FILES_UNCHANGED + 1))
    return
  fi

  if [[ -f "$dest" ]]; then
    add_report "  ~ $rel"
  else
    add_report "  + $rel"
  fi
  FILES_UPDATED=$((FILES_UPDATED + 1))
  plan_copy_file "$src" "$dest"
}

apply_ops() {
  local op src dest path
  local entry
  for entry in "${PLANNED_OPS[@]}"; do
    IFS='|' read -r op src dest <<<"$entry"
    case "$op" in
      copy_dir)
        mkdir -p "$(dirname "$dest")"
        rm -rf "$dest"
        cp -R "$src" "$dest"
        ;;
      copy_file)
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        ;;
      rm_rf)
        path="$src"
        rm -rf "$path"
        ;;
      *)
        echo "Error: unknown planned op: $op" >&2
        exit 1
        ;;
    esac
  done
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  upgrade-harness"
echo "  Source : $SOURCE"
echo "  Target : $ROOT_DIR"
echo "  Mode   : $([[ "$APPLY" == true ]] && echo APPLY || echo DRY-RUN)"
echo "  Hooks  : $([[ "$WITH_HOOKS" == true ]] && echo yes || echo no)"
echo "  Prune  : $([[ "$PRUNE" == true ]] && echo yes || echo no)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Excluded (never touched): ai-specs/agents/, docs/, project config"
echo ""

echo "→ Planning skills"
plan_all_skills

plan_file "scripts/sync-skills.sh"
plan_file "scripts/upgrade-harness.sh"

if [[ "$WITH_HOOKS" == true ]]; then
  echo "→ Planning hooks"
  plan_hooks_tree
  plan_file "scripts/sync-hooks.sh"
fi

echo ""
echo "Plan:"
if [[ ${#REPORT_LINES[@]} -eq 0 ]]; then
  echo "  (nothing to change)"
else
  printf '%s\n' "${REPORT_LINES[@]}"
fi

echo ""
echo "Summary:"
echo "  skills/hooks  +$ADDED  ~$UPDATED  =$UNCHANGED  local-only=$SKIPPED_LOCAL  pruned=$REMOVED"
echo "  files         ~$FILES_UPDATED changed  =$FILES_UNCHANGED unchanged"

TOTAL_CHANGES=$((ADDED + UPDATED + REMOVED + FILES_UPDATED))

if [[ "$APPLY" != true ]]; then
  echo ""
  if [[ "$TOTAL_CHANGES" -eq 0 ]]; then
    echo "  ✓ Already up to date (dry-run)."
  else
    echo "  Dry-run only. Re-run with --apply to write these changes:"
    echo -n "    bash scripts/upgrade-harness.sh \"$SOURCE\" --apply"
    [[ "$WITH_HOOKS" == true ]] && echo -n " --with-hooks"
    [[ "$PRUNE" == true ]] && echo -n " --prune"
    echo
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  exit 0
fi

if [[ "$TOTAL_CHANGES" -eq 0 ]]; then
  echo ""
  echo "  ✓ Already up to date."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  exit 0
fi

if [[ "$YES" != true ]]; then
  echo ""
  read -r -p "Apply ${TOTAL_CHANGES} change(s)? [y/N] " reply
  case "$reply" in
    y|Y|yes|YES) ;;
    *)
      echo "Aborted."
      exit 1
      ;;
  esac
fi

echo ""
echo "→ Applying planned changes..."
apply_ops

echo "→ Re-syncing skill symlinks..."
bash "$ROOT_DIR/scripts/sync-skills.sh"

if [[ "$WITH_HOOKS" == true && -f "$ROOT_DIR/scripts/sync-hooks.sh" ]]; then
  echo "→ Re-syncing hooks..."
  bash "$ROOT_DIR/scripts/sync-hooks.sh"
fi

echo ""
echo "  ✓ Harness upgrade applied."
echo "  Review the git diff, then commit. Agents and docs were not modified."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
