#!/usr/bin/env bash
# Block reads and writes to secrets, credentials, and .env files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

read_hook_input

file_path="$(get_file_path)"

if [[ -z "$file_path" ]]; then
  allow_action
  exit 0
fi

if [[ "$(is_sensitive_path "$file_path")" == "yes" ]]; then
  deny_action "Blocked by Harness hook: access to sensitive paths (.env, secrets/, credentials, keys) is not allowed."
  exit 2
fi

allow_action
exit 0
