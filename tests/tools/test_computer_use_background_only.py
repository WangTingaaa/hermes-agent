"""A profile's background-only preference cannot be widened by tool approvals."""

import json
from unittest.mock import Mock

import pytest

from hermes_constants import reset_hermes_home_override, set_hermes_home_override
from tools.computer_use import tool as cu
from tools.computer_use.backend import ActionResult
from tools.computer_use_tool import registry


@pytest.mark.parametrize("args", [
    {"action": "click", "coordinate": [10, 20], "delivery_mode": "foreground"},
    {"action": "drag", "from_coordinate": [10, 20], "to_coordinate": [30, 40], "delivery_mode": "foreground"},
    {"action": "type", "text": "hello", "delivery_mode": "foreground"},
    {"action": "key", "keys": "return", "delivery_mode": "foreground"},
    {"action": "scroll", "direction": "down", "delivery_mode": "foreground"},
    {"action": "focus_app", "app": "Notes", "raise_window": True},
    {"action": "click", "element": 1, "delivery_mode": "foreground", "bring_to_front": True},
])
def test_background_only_refuses_foreground_before_approval_or_backend(tmp_path, monkeypatch, args):
    (tmp_path / "config.yaml").write_text("computer_use:\n  background_only: true\n", encoding="utf-8")
    monkeypatch.setenv("HERMES_HOME", str(tmp_path))
    approval = Mock(return_value=None)
    backend = Mock(side_effect=AssertionError("a refused action reached the desktop"))
    monkeypatch.setattr(cu, "_request_approval", approval)
    monkeypatch.setattr(cu, "_backend_for_call", backend)

    result = json.loads(registry.dispatch("computer_use", args, session_id="background-only"))

    assert result["code"] == "background_only"
    approval.assert_not_called()
    backend.assert_not_called()


def test_policy_is_profile_scoped_and_keeps_background_inputs_usable(tmp_path, monkeypatch, grant_computer_use_approvals):
    restricted, normal = tmp_path / "restricted", tmp_path / "normal"
    for home, enabled in ((restricted, "true"), (normal, "false")):
        home.mkdir()
        (home / "config.yaml").write_text(f"computer_use:\n  background_only: {enabled}\n", encoding="utf-8")
    monkeypatch.setenv("HERMES_HOME", str(normal))
    monkeypatch.setattr(cu, "_new_backend", lambda mode: cu._NoopBackend())
    cu.reset_backend_for_tests()
    token = set_hermes_home_override(str(restricted))
    try:
        result = json.loads(registry.dispatch("computer_use", {"action": "click", "element": 1}))
        assert result["ok"] is True
        verdict = cu._classify_action_result(ActionResult(
            ok=False, action="click", effect="suspected_noop", escalation={"recommended": "foreground"}))
        assert verdict["decision"] == "use_background_alternative"
        pixel = cu._classify_action_result(ActionResult(
            ok=False, action="click", effect="suspected_noop", escalation={"recommended": "px"}))
        assert pixel["decision"] == "escalate" and pixel["recommended"] == "px"
    finally:
        reset_hermes_home_override(token)
    try:
        result = json.loads(registry.dispatch("computer_use", {
            "action": "click", "element": 1, "delivery_mode": "foreground"}))
        assert result["ok"] is True
        verdict = cu._classify_action_result(ActionResult(
            ok=False, action="click", effect="suspected_noop", escalation={"recommended": "foreground"}))
        assert verdict["decision"] == "escalate"
    finally:
        cu.reset_backend_for_tests()
