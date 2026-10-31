#!/usr/bin/env bash
# harness init script
# Bootstraps a project after cloning harness as the brain repo.
#
# Usage:
#   bash scripts/init.sh --project my-project --type multi-repo
#   bash scripts/init.sh --project my-project --type multi-repo --repos backend,frontend
#   bash scripts/init.sh --project my-project --type monorepo
#   bash scripts/init.sh --project my-project --type monorepo --skip-hooks   # Stage 2 (hooks in Stage 3)

set -euo pipefail

PROJECT=""
TYPE=""
SKIP_HOOKS=false
REPOS_ARG=""

# ── Parse arguments ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT="$2"; shift 2 ;;
    --type)    TYPE="$2";    shift 2 ;;
    --repos)   REPOS_ARG="$2"; shift 2 ;;
    --skip-hooks) SKIP_HOOKS=true; shift ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [[ -z "$PROJECT" || -z "$TYPE" ]]; then
  echo "Usage: bash scripts/init.sh --project <name> --type <multi-repo|monorepo> [--repos name1,name2] [--skip-hooks]"
  exit 1
fi

if [[ "$TYPE" != "multi-repo" && "$TYPE" != "monorepo" ]]; then
  echo "Error: --type must be multi-repo or monorepo (got: $TYPE)"
  exit 1
fi

if [[ -n "$REPOS_ARG" && "$TYPE" != "multi-repo" ]]; then
  echo "Error: --repos is only valid with --type multi-repo"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  harness init"
echo "  Project : $PROJECT"
echo "  Type    : $TYPE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Write sibling-repos.env — source of truth for which siblings bootstrap clones.
write_sibling_repos_env() {
  local repos_csv="$1"
  local env_file="$ROOT_DIR/sibling-repos.env"
  local -a repo_names=()
  local name
  local var_name

  if [[ -n "$repos_csv" ]]; then
    IFS=',' read -r -a raw_names <<< "$repos_csv"
    for name in "${raw_names[@]}"; do
      name="$(printf '%s' "$name" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
      [[ -z "$name" ]] && continue
      repo_names+=("$name")
    done
  fi

  {
    cat << 'EOF'
# Sibling repos — source of truth for scripts/bootstrap (and pull-all / status-all / branch-all).
#
# Every KEY ending in _REPO_URL is a sibling to clone next to this brain repo.
# Directory name is derived automatically:
#   MY_PROJECT_BACKEND_REPO_URL → my-project-backend
#
# scripts/lib/common.sh loads this file automatically — no export / source needed.
# Do NOT list repos in common.sh; add or remove entries here only.
#
# PLACEHOLDERS: lines below use YOUR_BITBUCKET_WORKSPACE — replace with your real
# Bitbucket Cloud workspace slug before ./scripts/bootstrap will succeed.
#
# Clone protocol: Bitbucket SSH ONLY (git@bitbucket.org:<workspace>/<repo>.git).
# HTTPS clone URLs are NEVER allowed.
#
# Do NOT put machine-specific paths here (use HARNESS_WORKSPACE_DIR locally).

EOF
    if [[ "${#repo_names[@]}" -gt 0 ]]; then
      for name in "${repo_names[@]}"; do
        var_name="$(echo "${name}" | tr '[:lower:]-' '[:upper:]_')_REPO_URL"
        printf '%s="git@bitbucket.org:YOUR_BITBUCKET_WORKSPACE/%s.git"\n' "${var_name}" "${name}"
      done
    else
      cat << 'EOF'
# --- PLACEHOLDER ENTRIES (edit or replace before bootstrap) ---
PORTAL_MF_REPO_URL="git@bitbucket.org:YOUR_BITBUCKET_WORKSPACE/portal-mf.git"
MY_PROJECT_BACKEND_REPO_URL="git@bitbucket.org:YOUR_BITBUCKET_WORKSPACE/my-project-backend.git"
MY_PROJECT_FRONTEND_REPO_URL="git@bitbucket.org:YOUR_BITBUCKET_WORKSPACE/my-project-frontend.git"
EOF
    fi
  } > "$env_file"

  if [[ "${#repo_names[@]}" -gt 0 ]]; then
    echo "  sibling-repos.env → ${repo_names[*]}"
  else
    echo "  sibling-repos.env left with placeholder entries (edit keys/URLs, then ./scripts/bootstrap)"
  fi
  echo "  Wrote: sibling-repos.env (commit after replacing YOUR_BITBUCKET_WORKSPACE)"
}

print_bootstrap_hints() {
  local -a repo_names=("$@")
  local name
  local var_name

  echo "  Sibling workspace (source of truth: sibling-repos.env):"
  echo "    # edit sibling-repos.env — replace YOUR_BITBUCKET_WORKSPACE with real SSH URLs, then commit"
  echo "    # SSH only: git@bitbucket.org:<workspace>/<repo>.git (HTTPS never allowed)"
  echo "    ./scripts/bootstrap"
  echo "    ./scripts/pull-all | ./scripts/status-all | ./scripts/branch-all <branch> [--create]"
  if [[ "${#repo_names[@]}" -gt 0 ]]; then
    echo "    Keys written to sibling-repos.env:"
    for name in "${repo_names[@]}"; do
      var_name="$(echo "${name}" | tr '[:lower:]-' '[:upper:]_')_REPO_URL"
      echo "      ${var_name}"
    done
  fi
  echo "    Optional local override: export HARNESS_WORKSPACE_DIR=\"\$(cd .. && pwd)\""
}

# ── 1. Protect project remote ─────────────────────────────────────────
# Prefer: copy/rsync Harness WITHOUT .git into an already-initialized
# brain repo. Only detach origin when it clearly points at Harness.
cd "$ROOT_DIR"
CURRENT_ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
echo "→ Checking git remote..."
if [[ -z "$CURRENT_ORIGIN" ]]; then
  echo "  No origin set. Add your brain-repo remote when ready:"
  echo "    git remote add origin <your-brain-repo-remote>"
elif echo "$CURRENT_ORIGIN" | grep -qiE 'harness'; then
  echo "  ⚠ origin points to a harness remote ($CURRENT_ORIGIN)."
  git remote remove origin 2>/dev/null || true
  echo "  Removed it. Set your project remote:"
  echo "    git remote add origin <your-brain-repo-remote>"
else
  echo "  Keeping origin: $CURRENT_ORIGIN"
fi

# ── 2. Replace placeholder in canonical standards (not via CLAUDE.md symlink) ─
# CLAUDE.md / AGENTS.md / … are symlinks to docs/base-standards.md.
# macOS sed -i refuses in-place edits on symlinks; always edit the target file.
echo "→ Updating docs/base-standards.md with project name..."
STANDARDS="$ROOT_DIR/docs/base-standards.md"
if [[ -f "$STANDARDS" ]] && grep -q '\[project-name\]' "$STANDARDS"; then
  sed "s/\[project-name\]/$PROJECT/g" "$STANDARDS" > "$STANDARDS.tmp"
  mv "$STANDARDS.tmp" "$STANDARDS"
  echo "  Replaced [project-name] → $PROJECT"
else
  echo "  No [project-name] placeholder found (skip)."
fi

# ── 2b. Rename package.json (and lockfile) from "harness" to the project name ─
# npm package names must be lowercase; normalize --project for a valid name.
PACKAGE_NAME="$(printf '%s' "$PROJECT" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9._-]/-/g; s/^-+//; s/-+$//; s/-+/-/g')"
if [[ -z "$PACKAGE_NAME" ]]; then
  echo "Error: --project produced an empty npm package name after normalization."
  exit 1
fi

echo "→ Updating package.json name → $PACKAGE_NAME..."
if [[ -f "$ROOT_DIR/package.json" ]]; then
  if command -v node >/dev/null 2>&1; then
    # Use env vars (portable across node -e argv layouts).
    HARNESS_INIT_ROOT="$ROOT_DIR" HARNESS_INIT_PACKAGE_NAME="$PACKAGE_NAME" node -e '
const fs = require("fs");
const path = require("path");
const root = process.env.HARNESS_INIT_ROOT;
const packageName = process.env.HARNESS_INIT_PACKAGE_NAME;
if (!root || !packageName) {
  console.error("Missing HARNESS_INIT_ROOT or HARNESS_INIT_PACKAGE_NAME");
  process.exit(1);
}
function updateJsonName(filePath, updater) {
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  updater(data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}
updateJsonName(path.join(root, "package.json"), (pkg) => { pkg.name = packageName; });
updateJsonName(path.join(root, "package-lock.json"), (lock) => {
  lock.name = packageName;
  if (lock.packages && lock.packages[""] && typeof lock.packages[""] === "object") {
    lock.packages[""].name = packageName;
  }
});
'
    echo "  package.json name → $PACKAGE_NAME"
    if [[ -f "$ROOT_DIR/package-lock.json" ]]; then
      echo "  package-lock.json name → $PACKAGE_NAME"
    fi
  else
    echo "  Warning: node not found. Set \"name\": \"$PACKAGE_NAME\" in package.json manually."
  fi
else
  echo "  No package.json found (skip)."
fi

# ── 3. Create docs/adr directory ────────────────────────────────────────────
echo "→ Creating docs/adr directory..."
mkdir -p "$ROOT_DIR/docs/adr"
if [[ ! -f "$ROOT_DIR/docs/adr/README.md" ]]; then
  cat > "$ROOT_DIR/docs/adr/README.md" << EOF
# Architecture Decision Records

| ADR | Title | Date | Status |
|-----|-------|------|--------|
| — | No ADRs yet. Run \`/create-adr\` to document your first architectural decision. | — | — |
EOF
fi

# ── 4. Multi-repo: create thin CLAUDE.md template for sub-repos ─────────────
SIBLING_REPOS=()
if [[ "$TYPE" == "multi-repo" ]]; then
  echo "→ Creating sub-repo CLAUDE.md template..."
  TEMPLATE_FILE="$ROOT_DIR/templates/sub-repo-claude.md"
  cat > "$TEMPLATE_FILE" << EOF
# AI Context

This project is part of the $PROJECT ecosystem.
All standards, agents, and skills live in the brain repo.

Standards:  ../$PROJECT-agent-docs/docs/
Agents:     ../$PROJECT-agent-docs/ai-specs/agents/
Skills:     ../$PROJECT-agent-docs/ai-specs/skills/
CLAUDE:     ../$PROJECT-agent-docs/CLAUDE.md
EOF
  echo "  Created: templates/sub-repo-claude.md"
  echo "  Copy this to each sub-repo's CLAUDE.md and update the paths."

  # ── 4a. Sibling repos → sibling-repos.env (source of truth for bootstrap) ─
  echo "→ Configuring sibling repositories (sibling-repos.env)..."
  if [[ -z "$REPOS_ARG" ]]; then
    if [[ -t 0 ]]; then
      echo -n "  Sibling repo directory names (comma-separated, empty to skip): "
      read -r REPOS_ARG || true
    else
      echo "  No --repos and not a TTY — writing placeholder-only sibling-repos.env."
      echo "  Fill later: edit sibling-repos.env (SSH URLs only), or re-run with --repos."
    fi
  fi

  write_sibling_repos_env "$REPOS_ARG"
  if [[ -n "$REPOS_ARG" ]]; then
    IFS=',' read -r -a raw_sibling <<< "$REPOS_ARG"
    SIBLING_REPOS=()
    for name in "${raw_sibling[@]}"; do
      name="$(printf '%s' "$name" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
      [[ -n "$name" ]] && SIBLING_REPOS+=("$name")
    done
  fi

  # ── 4b. Agent-docs CI + Husky (markdown formatting on human commits) ─────
  AGENT_DOCS_PIPELINE="$ROOT_DIR/templates/bitbucket-pipelines.agent-docs.yml"
  DEST_PIPELINE="$ROOT_DIR/bitbucket-pipelines.yml"
  if [[ -f "$AGENT_DOCS_PIPELINE" ]]; then
    if [[ -f "$DEST_PIPELINE" ]]; then
      echo "→ bitbucket-pipelines.yml already present (agent-docs markdown gate)."
    else
      echo "→ Installing agent-docs Bitbucket pipeline..."
      cp "$AGENT_DOCS_PIPELINE" "$DEST_PIPELINE"
      echo "  Created: bitbucket-pipelines.yml (Prettier markdown check)"
    fi
  else
    echo "  Warning: templates/bitbucket-pipelines.agent-docs.yml not found (skip pipeline)."
  fi

  if [[ -f "$ROOT_DIR/package.json" ]] && grep -q '"husky"' "$ROOT_DIR/package.json"; then
    echo "→ Installing npm deps (husky + prettier + lint-staged)..."
    if command -v npm >/dev/null 2>&1; then
      (cd "$ROOT_DIR" && npm install)
      echo "  Husky ready via package.json prepare → husky"
      echo "  Pre-commit runs: npx lint-staged (formats *.md, *.json, *.yml)"
    else
      echo "  Warning: npm not found. Run npm install manually to enable husky."
    fi
  else
    echo "  Warning: package.json with husky not found. Re-copy Harness root tooling, then npm install."
  fi
fi

# ── 5. Sync skills symlinks ──────────────────────────────────────────────────
echo "→ Syncing skills into .claude/skills/ and .cursor/skills/..."
bash "$SCRIPT_DIR/sync-skills.sh"

# ── 6. Sync agent hooks (Stage 3 — optional at init) ───────────────────────
if [[ "$SKIP_HOOKS" == true ]]; then
  echo "→ Skipping hooks (Stage 2). Run bash scripts/sync-hooks.sh when ready for Stage 3."
else
  echo "→ Syncing hooks into .cursor/hooks/ and .claude/hooks/..."
  bash "$SCRIPT_DIR/sync-hooks.sh"
fi

# ── 7. Summary ───────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ harness initialized"
echo ""
echo "  Next steps (see README.md adoption stages):"
echo "  Stage 2 — Customize docs/ and wire openspec/config.yaml"
echo "  Stage 3 — bash scripts/sync-hooks.sh (if skipped)"
echo "            bash scripts/setup-dev-tooling.sh + templates/bitbucket-pipelines.yml (app repos)"
if [[ "$TYPE" == "multi-repo" ]]; then
  echo "  Multi-repo agent-docs: husky + bitbucket-pipelines.yml (markdown gate) are set up"
  echo "  Multi-repo: copy templates/sub-repo-claude.md to each sub-repo's CLAUDE.md"
  print_bootstrap_hints "${SIBLING_REPOS[@]+"${SIBLING_REPOS[@]}"}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
