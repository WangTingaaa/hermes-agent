"""Create and build a portable Anatomy baseline from the smallest existing example."""

import argparse
from pathlib import Path
import shutil


def create_project(destination):
    skill = Path(__file__).resolve().parents[1]
    target = Path(destination).expanduser().resolve()
    target.mkdir(parents=True, exist_ok=True)
    if any(target.iterdir()):
        raise FileExistsError(f"Destination is not empty; continue existing work instead: {target}")

    for relative in ("kit/iso-kit.mjs", "scripts/inline-kit.mjs", "LICENSE"):
        output = target / relative
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(skill / relative, output)
    example = (skill / "examples/dial-indicator/build.mjs").read_text(encoding="utf-8-sig")
    build = example.replace('"../../kit/', '"./kit/').replace('"../../scripts/', '"./scripts/')
    (target / "build.mjs").write_text(build, encoding="utf-8")
    return target


def main():
    from run import main as run_node

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--theme", choices=("light", "dark"), default="light")
    args = parser.parse_args()
    target = create_project(args.destination)
    print(f"Created dial-indicator baseline at {target}; adapt it to the requested concept.", flush=True)
    flags = ["--light"] if args.theme == "light" else []
    return run_node([str(target / "build.mjs"), *flags])


if __name__ == "__main__":
    raise SystemExit(main())
