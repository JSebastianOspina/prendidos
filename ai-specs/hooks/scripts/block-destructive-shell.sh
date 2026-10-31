#!/usr/bin/env bash
# Block destructive shell commands before execution.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

read_hook_input

command="$(get_shell_command)"

if [[ -z "$command" ]]; then
  allow_action
  exit 0
fi

if [[ "$(is_destructive_command "$command")" == "yes" ]]; then
  deny_action "Blocked by Harness hook: agent cannot run this destructive/privileged command (rm -rf, force push, DROP/TRUNCATE, migrate reset/fresh, db:wipe/seed, prisma db seed, etc.). If the step is still required, instruct the human to run the exact command in their own terminal, explain consequences, wait for confirmation, then continue — do not skip and do not bypass with alternate SQL."
  exit 2
fi

allow_action
exit 0
