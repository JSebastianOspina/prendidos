#!/usr/bin/env bash
# Shared helpers for Harness agent hooks (Cursor + Claude Code).

set -euo pipefail

read_hook_input() {
  HOOK_INPUT="$(cat)"
  export HOOK_INPUT
}

# Extract tool name from Cursor or Claude hook payloads.
get_tool_name() {
  python3 -c '
import json, os, sys
data = json.loads(os.environ["HOOK_INPUT"])
print(data.get("tool_name") or data.get("tool") or "")
'
}

# Extract file path from read/write/edit tool payloads.
get_file_path() {
  python3 -c '
import json, os, sys
data = json.loads(os.environ["HOOK_INPUT"])
tool_input = data.get("tool_input") or {}
for key in ("file_path", "path", "target_file"):
    value = tool_input.get(key) or data.get(key)
    if value:
        print(value)
        break
'
}

# Extract shell command from bash/shell tool payloads.
get_shell_command() {
  python3 -c '
import json, os, sys
data = json.loads(os.environ["HOOK_INPUT"])
tool_input = data.get("tool_input") or {}
print(tool_input.get("command") or data.get("command") or "")
'
}

# Detect agent runtime from payload shape.
detect_agent_runtime() {
  python3 -c '
import json, os
data = json.loads(os.environ["HOOK_INPUT"])
print("claude" if "tool_name" in data else "cursor")
'
}

deny_action() {
  local reason="$1"
  local runtime
  runtime="$(detect_agent_runtime)"

  if [[ "$runtime" == "claude" ]]; then
    DENY_REASON="$reason" python3 -c '
import json, os, sys
reason = os.environ["DENY_REASON"]
print(json.dumps({
    "hookSpecificOutput": {
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }
}))
'
  else
    DENY_REASON="$reason" python3 -c '
import json, os, sys
reason = os.environ["DENY_REASON"]
print(json.dumps({
    "permission": "deny",
    "user_message": reason,
    "agent_message": reason,
}))
'
  fi
}

allow_action() {
  local runtime
  runtime="$(detect_agent_runtime)"

  if [[ "$runtime" == "claude" ]]; then
    echo '{"hookSpecificOutput":{"permissionDecision":"allow"}}'
  else
    echo '{"permission":"allow"}'
  fi
}

add_context() {
  local message="$1"
  CTX_MESSAGE="$message" python3 -c '
import json, os, sys
message = os.environ["CTX_MESSAGE"]
print(json.dumps({"additional_context": message}))
'
}

is_sensitive_path() {
  local path="$1"
  CHECK_PATH="$path" python3 -c '
import os, re, sys
path = os.environ["CHECK_PATH"]
normalized = path.replace("\\", "/")
basename = os.path.basename(normalized)
parent_parts = normalized.lower().split("/")

patterns = [
    r"^\.env$",
    r"^\.env\.(?!example$)[^.].*",
    r".*\.pem$",
    r".*\.key$",
    r"^credentials\.json$",
    r"^secrets\.json$",
]

if "secrets" in parent_parts:
    print("yes")
    sys.exit(0)

for pattern in patterns:
    if re.search(pattern, basename, re.IGNORECASE):
        print("yes")
        sys.exit(0)

print("no")
'
}

is_destructive_command() {
  local command="$1"
  CHECK_COMMAND="$command" python3 -c '
import os, re, sys
command = os.environ["CHECK_COMMAND"].strip()
if not command:
    print("no")
    sys.exit(0)

patterns = [
    r"\brm\s+(-[^\s]*f[^\s]*\s+|-[^\s]*r[^\s]*\s+).*",
    r"\brm\s+-rf\b",
    r"\brm\s+-fr\b",
    r"\bgit\s+reset\s+--hard\b",
    r"\bgit\s+clean\s+-[a-zA-Z]*f",
    r"\bgit\s+push\b[^\n]*--force",
    r"\bgit\s+push\b[^\n]*-f\b",
    # Database / schema destruction (never run against real or shared data)
    r"\bDROP\s+DATABASE\b",
    r"\bDROP\s+TABLE\b",
    r"\bTRUNCATE\s+TABLE\b",
    r"\bTRUNCATE\b",
    r"\bmigrate:fresh\b",
    r"\bmigrate:refresh\b",
    r"\bdb:wipe\b",
    r"\bdb:seed\b",
    r"\bprisma\s+migrate\s+reset\b",
    r"\bprisma\s+db\s+push\b.*--force-reset",
    r"\bprisma\s+db\s+seed\b",
    r"\bnpm\s+run\s+db:wipe\b",
    r"\bnpm\s+run\s+db:seed\b",
    r"\bnpx\s+prisma\s+migrate\s+reset\b",
    r"\bnpx\s+prisma\s+db\s+seed\b",
    r"\bdd\s+if=",
    r"\bmkfs\.",
    r"\bchmod\s+-R\s+777\b",
    r">\s*/dev/sd[a-z]",
]

for pattern in patterns:
    if re.search(pattern, command, re.IGNORECASE):
        print("yes")
        sys.exit(0)

print("no")
'
}

has_npm_script() {
  local script_name="$1"
  [[ -f package.json ]] || return 1
  SCRIPT_NAME="$script_name" python3 -c '
import json, os, sys
script = os.environ["SCRIPT_NAME"]
with open("package.json", encoding="utf-8") as handle:
    data = json.load(handle)
scripts = data.get("scripts") or {}
sys.exit(0 if script in scripts else 1)
'
}
