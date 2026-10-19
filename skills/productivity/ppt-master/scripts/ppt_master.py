"""Bridge Hermes to the bundled, unchanged PPT Master in its own managed runtime."""

import argparse
import json
import subprocess
import sys
from pathlib import Path


REQUIRED_MODULES = ("pptx", "PIL", "lxml", "yaml", "xlsxwriter")


def resolve_runtime(root: str | None) -> tuple[Path, Path]:
    if root is None:
        from runtime_install import managed_runtime
        repo, python = managed_runtime()
        return repo / "skills/ppt-master", python
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
    parser.add_argument("--root", help="Optional override for an existing PPT Master repository")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("doctor", help="Check attribution and the independent Python runtime")
    setup = commands.add_parser("install", help="Install the bundled independent runtime")
    setup.add_argument("--bundle", required=True, type=Path)
    setup.add_argument("--offline", action="store_true")
    setup.add_argument("--wheelhouse", type=Path)
    lookup = commands.add_parser("svg-search", help="Match common editable layouts by name or scene")
    lookup.add_argument("query")
    lookup.add_argument("--library", type=Path)
    catalog = commands.add_parser("svg-catalog", help="Read all layout names and field schemas in one call")
    catalog.add_argument("--library", type=Path)
    fill = commands.add_parser("svg-render", help="Fill an editable layout from a JSON field mapping")
    fill.add_argument("name")
    fill.add_argument("--data", type=Path, required=True)
    fill.add_argument("--output", type=Path, required=True)
    fill.add_argument("--library", type=Path)
    batch = commands.add_parser("svg-render-batch", help="Fill multiple named layouts in one invocation")
    batch.add_argument("--jobs", type=Path, required=True)
    batch.add_argument("--library", type=Path)
    prepare = commands.add_parser("quick-prepare", help="Batch fill layouts, check SVGs and render contact sheets")
    prepare.add_argument("project", type=Path)
    prepare.add_argument("--deck", type=Path)
    prepare.add_argument("--library", type=Path)
    export = commands.add_parser("quick-export", help="Export once with upstream fingerprint and package validation")
    export.add_argument("project", type=Path)
    export.add_argument("--output", type=Path)
    notes = export.add_mutually_exclusive_group(required=True)
    notes.add_argument("--with-notes", action="store_true")
    notes.add_argument("--no-notes", action="store_true")
    export.add_argument("--native-charts-and-tables", action="store_true")
    run = commands.add_parser("run", help="Run an upstream script without changing Hermes dependencies")
    run.add_argument("script", help="Path relative to the upstream scripts directory")
    run.add_argument("arguments", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    try:
        if args.command == "install":
            from runtime_install import install
            print(json.dumps(install(args.bundle, offline=args.offline, wheelhouse=args.wheelhouse), ensure_ascii=False))
            return 0
        if args.command in {"quick-prepare", "quick-export"}:
            import quick_build
            skill, python = resolve_runtime(args.root)
            if args.command == "quick-prepare":
                from svg_library import library_root
                library = (args.library or library_root()) if args.deck else None
                result = quick_build.prepare(skill, python, args.project, deck_file=args.deck, library=library)
            else:
                result = quick_build.export(skill, python, args.project, output=args.output,
                    with_notes=args.with_notes, native_charts_and_tables=args.native_charts_and_tables)
            print(json.dumps(result, ensure_ascii=False))
            return 0 if result["ok"] else 1
        if args.command in {"svg-search", "svg-catalog", "svg-render", "svg-render-batch"}:
            from svg_library import library_root, render, search
            library = args.library or library_root()
            if args.command == "svg-catalog":
                result = json.loads((library / "catalog.json").read_text(encoding="utf-8"))
            elif args.command == "svg-search":
                result = search(library, args.query)
            elif args.command == "svg-render-batch":
                jobs = json.loads(args.jobs.read_text(encoding="utf-8"))
                result = [render(library, job["layout"], job["data"], Path(job["output"])) for job in jobs]
            else:
                result = render(library, args.name, json.loads(args.data.read_text(encoding="utf-8")), args.output)
            print(json.dumps(result, ensure_ascii=False))
            return 0
        skill, python = resolve_runtime(args.root)
        if args.command == "doctor":
            return doctor(skill, python)
        return run_script(skill, python, args.script, args.arguments)
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
