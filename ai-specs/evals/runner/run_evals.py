#!/usr/bin/env python3
"""Harness eval runner — static integrity + optional agent golden tasks."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

RUNNER_DIR = Path(__file__).resolve().parent
EVALS_DIR = RUNNER_DIR.parent
HARNESS_ROOT = EVALS_DIR.parents[1]
GOLDEN_TASKS_DIR = EVALS_DIR / "golden-tasks"
FIXTURES_DIR = EVALS_DIR / "fixtures"

sys.path.insert(0, str(RUNNER_DIR))
from assertions import run_assertion  # noqa: E402
from harness_static import run_static_harness_checks  # noqa: E402


@dataclass
class TaskResult:
    task_id: str
    passed: bool
    details: list[str]


def load_golden_tasks() -> list[dict[str, Any]]:
    tasks: list[dict[str, Any]] = []
    for path in sorted(GOLDEN_TASKS_DIR.glob("*.yaml")):
        tasks.append(yaml.safe_load(path.read_text(encoding="utf-8")))
    return tasks


def validate_golden_tasks(tasks: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    required = ("id", "name", "fixture", "workspace", "prompt", "assertions")
    for task in tasks:
        for field in required:
            if field not in task:
                errors.append(f"{task.get('id', '?')}: missing field '{field}'")
        fixture = FIXTURES_DIR / task.get("fixture", "")
        if not fixture.exists():
            errors.append(f"{task.get('id')}: fixture not found: {fixture}")
        for assertion in task.get("assertions", []):
            if "type" not in assertion:
                errors.append(f"{task.get('id')}: assertion missing type")
    return errors


def snapshot_workspace(workspace: Path) -> tuple[dict[str, Any] | None, dict[str, str]]:
    package_json = workspace / "package.json"
    baseline_package = None
    if package_json.exists():
        baseline_package = json.loads(package_json.read_text(encoding="utf-8"))
    baseline_files: dict[str, str] = {}
    for path in workspace.rglob("*"):
        if path.is_file() and path.suffix in {".ts", ".tsx", ".prisma", ".sql"}:
            rel = str(path.relative_to(workspace))
            baseline_files[rel] = path.read_text(encoding="utf-8")
    return baseline_package, baseline_files


def copy_fixture(task: dict[str, Any], dest: Path) -> Path:
    fixture_root = FIXTURES_DIR / task["fixture"]
    shutil.copytree(fixture_root, dest, dirs_exist_ok=True)
    workspace = dest / task["workspace"]
    if not workspace.exists():
        raise FileNotFoundError(f"Workspace not found in fixture: {workspace}")
    return workspace


def run_agent_task(task: dict[str, Any], model: str) -> TaskResult:
    api_key = os.environ.get("CURSOR_API_KEY")
    if not api_key:
        return TaskResult(task_id=task["id"], passed=False, details=["CURSOR_API_KEY is not set"])

    try:
        from cursor_sdk import Agent, AgentOptions, LocalAgentOptions
    except ImportError:
        return TaskResult(
            task_id=task["id"],
            passed=False,
            details=["cursor-sdk not installed — pip install -r ai-specs/evals/requirements-agent.txt"],
        )

    with tempfile.TemporaryDirectory(prefix="harness-eval-") as tmp:
        workspace_root = Path(tmp)
        workspace = copy_fixture(task, workspace_root)
        baseline_package, baseline_files = snapshot_workspace(workspace)

        options = AgentOptions(
            api_key=api_key,
            model=model,
            local=LocalAgentOptions(cwd=str(workspace)),
        )
        result = Agent.prompt(task["prompt"], options)

        details = [f"Agent status: {result.status}"]
        if result.result:
            details.append(f"Agent summary: {str(result.result)[:500]}")

        assertion_results: list[str] = []
        all_passed = True
        for assertion in task["assertions"]:
            assertion_result = run_assertion(assertion, workspace, baseline_package, baseline_files)
            status = "PASS" if assertion_result.passed else "FAIL"
            assertion_results.append(f"[{status}] {assertion_result.name}: {assertion_result.message}")
            if not assertion_result.passed:
                all_passed = False

        return TaskResult(task_id=task["id"], passed=all_passed, details=details + assertion_results)


def git_changed_paths(base_ref: str = "HEAD~1") -> list[str]:
    proc = subprocess.run(
        ["git", "diff", "--name-only", base_ref, "HEAD"],
        cwd=HARNESS_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return []
    return [line.strip() for line in proc.stdout.splitlines() if line.strip()]


def should_run_agent_tier(changed_only: bool) -> bool:
    if not changed_only:
        return True
    triggers = (
        "ai-specs/skills/",
        "ai-specs/hooks/",
        "docs/",
        "ai-specs/agents/",
        ".claude/settings.json",
    )
    for path in git_changed_paths():
        if any(path.startswith(prefix) for prefix in triggers):
            return True
    return False


def print_results(title: str, results: list[tuple[str, bool, str]]) -> int:
    print(f"\n{'=' * 60}")
    print(title)
    print("=" * 60)
    failures = 0
    for name, passed, message in results:
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {name}: {message}")
        if not passed:
            failures += 1
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Harness evals")
    parser.add_argument("--static", action="store_true", help="Run static harness integrity checks (default)")
    parser.add_argument("--validate", action="store_true", help="Validate golden-task YAML definitions")
    parser.add_argument("--agent", action="store_true", help="Run agent golden tasks via Cursor SDK")
    parser.add_argument("--changed", action="store_true", help="With --agent, only run if skills/standards/model files changed")
    parser.add_argument("--task", help="Run a single golden task by id")
    parser.add_argument("--model", default=os.environ.get("HARNESS_EVAL_MODEL", "composer-2.5"))
    args = parser.parse_args()

    if not any((args.static, args.validate, args.agent)):
        args.static = True
        args.validate = True

    exit_code = 0

    if args.static:
        checks = run_static_harness_checks(HARNESS_ROOT)
        rows = [(c.name, c.passed, c.message) for c in checks]
        exit_code |= print_results("Static harness checks", rows)

    tasks = load_golden_tasks()
    if args.validate:
        errors = validate_golden_tasks(tasks)
        if errors:
            for error in errors:
                print(f"[FAIL] golden-task validation: {error}")
            exit_code |= 1
        else:
            print(f"[PASS] golden-task validation: {len(tasks)} task definitions OK")

    if args.agent:
        if args.changed and not should_run_agent_tier(changed_only=True):
            print("\n[SKIP] Agent tier: no changes in skills, standards, hooks, or model config")
        else:
            selected = tasks
            if args.task:
                selected = [t for t in tasks if t["id"] == args.task]
                if not selected:
                    print(f"[FAIL] Unknown task id: {args.task}")
                    return 1
            task_rows: list[tuple[str, bool, str]] = []
            for task in selected:
                result = run_agent_task(task, args.model)
                message = "\n    ".join(result.details)
                task_rows.append((result.task_id, result.passed, message))
            exit_code |= print_results(f"Agent golden tasks (model={args.model})", task_rows)

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
