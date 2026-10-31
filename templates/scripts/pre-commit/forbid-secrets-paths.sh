#!/usr/bin/env bash
# Block committing files under secrets/ (aligns with Harness agent hook block-sensitive-paths).

set -euo pipefail

for file in "$@"; do
  normalized="${file//\\//}"
  if [[ "$normalized" == secrets/* ]] || [[ "$normalized" == */secrets/* ]]; then
    echo "ERROR: Cannot commit files under secrets/ — use your approved secret store."
    exit 1
  fi
done

exit 0
