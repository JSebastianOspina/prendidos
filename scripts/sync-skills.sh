#!/usr/bin/env bash
# sync-skills.sh — CANONICAL implementation for skill symlink sync.
# The sync-agent-symlinks skill (ai-specs/skills/sync-agent-symlinks/SKILL.md)
# references this script; do not duplicate its logic elsewhere.
#
# Creates .claude/skills/ and .cursor/skills/ and populates them with
# relative symlinks pointing to every skill in ai-specs/skills/.
#
# Run this:
#   - Once after cloning / running init.sh
#   - Any time a skill is added, renamed, or removed from ai-specs/skills/
#
# Safe to re-run:
#   - Existing correct symlinks are not touched
#   - Local/non-canonical skills (real directories or external symlinks) are preserved
#
# Usage:
#   bash scripts/sync-skills.sh

set -euo pipefail

# On Windows (Git Bash / MSYS2 / Cygwin), `ln -s` silently COPIES the target
# unless the runtime is told to create native symlinks. This requires
# Developer Mode (or admin) on Windows 10/11 — the same requirement git
# already has for `core.symlinks=true`.
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    export MSYS=winsymlinks:nativestrict
    export CYGWIN=winsymlinks:nativestrict
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SKILLS_SRC="$ROOT_DIR/ai-specs/skills"

# Normalize a readlink result so comparisons are portable:
# backslashes → slashes, strip trailing slash.
normalize_link_target() {
  local t="${1//\\//}"
  printf '%s' "${t%/}"
}

is_canonical_symlink_target() {
  local target="$1"
  local rel_prefix="$2"
  target="$(normalize_link_target "$target")"
  [[ "$target" == "$rel_prefix/"* || "$target" == *"/ai-specs/skills/"* ]]
}

# Create a symlink and verify the result actually IS a symlink.
# Guards against MSYS/Cygwin falling back to a directory copy.
make_symlink() {
  local want="$1"
  local link="$2"

  [[ -L "$link" ]] && rm "$link"
  if ! ln -s "$want" "$link" 2>/dev/null || [[ ! -L "$link" ]]; then
    rm -rf "$link" # remove any accidental copy left behind
    echo ""
    echo "  ✗ Could not create symlink: $link"
    echo "    On Windows, enable Developer Mode (Settings → System → For developers)"
    echo "    or run this script from an elevated (admin) shell, then re-run."
    exit 1
  fi
}

sync_target() {
  local target_dir="$1"
  # Relative prefix from target_dir back to ai-specs/skills/
  # Both .claude/skills/ and .cursor/skills/ are two levels deep from ROOT_DIR
  local rel_prefix="../../ai-specs/skills"

  mkdir -p "$target_dir"

  local added=0 skipped=0 removed=0 conflicts=0 repaired=0

  # ── Add / update symlinks for canonical skills ───────────────────────────────
  for skill_path in "$SKILLS_SRC"/*/; do
    [[ -d "$skill_path" ]] || continue
    local name
    name=$(basename "$skill_path")
    local link="$target_dir/$name"
    local want="$rel_prefix/$name"

    if [[ -L "$link" && "$(normalize_link_target "$(readlink "$link")")" == "$want" ]]; then
      skipped=$((skipped + 1))
    elif [[ -d "$link" && ! -L "$link" ]] && diff -rq "$link" "$SKILLS_SRC/$name" >/dev/null 2>&1; then
      # Accidental copy (e.g. `ln -s` on Windows without native symlinks, or a
      # checkout with core.symlinks=false). Content is identical to the
      # canonical skill, so it is safe to replace with the real symlink.
      rm -rf "$link"
      make_symlink "$want" "$link"
      repaired=$((repaired + 1))
      echo "    ~ $name (copy replaced with symlink)"
    elif [[ -e "$link" && ! -L "$link" ]]; then
      conflicts=$((conflicts + 1))
      echo "    ! $name (conflict: existing entry is not a symlink and differs, skipped)"
    else
      make_symlink "$want" "$link"
      added=$((added + 1))
      echo "    + $name"
    fi
  done

  # ── Remove orphan canonical symlinks only ───────────────────────────────────
  for link in "$target_dir"/*; do
    [[ -e "$link" || -L "$link" ]] || continue
    [[ -L "$link" ]] || continue

    local target
    target=$(normalize_link_target "$(readlink "$link")")
    if ! is_canonical_symlink_target "$target" "$rel_prefix"; then
      continue
    fi

    local skill_name
    skill_name=$(basename "$target")
    if [[ ! -d "$SKILLS_SRC/$skill_name" ]]; then
      rm "$link"
      removed=$((removed + 1))
      echo "    - $(basename "$link") (stale canonical symlink, removed)"
    fi
  done

  echo "    $added added, $skipped unchanged, $repaired repaired, $removed removed, $conflicts conflicts"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  sync-skills"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "→ .claude/skills/"
sync_target "$ROOT_DIR/.claude/skills"

echo "→ .cursor/skills/"
sync_target "$ROOT_DIR/.cursor/skills"

echo ""
echo "  ✓ Skills symlinks synced"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
