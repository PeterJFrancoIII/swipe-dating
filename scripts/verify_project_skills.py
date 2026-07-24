#!/usr/bin/env python3
"""Fail-closed integrity check for project-scoped agent skills."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK_PATH = ROOT / "skills-lock.json"
MANIFEST_PATH = ROOT / "docs" / "ai" / "project-skill-manifest.md"
SKILLS_ROOT = ROOT / ".agents" / "skills"

EXPECTED = {
    "frontend-design": {
        "source": "anthropics/skills",
        "source_revision": "1f630fdf9259cec4a14913127dfd7c3b69ef72eb",
        "skill_path": "skills/frontend-design/SKILL.md",
        "folder_hash": "88ff0e041124588e3811dc24e63fa9cba758edbcdd4504b9f23ac075f45409e6",
        "skill_hash": "b1c0ca943ba71f0385a01b1e789bbba272b07541e9737b8df70f4e394b681d83",
    },
    "web-design-guidelines": {
        "source": "vercel-labs/agent-skills",
        "source_revision": "4e799d45c17aec1498c269287a83b9dba22b966b",
        "wrapper_revision": "4559f18a20c1691c744b4395194290db6a0df5e9",
        "skill_path": "skills/web-design-guidelines/SKILL.md",
        "folder_hash": "ea403a50ec7c6130adc4e7d875408a00df4e4527f5900360e6dd2dcd48da797e",
        "skill_hash": "89666bf881bb9d779e020c7bd224698ae6aa1a8d508521bfb9bae5dde604330a",
    },
}
REMOTE_INSTRUCTION_MARKERS = (
    "http://",
    "https://",
    "raw.githubusercontent.com",
    "webfetch",
    "websearch",
    "curl ",
    "wget ",
    "git clone",
    "npx ",
    "npm install",
    "pip install",
    "uv add",
)


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _folder_hash(path: Path) -> str:
    digest = hashlib.sha256()
    files = sorted(item for item in path.rglob("*") if item.is_file())
    for item in files:
        digest.update(item.relative_to(path).as_posix().encode())
        digest.update(item.read_bytes())
    return digest.hexdigest()


def _fail(message: str) -> None:
    raise SystemExit(f"project skill verification failed: {message}")


def main() -> None:
    lock = json.loads(LOCK_PATH.read_text())
    if lock.get("version") != 1:
        _fail("unexpected skills-lock.json version")

    locked_skills = lock.get("skills", {})
    if set(locked_skills) != set(EXPECTED):
        _fail("skills-lock.json does not contain the exact approved skill set")

    installed_skills = {path.name for path in SKILLS_ROOT.iterdir() if path.is_dir()}
    if installed_skills != set(EXPECTED):
        _fail("installed project skill directories do not match the approved set")

    manifest = MANIFEST_PATH.read_text()
    for name, expected in EXPECTED.items():
        skill_dir = SKILLS_ROOT / name
        skill_path = skill_dir / "SKILL.md"
        if not skill_path.is_file():
            _fail(f"{name}/SKILL.md is missing")

        folder_hash = _folder_hash(skill_dir)
        if folder_hash != expected["folder_hash"]:
            _fail(f"{name} folder hash mismatch")
        if _sha256(skill_path) != expected["skill_hash"]:
            _fail(f"{name}/SKILL.md hash mismatch")

        locked = locked_skills.get(name, {})
        if locked.get("source") != expected["source"]:
            _fail(f"{name} source mismatch")
        if locked.get("sourceType") != "github":
            _fail(f"{name} source type mismatch")
        if locked.get("skillPath") != expected["skill_path"]:
            _fail(f"{name} skill path mismatch")
        if locked.get("computedHash") != folder_hash:
            _fail(f"{name} lock hash mismatch")

        skill_text = skill_path.read_text()
        if f'source: "{expected["source"]}"' not in skill_text:
            _fail(f"{name} metadata source is not pinned")
        if f'source-revision: "{expected["source_revision"]}"' not in skill_text:
            _fail(f"{name} metadata revision is not pinned")
        wrapper_revision = expected.get("wrapper_revision")
        if wrapper_revision and f'wrapper-revision: "{wrapper_revision}"' not in skill_text:
            _fail(f"{name} wrapper revision is not pinned")

        for instruction_path in skill_dir.rglob("*"):
            if not instruction_path.is_file() or instruction_path.name.startswith("LICENSE"):
                continue
            instruction_text = instruction_path.read_text().casefold()
            for marker in REMOTE_INSTRUCTION_MARKERS:
                if marker in instruction_text:
                    _fail(f"{name} contains remote instruction marker {marker!r}")

        manifest_values = (
            expected["source"],
            expected["source_revision"],
            expected["folder_hash"],
            expected["skill_hash"],
        )
        if wrapper_revision:
            manifest_values += (wrapper_revision,)
        for value in manifest_values:
            if value not in manifest:
                _fail(f"{name} manifest is missing {value}")

    if "skills@1.5.20" not in manifest:
        _fail("manifest does not pin the Skills CLI version")
    if "python3 scripts/verify_project_skills.py" not in manifest:
        _fail("manifest does not document the deterministic verifier")

    print("Project skill verification passed (2 approved project skills).")


if __name__ == "__main__":
    main()
