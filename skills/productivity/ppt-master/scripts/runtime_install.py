"""Install the bundled PPT Master into a profile-owned, independent PM environment."""

import hashlib
import json
import shutil
import subprocess
import sys
import tarfile
import tempfile
import uuid
from pathlib import Path


def state_path() -> Path:
    from hermes_constants import get_hermes_home
    return get_hermes_home() / "runtimes" / "ppt-master" / "active.json"


def managed_runtime() -> tuple[Path, Path]:
    state = json.loads(state_path().read_text(encoding="utf-8"))
    return Path(state["root"]), Path(state["python"])


def install(bundle: Path, *, offline: bool = False, wheelhouse: Path | None = None) -> dict:
    import pm

    manifest = json.loads((bundle / "manifest.json").read_text(encoding="utf-8"))
    archive = bundle / "source.tar.gz"
    if hashlib.sha256(archive.read_bytes()).hexdigest() != manifest["sha256"]:
        raise ValueError("PPT Master source checksum mismatch")
    commit = manifest["commit"]
    if len(commit) != 40 or any(c not in "0123456789abcdef" for c in commit):
        raise ValueError("Invalid PPT Master source identity")
    root = state_path().parent / commit
    source = root / "source"
    if not (source / ".bundle-complete").is_file():
        root.mkdir(parents=True, exist_ok=True)
        staging = Path(tempfile.mkdtemp(prefix="source-", dir=root))
        with tarfile.open(archive) as package:
            package.extractall(staging, filter="data")
        subprocess.run([sys.executable, str(staging / "skills/ppt-master/scripts/attribution_guard.py")],
                       check=True, timeout=30)
        (staging / ".bundle-complete").write_text(manifest["sha256"], encoding="utf-8")
        if source.exists():
            shutil.rmtree(source)
        staging.replace(source)
    runtime_source = Path(__file__).resolve().parents[1] / "runtime"
    lock_sha = hashlib.sha256((runtime_source / "uv.lock").read_bytes()).hexdigest()
    current = json.loads(state_path().read_text(encoding="utf-8")) if state_path().exists() else {}
    python = Path(current["python"]) if current.get("commit") == commit and current.get("lock_sha256") == lock_sha else None
    if python is not None:
        try:
            _probe(python)
        except (OSError, subprocess.SubprocessError):
            python = None
    if python is None:
        python = pm.build_environment(
            source=runtime_source, out=root / "environments" / uuid.uuid4().hex,
            frozen=True, offline=offline,
            env=None if wheelhouse is None else _offline_environment(wheelhouse), explicit=True,
        )
    guard = source / "skills/ppt-master/scripts/attribution_guard.py"
    subprocess.run([str(python), str(guard)], check=True, timeout=30)
    _probe(python)
    library = root / "svg-library"
    shutil.copytree(bundle / "svg-library", library, dirs_exist_ok=True)
    state = {"root": str(source), "python": str(python), "commit": commit,
             "lock_sha256": lock_sha, "svg_library": str(library)}
    marker = state_path()
    marker.parent.mkdir(parents=True, exist_ok=True)
    pending = marker.with_suffix(".pending")
    pending.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    pending.replace(marker)
    return {"ok": True, **state}


def _probe(python: Path) -> None:
    subprocess.run([str(python), "-c", "import pptx, PIL, lxml, yaml, xlsxwriter, pathops, uharfbuzz, resvg_py"],
                   check=True, timeout=30)


def _offline_environment(wheelhouse: Path) -> dict:
    import os
    return {**os.environ, "UV_FIND_LINKS": str(wheelhouse), "UV_NO_INDEX": "1", "UV_OFFLINE": "1"}
