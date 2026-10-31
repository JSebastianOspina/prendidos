"""Static integrity checks for Harness (no LLM required)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class CheckResult:
    name: str
    passed: bool
    message: str


def check_skills_symlinks(root: Path) -> CheckResult:
    skills_src = root / "ai-specs" / "skills"
    canonical = sorted(p.name for p in skills_src.iterdir() if p.is_dir())
    missing: list[str] = []
    for mirror in (root / ".claude" / "skills", root / ".cursor" / "skills"):
        for name in canonical:
            link = mirror / name
            if not link.is_symlink():
                missing.append(f"{mirror.name}/{name}")
    if missing:
        return CheckResult("skills_symlinks", False, f"Missing or invalid symlinks: {', '.join(missing)}")
    return CheckResult("skills_symlinks", True, f"{len(canonical)} skill symlinks OK")


def check_hooks_symlinks(root: Path) -> CheckResult:
    hooks_json = root / ".cursor" / "hooks.json"
    if not hooks_json.is_symlink():
        return CheckResult("hooks_symlinks", False, ".cursor/hooks.json is not a symlink to ai-specs/hooks/")
    target = hooks_json.readlink()
    if "ai-specs/hooks/cursor.hooks.json" not in str(target):
        return CheckResult("hooks_symlinks", False, f"Unexpected hooks.json target: {target}")
    for mirror in (root / ".cursor" / "hooks", root / ".claude" / "hooks"):
        block_script = mirror / "block-sensitive-paths.sh"
        if not block_script.is_symlink():
            return CheckResult("hooks_symlinks", False, f"Missing hook symlink: {block_script}")
    return CheckResult("hooks_symlinks", True, "Hook symlinks OK")


def check_skill_frontmatter(root: Path) -> CheckResult:
    invalid: list[str] = []
    for skill_md in (root / "ai-specs" / "skills").glob("*/SKILL.md"):
        text = skill_md.read_text(encoding="utf-8")
        if not text.startswith("---\n"):
            invalid.append(skill_md.parent.name)
            continue
        end = text.find("\n---\n", 4)
        if end == -1:
            invalid.append(skill_md.parent.name)
            continue
        frontmatter = text[4:end]
        if "name:" not in frontmatter or "description:" not in frontmatter:
            invalid.append(skill_md.parent.name)
    if invalid:
        return CheckResult("skill_frontmatter", False, f"Invalid SKILL.md frontmatter: {', '.join(invalid)}")
    return CheckResult("skill_frontmatter", True, "All skills have name + description frontmatter")


def check_standards_symlinks(root: Path) -> CheckResult:
    broken: list[str] = []
    for name in ("CLAUDE.md", "AGENTS.md"):
        link = root / name
        if not link.is_symlink():
            broken.append(name)
            continue
        if not link.resolve().exists():
            broken.append(name)
    if broken:
        return CheckResult("standards_symlinks", False, f"Broken standards symlinks: {', '.join(broken)}")
    return CheckResult("standards_symlinks", True, "Standards symlinks resolve")


def run_static_harness_checks(root: Path) -> list[CheckResult]:
    return [
        check_standards_symlinks(root),
        check_skills_symlinks(root),
        check_hooks_symlinks(root),
        check_skill_frontmatter(root),
    ]
