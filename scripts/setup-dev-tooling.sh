#!/usr/bin/env bash
# setup-dev-tooling.sh — copy pre-commit + devcontainer templates and install hooks.
#
# Enforces Harness rules for human developers (complements agent hooks in .cursor/ / .claude/).
#
# Usage:
#   bash scripts/setup-dev-tooling.sh              # copy templates + pre-commit install
#   bash scripts/setup-dev-tooling.sh --copy-only  # copy only, no pip/pre-commit install
#   bash scripts/setup-dev-tooling.sh --install-only  # install hooks (devcontainer postCreate)
#   bash scripts/setup-dev-tooling.sh --force      # overwrite existing config files

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES="$ROOT_DIR/templates"

COPY_ONLY=false
INSTALL_ONLY=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --copy-only) COPY_ONLY=true; shift ;;
    --install-only) INSTALL_ONLY=true; shift ;;
    --force) FORCE=true; shift ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

copy_file() {
  local src="$1"
  local dest="$2"
  if [[ -e "$dest" && "$FORCE" != true ]]; then
    echo "    = $dest (exists, skipped — use --force to overwrite)"
    return
  fi
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "    + $dest"
}

copy_tree() {
  local src="$1"
  local dest="$2"
  if [[ -d "$dest" && "$FORCE" != true && "$(ls -A "$dest" 2>/dev/null)" ]]; then
    echo "    = $dest/ (exists, skipped — use --force to overwrite)"
    return
  fi
  mkdir -p "$dest"
  cp -R "$src/." "$dest/"
  echo "    + $dest/"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  setup-dev-tooling"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ "$INSTALL_ONLY" != true ]]; then
  echo "→ Copying pre-commit config..."
  copy_file "$TEMPLATES/pre-commit-config.example.yaml" "$ROOT_DIR/.pre-commit-config.yaml"

  echo "→ Copying pre-commit scripts..."
  copy_tree "$TEMPLATES/scripts/pre-commit" "$ROOT_DIR/scripts/pre-commit"
  chmod +x "$ROOT_DIR"/scripts/pre-commit/*.sh 2>/dev/null || true

  echo "→ Copying devcontainer..."
  copy_tree "$TEMPLATES/devcontainer" "$ROOT_DIR/.devcontainer"
fi

if [[ "$COPY_ONLY" != true ]]; then
  echo "→ Installing pre-commit..."
  if ! command -v pre-commit >/dev/null 2>&1; then
    if command -v pip3 >/dev/null 2>&1; then
      pip3 install --user pre-commit pyyaml
      export PATH="${HOME}/.local/bin:${PATH}"
    else
      echo "Error: pre-commit not found and pip3 unavailable. Install Python 3 + pip first." >&2
      exit 1
    fi
  fi

  if [[ ! -f "$ROOT_DIR/.pre-commit-config.yaml" ]]; then
    echo "Error: .pre-commit-config.yaml not found. Run without --install-only first." >&2
    exit 1
  fi

  pre-commit install
  echo "    pre-commit hooks installed in .git/hooks/pre-commit"
fi

echo ""
echo "  ✓ Dev tooling ready"
echo "  Next: pre-commit run --all-files"
echo "  Devcontainer: reopen folder in container (Cursor / VS Code)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
