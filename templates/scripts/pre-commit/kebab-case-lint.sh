#!/usr/bin/env bash
# Kebab-case file name lint for TypeScript sources (matches templates/bitbucket-pipelines.yml).

set -euo pipefail

ROOT="${1:-.}"
VIOLATIONS="$(
  find "$ROOT" \( -name "*.ts" -o -name "*.tsx" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/.venv/*" \
    ! -path "*/ai-specs/evals/.venv/*" \
    2>/dev/null | grep -E '/[A-Z][^/]*\.(ts|tsx)$' || true
)"

if [[ -n "$VIOLATIONS" ]]; then
  echo "ERROR: Non-kebab-case TypeScript file names found:"
  echo "$VIOLATIONS"
  exit 1
fi

echo "All TypeScript file names are kebab-case ✓"
exit 0
