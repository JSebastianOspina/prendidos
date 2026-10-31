#!/usr/bin/env bash
# sync-hooks.sh — CANONICAL implementation for agent hook sync.
#
# Exposes Harness hooks to Cursor (.cursor/hooks.json) and Claude Code
# (.claude/settings.json hooks block) from ai-specs/hooks/.
#
# Run this:
#   - Once after cloning / running init.sh
#   - Any time hook scripts or hook config change in ai-specs/hooks/
#
# Usage:
#   bash scripts/sync-hooks.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_SRC="$ROOT_DIR/ai-specs/hooks"
CURSOR_HOOKS_DIR="$ROOT_DIR/.cursor/hooks"
CLAUDE_HOOKS_DIR="$ROOT_DIR/.claude/hooks"
CURSOR_CONFIG="$ROOT_DIR/.cursor/hooks.json"
CLAUDE_SETTINGS="$ROOT_DIR/.claude/settings.json"
CLAUDE_HOOKS_FRAGMENT="$HOOKS_SRC/claude.hooks.json"

require_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "Error: required file not found: $file" >&2
    exit 1
  fi
}

sync_script_symlinks() {
  local target_dir="$1"
  local rel_prefix="$2"

  mkdir -p "$target_dir"

  local added=0 skipped=0

  for script_path in "$HOOKS_SRC"/scripts/*; do
    [[ -f "$script_path" ]] || continue
    local name
    name=$(basename "$script_path")
    local link="$target_dir/$name"
    local want="$rel_prefix/$name"

    if [[ -L "$link" && "$(readlink "$link")" == "$want" ]]; then
      skipped=$((skipped + 1))
    elif [[ -e "$link" && ! -L "$link" ]]; then
      echo "    ! $name (conflict: existing entry is not a symlink, skipped)" >&2
    else
      ln -sf "$want" "$link"
      chmod +x "$HOOKS_SRC/scripts/$name"
      added=$((added + 1))
      echo "    + $name"
    fi
  done

  echo "    $added added, $skipped unchanged"
}

sync_cursor_config() {
  local src="$HOOKS_SRC/cursor.hooks.json"
  require_file "$src"

  if [[ -L "$CURSOR_CONFIG" ]]; then
  local current
  current="$(readlink "$CURSOR_CONFIG")"
  if [[ "$current" == "../ai-specs/hooks/cursor.hooks.json" ]]; then
    echo "    unchanged (symlink)"
    return
  fi
  fi

  if [[ -e "$CURSOR_CONFIG" && ! -L "$CURSOR_CONFIG" ]]; then
    echo "    ! .cursor/hooks.json exists and is not a symlink (skipped)" >&2
    return
  fi

  ln -sf "../ai-specs/hooks/cursor.hooks.json" "$CURSOR_CONFIG"
  echo "    + cursor.hooks.json → .cursor/hooks.json"
}

merge_claude_hooks() {
  require_file "$CLAUDE_HOOKS_FRAGMENT"
  mkdir -p "$(dirname "$CLAUDE_SETTINGS")"

  python3 - "$CLAUDE_SETTINGS" "$CLAUDE_HOOKS_FRAGMENT" <<'PY'
import json
import sys
from pathlib import Path

settings_path = Path(sys.argv[1])
fragment_path = Path(sys.argv[2])

fragment = json.loads(fragment_path.read_text(encoding="utf-8"))
settings = {}
if settings_path.exists():
    settings = json.loads(settings_path.read_text(encoding="utf-8"))

settings.setdefault("hooks", {})
for event, matchers in fragment.get("hooks", {}).items():
    settings["hooks"][event] = matchers

settings_path.write_text(
    json.dumps(settings, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)
PY

  echo "    + merged hooks into .claude/settings.json"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  sync-hooks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "→ .cursor/hooks/"
sync_script_symlinks "$CURSOR_HOOKS_DIR" "../../ai-specs/hooks/scripts"

echo "→ .claude/hooks/"
sync_script_symlinks "$CLAUDE_HOOKS_DIR" "../../ai-specs/hooks/scripts"

echo "→ .cursor/hooks.json"
sync_cursor_config

echo "→ .claude/settings.json"
merge_claude_hooks

echo ""
echo "  ✓ Agent hooks synced"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
