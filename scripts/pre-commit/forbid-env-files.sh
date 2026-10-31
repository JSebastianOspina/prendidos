#!/usr/bin/env bash
# Block committing .env files (allow .env.example templates).

set -euo pipefail

for file in "$@"; do
  base="$(basename "$file")"
  if [[ "$base" == ".env" ]]; then
    echo "ERROR: Cannot commit .env — use templates/*.env.example and keep secrets out of git."
    exit 1
  fi
  if [[ "$base" == .env.* ]] && [[ "$base" != ".env.example" ]]; then
    echo "ERROR: Cannot commit ${base} — only .env.example is allowed in version control."
    exit 1
  fi
done

exit 0
