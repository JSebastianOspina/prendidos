#!/usr/bin/env bash
# Shared helpers for multi-repo workspace scripts (bootstrap, pull-all, status-all, branch-all).
#
# Source of truth for sibling repos: sibling-repos.env at the brain repo root (committed).
# Each KEY ending in _REPO_URL becomes a directory name in REPOS, e.g.:
#   PORTAL_MF_REPO_URL → portal-mf
# Optional shell exports still override URL values from the file.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load committed sibling clone URLs (and optional HARNESS_WORKSPACE_DIR if set there).
# Shell exports already present in the environment win over file values.
# Also builds REPOS from *_REPO_URL keys in the file (directory list for bootstrap, etc.).
load_sibling_repos_env() {
  local env_file="${REPO_ROOT}/sibling-repos.env"
  local line key value current name

  REPOS=()

  [[ -f "${env_file}" ]] || return 0

  while IFS= read -r line || [[ -n "${line}" ]]; do
    # Skip blanks and comments
    [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]] && continue
    # Only KEY=VALUE assignments
    [[ "${line}" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]] || continue

    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    # Strip surrounding single or double quotes
    if [[ "${value}" =~ ^\"(.*)\"$ ]] || [[ "${value}" =~ ^\'(.*)\'$ ]]; then
      value="${BASH_REMATCH[1]}"
    fi

    # Preserve an already-exported value (local override)
    current="$(eval "printf '%s' \"\${${key}-}\"")"
    if [[ -z "${current}" ]]; then
      export "${key}=${value}"
    fi

    # Directory list: FOO_BAR_REPO_URL → foo-bar
    if [[ "${key}" == *_REPO_URL ]]; then
      name="${key%_REPO_URL}"
      name="$(printf '%s' "${name}" | tr '[:upper:]_' '[:lower:]-')"
      REPOS+=("${name}")
    fi
  done < "${env_file}"
}

load_sibling_repos_env

WORKSPACE_DIR="${HARNESS_WORKSPACE_DIR:-$(cd "${REPO_ROOT}/.." && pwd)}"

log() {
  printf '%s\n' "$*"
}

warn() {
  printf 'WARN: %s\n' "$*" >&2
}

err() {
  printf 'ERROR: %s\n' "$*" >&2
}

repo_path() {
  local repo_name="$1"
  printf '%s/%s\n' "${WORKSPACE_DIR}" "${repo_name}"
}

# Derive URL from sibling-repos.env / env: payments-api → PAYMENTS_API_REPO_URL
repo_url_from_env() {
  local repo_name="$1"
  local var_name

  var_name="$(echo "${repo_name}" | tr '[:lower:]-' '[:upper:]_')_REPO_URL"
  echo "${!var_name:-}"
}

# Clone URLs must be Bitbucket SSH only — never HTTPS.
is_ssh_clone_url() {
  local url="$1"
  [[ "${url}" =~ ^git@bitbucket\.org:[^/]+/.+\.git$ ]]
}

is_git_repo() {
  local path="$1"
  [[ -d "${path}/.git" ]]
}
