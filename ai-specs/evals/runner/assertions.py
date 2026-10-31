"""Assertion helpers for Harness golden-task evals."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class AssertionResult:
    name: str
    passed: bool
    message: str


def _glob_paths(workspace: Path, pattern: str) -> list[Path]:
    return sorted(workspace.glob(pattern))


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _load_package_json(path: Path) -> dict[str, Any]:
    return json.loads(_read_text(path))


def _dependency_keys(package: dict[str, Any]) -> set[str]:
    keys: set[str] = set()
    for section in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        keys.update((package.get(section) or {}).keys())
    return keys


def assert_files_exist(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    missing = [path for path in config["paths"] if not (workspace / path).exists()]
    if missing:
        return AssertionResult("files_exist", False, f"Missing files: {', '.join(missing)}")
    return AssertionResult("files_exist", True, f"All {len(config['paths'])} files exist")


def assert_file_matches(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    target = workspace / config["path"]
    if not target.exists():
        return AssertionResult("file_matches", False, f"File not found: {config['path']}")
    content = _read_text(target)
    pattern = config["pattern"]
    if re.search(pattern, content, re.MULTILINE):
        return AssertionResult("file_matches", True, f"{config['path']} matches /{pattern}/")
    return AssertionResult("file_matches", False, f"{config['path']} does not match /{pattern}/")


def assert_glob_exists(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    matches = _glob_paths(workspace, config["pattern"])
    if matches:
        return AssertionResult("glob_exists", True, f"Found {len(matches)} match(es) for {config['pattern']}")
    return AssertionResult("glob_exists", False, f"No matches for {config['pattern']}")


def assert_kebab_case_paths(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    violations: list[str] = []
    for path in _glob_paths(workspace, config["glob"]):
        name = path.stem
        if name != name.lower():
            violations.append(str(path.relative_to(workspace)))
        if "_" in path.name:
            violations.append(str(path.relative_to(workspace)))
    if violations:
        return AssertionResult("kebab_case_paths", False, f"Non-kebab-case paths: {', '.join(violations)}")
    return AssertionResult("kebab_case_paths", True, "All matched paths use kebab-case")


def assert_no_forbidden_imports(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    forbidden = config["forbidden"]
    hits: list[str] = []
    glob_pattern = config.get("glob", "**/*")
    for path in _glob_paths(workspace, glob_pattern):
        if not path.is_file():
            continue
        content = _read_text(path).lower()
        for token in forbidden:
            if token.lower() in content:
                hits.append(f"{path.relative_to(workspace)} ({token})")
    if hits:
        return AssertionResult("no_forbidden_imports", False, f"Forbidden imports: {', '.join(hits)}")
    return AssertionResult("no_forbidden_imports", True, "No forbidden imports found")


def assert_no_forbidden_content(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    forbidden = config["forbidden"]
    hits: list[str] = []
    for path in _glob_paths(workspace, config["glob"]):
        if not path.is_file():
            continue
        upper = _read_text(path).upper()
        for token in forbidden:
            if token.upper() in upper:
                hits.append(f"{path.relative_to(workspace)} ({token})")
    if hits:
        return AssertionResult("no_forbidden_content", False, f"Forbidden content: {', '.join(hits)}")
    return AssertionResult("no_forbidden_content", True, "No forbidden content found")


def assert_no_new_dependencies(
    workspace: Path,
    config: dict[str, Any],
    baseline_package: dict[str, Any] | None,
) -> AssertionResult:
    package_path = workspace / config["package_json"]
    if not package_path.exists():
        return AssertionResult("no_new_dependencies", False, f"Missing {config['package_json']}")
    if baseline_package is None:
        return AssertionResult("no_new_dependencies", True, "Baseline not provided — skipped diff")
    current = _load_package_json(package_path)
    added = sorted(_dependency_keys(current) - _dependency_keys(baseline_package))
    if added:
        return AssertionResult("no_new_dependencies", False, f"New dependencies added: {', '.join(added)}")
    return AssertionResult("no_new_dependencies", True, "No new dependencies added")


def assert_file_updated(
    workspace: Path,
    config: dict[str, Any],
    baseline_files: dict[str, str] | None,
) -> AssertionResult:
    target = workspace / config["path"]
    if not target.exists():
        return AssertionResult("file_updated", False, f"File not found: {config['path']}")
    if baseline_files is None:
        return AssertionResult("file_updated", True, "Baseline not provided — skipped diff")
    before = baseline_files.get(config["path"])
    after = _read_text(target)
    if before == after:
        return AssertionResult("file_updated", False, f"{config['path']} was not modified")
    return AssertionResult("file_updated", True, f"{config['path']} was updated")


def assert_standards_files_present(workspace: Path, config: dict[str, Any]) -> AssertionResult:
    missing = [path for path in config["paths"] if not (workspace / path).exists()]
    if missing:
        return AssertionResult("standards_files_present", False, f"Missing standards: {', '.join(missing)}")
    return AssertionResult("standards_files_present", True, "Standards files present in fixture")


ASSERTION_HANDLERS = {
    "files_exist": assert_files_exist,
    "file_matches": assert_file_matches,
    "glob_exists": assert_glob_exists,
    "kebab_case_paths": assert_kebab_case_paths,
    "no_forbidden_imports": assert_no_forbidden_imports,
    "no_forbidden_content": assert_no_forbidden_content,
    "no_new_dependencies": assert_no_new_dependencies,
    "file_updated": assert_file_updated,
    "standards_files_present": assert_standards_files_present,
}


def run_assertion(
    assertion: dict[str, Any],
    workspace: Path,
    baseline_package: dict[str, Any] | None = None,
    baseline_files: dict[str, str] | None = None,
) -> AssertionResult:
    assertion_type = assertion["type"]
    handler = ASSERTION_HANDLERS.get(assertion_type)
    if handler is None:
        return AssertionResult(assertion_type, False, f"Unknown assertion type: {assertion_type}")

    if assertion_type == "no_new_dependencies":
        return handler(workspace, assertion, baseline_package)
    if assertion_type == "file_updated":
        return handler(workspace, assertion, baseline_files)
    return handler(workspace, assertion)
