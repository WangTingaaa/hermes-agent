"""PPT Master bridge preserves script arguments and rejects runtime escapes."""

import runpy
import sys
from pathlib import Path

import pytest


BRIDGE = Path(__file__).resolve().parents[2] / "skills/productivity/ppt-master/scripts/ppt_master.py"


def test_script_forwarding_preserves_arguments_and_exit_code(tmp_path, capfd):
    bridge = runpy.run_path(str(BRIDGE))
    skill = tmp_path / "PPT Master"
    script = skill / "scripts" / "nested" / "echo.py"
    script.parent.mkdir(parents=True)
    script.write_text("import sys\nprint(repr(sys.argv[1:]))\nsys.exit(7)\n", encoding="utf-8")

    code = bridge["run_script"](skill, Path(sys.executable), "nested/echo.py", ["a path with spaces", "--quick-generate"])

    assert code == 7
    assert "['a path with spaces', '--quick-generate']" in capfd.readouterr().out


def test_only_scripts_inside_the_selected_skill_can_execute(tmp_path):
    bridge = runpy.run_path(str(BRIDGE))
    skill = tmp_path / "skill"
    (skill / "scripts").mkdir(parents=True)
    outside = skill / "outside.py"
    outside.write_text("raise RuntimeError('must not execute')\n", encoding="utf-8")

    with pytest.raises(ValueError, match="Not a PPT Master Python script"):
        bridge["run_script"](skill, Path(sys.executable), "../outside.py", [])


def test_managed_runtime_uses_recorded_interpreter_without_searching_checkouts(tmp_path, monkeypatch):
    import json
    import importlib
    monkeypatch.syspath_prepend(str(BRIDGE.parent))
    runtime = importlib.import_module("runtime_install")
    marker = tmp_path / "active.json"
    marker.write_text(json.dumps({"root": str(tmp_path / "source"), "python": sys.executable}), encoding="utf-8")
    monkeypatch.setattr(runtime, "state_path", lambda: marker)

    skill, python = runpy.run_path(str(BRIDGE))["resolve_runtime"](None)

    assert skill == tmp_path / "source/skills/ppt-master"
    assert python == Path(sys.executable)


def test_svg_fields_are_escaped_and_missing_fields_do_not_publish_output(tmp_path, monkeypatch):
    import json
    import importlib
    monkeypatch.syspath_prepend(str(BRIDGE.parent))
    library = importlib.import_module("svg_library")
    (tmp_path / "catalog.json").write_text(json.dumps({"entries": [{
        "id": "comparison", "name": "对比", "scenes": ["对比"], "file": "comparison.svg",
        "placeholders": ["TITLE"],
    }]}), encoding="utf-8")
    (tmp_path / "comparison.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"><text>{{TITLE}}</text></svg>')
    output = tmp_path / "result.svg"
    with pytest.raises(ValueError, match="Missing SVG fields"):
        library.render(tmp_path, "comparison", {}, output)
    assert not output.exists()
    library.render(tmp_path, "comparison", {"TITLE": "A & B < C"}, output)
    assert "A &amp; B &lt; C" in output.read_text()
    assert library.search(tmp_path, "对比")[0]["id"] == "comparison"


def test_bundled_install_reuses_environment_and_rejects_tampered_archive(tmp_path, monkeypatch):
    import hashlib
    import importlib
    import io
    import json
    import tarfile
    import pm

    monkeypatch.syspath_prepend(str(BRIDGE.parent))
    runtime = importlib.import_module("runtime_install")
    bundle = tmp_path / "bundle"
    (bundle / "svg-library").mkdir(parents=True)
    (bundle / "svg-library/catalog.json").write_text('{"entries": []}')
    archive = bundle / "source.tar.gz"
    with tarfile.open(archive, "w:gz") as package:
        guard = tarfile.TarInfo("skills/ppt-master/scripts/attribution_guard.py")
        content = b"print('Attribution OK')\n"
        guard.size = len(content)
        package.addfile(guard, io.BytesIO(content))
    (bundle / "manifest.json").write_text(json.dumps({
        "commit": "b" * 40, "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
    }))
    marker = tmp_path / "profile/active.json"
    monkeypatch.setattr(runtime, "state_path", lambda: marker)
    builds = []
    monkeypatch.setattr(pm, "build_environment", lambda **kwargs: builds.append(kwargs) or Path(sys.executable))
    monkeypatch.setattr(runtime, "_probe", lambda python: None)
    monkeypatch.setattr(runtime.subprocess, "run", lambda *args, **kwargs: None)

    first = runtime.install(bundle, offline=True, wheelhouse=tmp_path / "wheels")
    second = runtime.install(bundle, offline=True, wheelhouse=tmp_path / "wheels")

    assert first == second
    assert len(builds) == 1
    assert builds[0]["frozen"] and builds[0]["offline"]
    assert builds[0]["env"]["UV_NO_INDEX"] == "1"
    assert Path(first["root"], ".bundle-complete").is_file()
    archive.write_bytes(b"damaged archive")
    with pytest.raises(ValueError, match="checksum mismatch"):
        runtime.install(bundle)
    assert len(builds) == 1
