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
