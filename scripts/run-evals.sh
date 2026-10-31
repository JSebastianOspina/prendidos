#!/usr/bin/env bash
# run-evals.sh — Harness eval runner entry point.
#
# Tiers:
#   static   — symlink integrity, skill frontmatter, golden-task YAML validation (no API key)
#   agent    — golden tasks via Cursor SDK (requires CURSOR_API_KEY + cursor-sdk)
#
# Usage:
#   bash scripts/run-evals.sh                    # static + validate (CI default)
#   bash scripts/run-evals.sh --agent            # run all golden tasks with Cursor SDK
#   bash scripts/run-evals.sh --agent --changed  # agent tier only if skills/standards changed
#   bash scripts/run-evals.sh --agent --task create-rest-endpoint
#   bash scripts/run-evals.sh --model composer-2.5

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
EVALS_DIR="$ROOT_DIR/ai-specs/evals"
VENV_DIR="$EVALS_DIR/.venv"

ensure_venv() {
  if [[ ! -d "$VENV_DIR" ]]; then
    python3 -m venv "$VENV_DIR"
  fi
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
  pip install -q -r "$EVALS_DIR/requirements.txt"
  if [[ "${1:-}" == "--with-agent" ]]; then
    pip install -q -r "$EVALS_DIR/requirements-agent.txt" 2>/dev/null || true
  fi
}

WITH_AGENT=false
for arg in "$@"; do
  if [[ "$arg" == "--agent" ]]; then
    WITH_AGENT=true
  fi
done

if $WITH_AGENT; then
  ensure_venv --with-agent
else
  ensure_venv
fi

python3 "$EVALS_DIR/runner/run_evals.py" "$@"
