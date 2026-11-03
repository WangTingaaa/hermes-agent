"""Local Chromium is visible by default and supports explicit headless configuration.

The setting is read from a real config.yaml. Windows headed launches need no DISPLAY;
the Linux display rule is covered in test_browser_launcher.py.
"""

from pathlib import Path

import pytest

from tools import browser_launcher as launcher
from tools import browser_session_cloud as bs_cloud

_WITH_DISPLAY = {"DISPLAY": ":0", "WAYLAND_DISPLAY": "wayland-0"}


@pytest.fixture(autouse=True)
def home(monkeypatch, tmp_path):
    home = tmp_path / ".hermes"
    home.mkdir()
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setenv("HERMES_HOME", str(home))
    monkeypatch.setenv("HERMES_RUNTIME_DIR", str(tmp_path / "tools"))
    monkeypatch.setattr("tools.browser_session_cloud.chromium_args", list)
    bs_cloud.reset_caches()
    yield home
    bs_cloud.reset_caches()


def _configure(home: Path, body: str) -> None:
    (home / "config.yaml").write_text(body, encoding="utf-8")
    bs_cloud.reset_caches()


def test_launch_is_visible_unless_browser_headed_is_disabled(home):
    """Missing config shows the window; explicit headless configuration still wins."""
    assert launcher._resolve_headed(None, _WITH_DISPLAY) is True
    _configure(home, "browser:\n  headed: false\n")
    assert launcher._resolve_headed(None, _WITH_DISPLAY) is False
    _configure(home, "browser:\n  headed: true\n")
    assert launcher._resolve_headed(None, _WITH_DISPLAY) is True
    assert launcher._resolve_headed(False, _WITH_DISPLAY) is False  # an explicit headless launch wins


@pytest.mark.platforms("windows")
def test_windows_headed_opt_in_needs_no_display(home):
    """Windows headed launches need no DISPLAY."""
    assert launcher._resolve_headed(None, {"PATH": "C:/Windows"}) is True
    _configure(home, "browser:\n  headed: true\n")
    assert launcher._resolve_headed(None, {}) is True


def test_default_local_launch_argv_is_visible(monkeypatch, tmp_path):
    """A default local launch omits --headless=new when a display is available."""
    monkeypatch.setattr(launcher, "needs_chromium_sandbox_bypass", lambda: False)
    captured = []

    class _Proc:
        pid = 4321

        def poll(self):
            return 1

    def capture_spawn(argv, env, user_data_dir):
        captured.append(argv)
        return _Proc()

    monkeypatch.setattr(launcher, "_spawn", capture_spawn)
    monkeypatch.setattr(launcher, "_start_time", lambda pid: None)
    monkeypatch.setattr(launcher, "_terminate", lambda pid, start_time, proc: None)
    browser, err = launcher.launch_chromium("win-headless", executable="chrome.exe",
                                            user_data_dir=str(tmp_path / "udd"), env=dict(_WITH_DISPLAY),
                                            timeout=1)

    assert browser is None and "exited" in err  # the fake exits at once; only the argv matters
    assert len(captured) == 1
    assert "--headless=new" not in captured[0]
