"""Bridge Hermes to a separately installed, unchanged PPT Master package."""

import argparse
import json
import subprocess
import sys
from pathlib import Path


REQUIRED_MODULES = ("pptx", "PIL", "lxml", "yaml", "xlsxwriter")


def resolve_runtime(root: str) -> tuple[Path, Path]:
    repo = Path(root).expanduser().resolve()
    skill = repo / "skills" / "ppt-master"
    if not (skill / "SKILL.md").is_file():
        raise ValueError(f"PPT Master skill not found in {repo}")
    candidates = (repo / ".venv" / "bin" / "python", repo / ".venv" / "Scripts" / "python.exe")
    python = next((path for path in candidates if path.is_file()), None)
    if python is None:
        raise ValueError(f"PPT Master needs its own Python environment under {repo / '.venv'}")
    return skill, python


def run_script(skill: Path, python: Path, script: str, arguments: list[str]) -> int:
    scripts = skill / "scripts"
    target = (scripts / script).resolve()
    if not target.is_relative_to(scripts.resolve()) or target.suffix != ".py" or not target.is_file():
        raise ValueError(f"Not a PPT Master Python script: {script}")
    return subprocess.run([str(python), str(target), *arguments], check=False, timeout=3600).returncode


def doctor(skill: Path, python: Path) -> int:
    attribution = run_script(skill, python, "attribution_guard.py", [])
    if attribution:
        return attribution
    probe = "import importlib.util,json; print(json.dumps({n:bool(importlib.util.find_spec(n)) for n in " + repr(REQUIRED_MODULES) + "}))"
    result = subprocess.run([str(python), "-c", probe], capture_output=True, text=True, check=True, timeout=30)
    modules = json.loads(result.stdout)
    ready = all(modules.values())
    print(json.dumps({
        "ready": ready,
        "skill_dir": str(skill),
        "python": str(python),
        "entrypoint": str(skill / "SKILL.md"),
        "routing": str(skill / "workflows" / "routing.md"),
        "modules": modules,
    }, ensure_ascii=False, indent=2))
    return 0 if ready else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="Configured PPT Master repository path")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("doctor", help="Check attribution and the independent Python runtime")
    run = commands.add_parser("run", help="Run an upstream script without changing Hermes dependencies")
    run.add_argument("script", help="Path relative to the upstream scripts directory")
    run.add_argument("arguments", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    try:
        skill, python = resolve_runtime(args.root)
        if args.command == "doctor":
            return doctor(skill, python)
        return run_script(skill, python, args.script, args.arguments)
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
