"""Anatomy's runner uses managed resources and preserves script arguments."""

from pathlib import Path
import runpy
from types import SimpleNamespace
from unittest.mock import Mock

import pytest


RUNNER = Path(__file__).resolve().parents[2] / "skills/creative/anatomy/scripts/run.py"


def test_managed_resources_and_explicit_browser_override(tmp_path, monkeypatch):
    import pm

    runner = runpy.run_path(str(RUNNER))
    packages = {
        "node": SimpleNamespace(binary=tmp_path / "Node Runtime" / "node"),
        "chromium": SimpleNamespace(binary=tmp_path / "Chrome Runtime" / "chrome"),
    }
    monkeypatch.setattr(pm, "installed_package", lambda name, **kw: packages[name])
    monkeypatch.delenv("CHROME_PATH", raising=False)
    monkeypatch.delenv("AGENT_BROWSER_EXECUTABLE_PATH", raising=False)
    command, env = runner["runtime"]()
    assert command == (str(packages["node"].binary),)
    assert env["CHROME_PATH"] == str(packages["chromium"].binary)

    monkeypatch.setenv("CHROME_PATH", str(tmp_path / "Chosen Chrome"))
    assert runner["runtime"]()[1]["CHROME_PATH"] == str(tmp_path / "Chosen Chrome")


def test_forwarding_preserves_arguments_and_failure_exit_code(tmp_path, monkeypatch):
    import pm

    runner = runpy.run_path(str(RUNNER))
    node = tmp_path / "Node Runtime" / "node"
    monkeypatch.setattr(pm, "installed_package", lambda name, **kw:
                        SimpleNamespace(binary=node) if name == "node" else None)
    monkeypatch.setattr(runner["subprocess"], "check_output", lambda *a, **kw: "v26.12.1\n")
    execute = Mock(return_value=SimpleNamespace(returncode=7))
    monkeypatch.setattr(runner["subprocess"], "run", execute)

    args = [str(tmp_path / "A Figure" / "build.mjs"), "--out", "a path with spaces.png"]
    assert runner["main"](args) == 7
    assert execute.call_args.args[0] == [str(node), *args]
    assert "shell" not in execute.call_args.kwargs


def test_starter_does_not_replace_existing_work(tmp_path):
    starter = runpy.run_path(str(RUNNER.with_name("start.py")))
    project = tmp_path / "existing figure"
    project.mkdir()
    source = project / "user-notes.txt"
    source.write_text("keep my work", encoding="utf-8")

    with pytest.raises(FileExistsError, match="Destination is not empty"):
        starter["create_project"](project)

    assert source.read_text(encoding="utf-8-sig") == "keep my work"
    assert not (project / "build.mjs").exists()
