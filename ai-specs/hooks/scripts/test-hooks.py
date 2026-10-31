#!/usr/bin/env python3
"""Smoke tests for Harness agent hooks."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HOOKS = ROOT / ".cursor" / "hooks"


def run(script: str, payload: dict) -> tuple[int, str]:
    proc = subprocess.run(
        [str(HOOKS / script)],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=ROOT,
        check=False,
    )
    return proc.returncode, proc.stdout.strip()


def expect_deny(script: str, payload: dict) -> None:
    code, output = run(script, payload)
    assert code == 2, f"expected deny exit 2, got {code}: {output}"
    assert "deny" in output.lower(), output


def expect_allow(script: str, payload: dict) -> None:
    code, output = run(script, payload)
    assert code == 0, f"expected allow exit 0, got {code}: {output}"
    assert "allow" in output.lower(), output


def main() -> None:
    expect_deny(
        "block-sensitive-paths.sh",
        {"tool_name": "Read", "tool_input": {"file_path": "/app/.env"}},
    )
    expect_deny(
        "block-sensitive-paths.sh",
        {"path": "/app/secrets/api.key"},
    )
    expect_allow(
        "block-sensitive-paths.sh",
        {"tool_name": "Read", "tool_input": {"file_path": "/app/.env.example"}},
    )
    expect_allow(
        "block-destructive-shell.sh",
        {"command": "git status"},
    )
    expect_allow(
        "block-destructive-shell.sh",
        {"command": "npx prisma migrate dev"},
    )
    expect_allow(
        "block-destructive-shell.sh",
        {"command": "npm test"},
    )
    expect_deny(
        "block-destructive-shell.sh",
        {"tool_name": "Bash", "tool_input": {"command": "git reset --hard"}},
    )
    expect_deny(
        "block-destructive-shell.sh",
        {"command": "npx prisma migrate reset"},
    )
    expect_deny(
        "block-destructive-shell.sh",
        {"command": "npx prisma db seed"},
    )
    expect_deny(
        "block-destructive-shell.sh",
        {"command": "DROP TABLE foo"},
    )
    expect_deny(
        "block-destructive-shell.sh",
        {"command": "npm run db:wipe"},
    )
    print("hook smoke tests passed")


if __name__ == "__main__":
    main()
