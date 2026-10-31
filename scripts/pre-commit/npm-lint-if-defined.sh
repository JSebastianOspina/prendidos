#!/usr/bin/env bash
# Run npm lint when the repo defines it (optional app-repo hook).

set -euo pipefail

if [[ ! -f package.json ]]; then
  exit 0
fi

if ! node -e "const s=require('./package.json').scripts||{}; process.exit(s.lint?0:1)" 2>/dev/null; then
  exit 0
fi

npm run lint
