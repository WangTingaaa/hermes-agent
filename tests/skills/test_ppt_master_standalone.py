"""A terminal child can launch PPT helpers without importing Hermes's environment."""

import json
import os
import subprocess
import sys
from pathlib import Path


BRIDGE = Path(__file__).resolve().parents[2] / "skills/productivity/ppt-master/scripts/ppt_master.py"


def test_standalone_bridge_uses_explicit_profile_and_recorded_interpreter(tmp_path):
    profile = tmp_path / "profile with spaces"
    source = tmp_path / "managed source"
    scripts = source / "skills/ppt-master/scripts"
    scripts.mkdir(parents=True)
    (scripts / "echo.py").write_text(
        "import json,sys; print(json.dumps({'python':sys.executable,'args':sys.argv[1:]}))\n",
        encoding="utf-8",
    )
    marker = profile / "runtimes/ppt-master/active.json"
    marker.parent.mkdir(parents=True)
    marker.write_text(json.dumps({"root": str(source), "python": sys.executable}), encoding="utf-8")
    env = {**os.environ, "HERMES_HOME": str(profile)}
    env.pop("PYTHONPATH", None)
    result = subprocess.run(
        [sys.executable, "-S", str(BRIDGE), "run", "echo.py", "a path with spaces"],
        cwd=tmp_path, env=env, capture_output=True, text=True, timeout=30, check=False,
    )
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout) == {"python": sys.executable, "args": ["a path with spaces"]}


def test_standalone_bridge_without_profile_does_not_read_a_default_profile(tmp_path):
    env = dict(os.environ)
    for name in ("PYTHONPATH", "HERMES_HOME"):
        env.pop(name, None)
    result = subprocess.run(
        [sys.executable, "-S", str(BRIDGE), "doctor"], cwd=tmp_path, env=env,
        capture_output=True, text=True, timeout=30, check=False,
    )
    assert result.returncode == 1
    assert "HERMES_HOME" in result.stderr
    assert "Traceback" not in result.stderr
