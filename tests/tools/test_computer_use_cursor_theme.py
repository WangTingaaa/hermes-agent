"""Bundled cursor data stays local and failed installation never selects a missing theme."""

from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from tools.computer_use.cua_backend_cursor import configure_cursor_theme


def test_bundled_theme_is_installed_before_session_selection(monkeypatch):
    calls = []
    monkeypatch.setattr("tools.computer_use.cua_backend_driver.resolve_cua_driver_cmd", lambda: "/driver")

    def run(binary, *args, **kwargs):
        calls.append((binary, args))
        return SimpleNamespace(returncode=0, stderr="")

    monkeypatch.setattr("tools.computer_use.permissions._run", run)
    backend = Mock()
    backend.call_tool.return_value = {"isError": False}
    configure_cursor_theme(backend, "mira.default")
    assert calls[0][0] == "/driver"
    assert calls[0][1][:2] == ("cursor-theme", "install")
    backend.call_tool.assert_called_once_with("set_agent_cursor_theme", {"theme_id": "mira.default"})


def test_install_failure_preserves_existing_session_theme(monkeypatch):
    monkeypatch.setattr("tools.computer_use.cua_backend_driver.resolve_cua_driver_cmd", lambda: "/driver")
    monkeypatch.setattr("tools.computer_use.permissions._run", lambda *a, **kw: SimpleNamespace(returncode=1, stderr="invalid artifact"))
    backend = Mock()
    with pytest.raises(RuntimeError, match="invalid artifact"):
        configure_cursor_theme(backend, "mira.default")
    backend.call_tool.assert_not_called()
