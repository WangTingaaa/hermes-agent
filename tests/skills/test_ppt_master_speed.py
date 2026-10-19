"""Batch preparation keeps native export gates and avoids text-loss repairs."""

import importlib
import json
import subprocess
import sys
from pathlib import Path
from xml.etree import ElementTree

import pytest


SCRIPTS = Path(__file__).resolve().parents[2] / "skills/productivity/ppt-master/scripts"


def modules(monkeypatch):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    return importlib.import_module("quick_build"), importlib.import_module("svg_library")


def test_body_wrap_preserves_complete_text_and_unchanged_svg_mtime(tmp_path, monkeypatch):
    _, library = modules(monkeypatch)
    catalog = {"entries": [{"id": "body", "name": "Body", "file": "body.svg", "placeholders": ["BODY"]}]}
    (tmp_path / "catalog.json").write_text(json.dumps(catalog))
    (tmp_path / "body.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"><g data-pptx-bounds="0 0 240 300"><text x="20" y="40" font-size="20">{{BODY}}</text></g></svg>')
    text = "完整保留这段事实和数字 42，不允许截断或转为图片。A & B < C。"
    output = tmp_path / "filled.svg"
    library.render(tmp_path, "body", {"BODY": text}, output)
    document = ElementTree.fromstring(output.read_text())
    assert len(document.findall(".//{http://www.w3.org/2000/svg}tspan")) > 1
    assert "".join(document.itertext()) == text
    before = output.stat().st_mtime_ns
    library.render(tmp_path, "body", {"BODY": text}, output)
    assert output.stat().st_mtime_ns == before
    with pytest.raises(ValueError, match="exceeds its layout zone"):
        library.render(tmp_path, "body", {"BODY": text * 30}, output)
    assert output.stat().st_mtime_ns == before


def test_early_gate_precedes_page_six_and_failure_prevents_later_authoring(tmp_path, monkeypatch):
    build, library = modules(monkeypatch)
    project = tmp_path / "project"
    (project / "svg_output").mkdir(parents=True)
    (project / "validation").mkdir()
    rendered = []
    monkeypatch.setattr(library, "render", lambda *args: rendered.append(args[-1].stem))

    def blocked(*args):
        assert len(rendered) == 5
        assert args[3] == "early"
        raise build.BuildFailure("layout error")

    monkeypatch.setattr(build, "_checker", blocked)
    deck = {"slides": [{"layout": "body", "fields": {}} for _ in range(7)]}
    with pytest.raises(build.BuildFailure, match="layout error"):
        build._fill_deck(Path("skill"), Path(sys.executable), project, deck, tmp_path, {})
    assert len(rendered) == 5


def test_failed_final_check_prevents_preview_and_export(tmp_path, monkeypatch):
    build, _ = modules(monkeypatch)
    (tmp_path / "svg_output").mkdir()
    calls = []

    def run(command, **kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 1 if "svg_quality_checker.py" in command[1] else 0, "blocked", "")

    monkeypatch.setattr(build.subprocess, "run", run)
    result = build.prepare(Path("skill"), Path(sys.executable), tmp_path)
    assert result["ok"] is False
    assert len(calls) == 2
    assert "blocked" in result["error"]
    assert (tmp_path / "validation/quick-final.log").is_file()


def test_quick_helpers_reject_native_edit_workspaces(tmp_path, monkeypatch):
    build, _ = modules(monkeypatch)
    (tmp_path / "svg_output").mkdir()
    (tmp_path / "page_plan.json").write_text('{}')
    with pytest.raises(ValueError, match="Edit Native PPTX"):
        build.prepare(Path("skill"), Path(sys.executable), tmp_path)


def test_export_uses_official_postflight_without_rechecking_or_recounting(tmp_path, monkeypatch):
    build, _ = modules(monkeypatch)
    (tmp_path / "svg_output").mkdir()
    (tmp_path / "validation").mkdir()
    output = tmp_path / "deck.pptx"
    calls = []

    def run(command, **kwargs):
        calls.append(command)
        if command[1].endswith("svg_to_pptx.py"):
            output.write_bytes(b"mock PPTX")
            receipt = {"status": "passed", "output": {"path": str(output)}, "package": {"slides": 2}}
            (tmp_path / "validation/deck.report.json").write_text(json.dumps(receipt))
        return subprocess.CompletedProcess(command, 0, "", "")

    monkeypatch.setattr(build.subprocess, "run", run)
    report = build.export(Path("skill"), Path(sys.executable), tmp_path, output=output, with_notes=True)
    assert report["ok"] is True
    assert len(calls) == 3
    assert calls[1][1].endswith("total_md_split.py")
    assert "--with-notes" in calls[2]
    assert "--quick-generate" in calls[2]
    assert report["package"]["slides"] == 2
