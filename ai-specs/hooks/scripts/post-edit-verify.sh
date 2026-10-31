#!/usr/bin/env bash
# Run lint, typecheck, and related tests after file edits when package.json scripts exist.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

read_hook_input

file_path="$(get_file_path)"

if [[ -z "$file_path" || ! -f package.json ]]; then
  exit 0
fi

project_root="$(pwd)"
if [[ "$file_path" != /* ]]; then
  file_path="$project_root/$file_path"
fi

relative_file="${file_path#"$project_root"/}"
extension="${relative_file##*.}"

messages=()
failures=()

run_check() {
  local label="$1"
  shift
  local output
  if output="$("$@" 2>&1)"; then
    messages+=("$label: passed")
  else
    failures+=("$label failed:\n$output")
  fi
}

should_lint() {
  case "$extension" in
    ts|tsx|js|jsx|mjs|cjs) return 0 ;;
    *) return 1 ;;
  esac
}

should_typecheck() {
  case "$extension" in
    ts|tsx) return 0 ;;
    *) return 1 ;;
  esac
}

if should_lint && has_npm_script "lint"; then
  if has_npm_script "lint:file"; then
    run_check "lint" npm run lint:file -- "$relative_file"
  else
    run_check "lint" npm run lint
  fi
fi

if should_typecheck && has_npm_script "typecheck"; then
  run_check "typecheck" npm run typecheck
fi

if has_npm_script "test"; then
  if command -v npx >/dev/null 2>&1 && npx --no-install jest --help >/dev/null 2>&1; then
    run_check "tests" npm test -- --findRelatedTests "$relative_file" --passWithNoTests
  elif has_npm_script "test:related"; then
    run_check "tests" npm run test:related -- "$relative_file"
  fi
fi

if [[ "${#failures[@]}" -gt 0 ]]; then
  combined="$(printf '%b\n' "${failures[@]}")"
  add_context "Harness post-edit verification failed after editing ${relative_file}:\n${combined}"
  exit 1
fi

if [[ "${#messages[@]}" -gt 0 ]]; then
  add_context "Harness post-edit verification for ${relative_file}: $(IFS='; '; echo "${messages[*]}")"
fi

exit 0
