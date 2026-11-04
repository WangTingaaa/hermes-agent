"""Generation readiness includes the renderer and profile-owned layout assets."""

import importlib
import json
import runpy
import subprocess
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parents[2] / 'skills/productivity/ppt-master/scripts'


def test_doctor_rejects_missing_preview_renderer(tmp_path, monkeypatch, capsys):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    (tmp_path / 'scripts').mkdir()
    (tmp_path / 'scripts/attribution_guard.py').write_text('')
    bridge = runpy.run_path(str(SCRIPTS / 'ppt_master.py'))

    def run(command, **kwargs):
        if '-c' in command:
            modules = {name: name != 'resvg_py' for name in bridge['REQUIRED_MODULES']}
            return subprocess.CompletedProcess(command, 0, json.dumps(modules), '')
        return subprocess.CompletedProcess(command, 0)

    monkeypatch.setattr(subprocess, 'run', run)
    assert bridge['doctor'](tmp_path, tmp_path / 'python') == 1
    report = json.loads(capsys.readouterr().out)
    assert not report['ready']
    assert not report['modules']['resvg_py']


def test_doctor_rejects_missing_catalog_asset(tmp_path, monkeypatch, capsys):
    (tmp_path / 'scripts').mkdir()
    (tmp_path / 'scripts/attribution_guard.py').write_text('')
    monkeypatch.syspath_prepend(str(SCRIPTS))
    library = importlib.import_module('svg_library')
    monkeypatch.setattr(library, 'library_root', lambda: tmp_path)
    (tmp_path / 'catalog.json').write_text(json.dumps({'entries': [{'file': 'missing.svg'}]}))
    bridge = runpy.run_path(str(SCRIPTS / 'ppt_master.py'))

    def run(command, **kwargs):
        return subprocess.CompletedProcess(command, 0,
            json.dumps({name: True for name in bridge['REQUIRED_MODULES']}), '')

    monkeypatch.setattr(subprocess, 'run', run)
    assert bridge['doctor'](tmp_path, tmp_path / 'python', check_library=True) == 1
    assert not json.loads(capsys.readouterr().out)['ready']
