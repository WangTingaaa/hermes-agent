"""Visual feedback follows actual CDP input without changing input or reading secrets."""

import pytest

from tools.browser_cursor import install_cursor


def test_cursor_preserves_coordinates_target_and_private_input(monkeypatch):
    from browser_harness import helpers

    calls = []

    def dispatch(method, session_id=None, **params):
        calls.append((method, session_id, params))
        return {"delivered": method}

    monkeypatch.setattr(helpers, "cdp", dispatch)
    namespace = {"cdp": dispatch}
    install_cursor(namespace)
    click = {"type": "mousePressed", "x": 145.5, "y": 212, "button": "left", "clickCount": 1}
    assert namespace["cdp"]("Input.dispatchMouseEvent", "frame-2", **click) == {"delivered": "Input.dispatchMouseEvent"}
    assert calls[-1] == ("Input.dispatchMouseEvent", "frame-2", click)
    assert calls[-2][0:2] == ("Runtime.evaluate", "frame-2")

    helpers.type_text("private-password-not-for-the-overlay")
    assert calls[-1][2] == {"text": "private-password-not-for-the-overlay"}
    assert "private-password-not-for-the-overlay" not in calls[-2][2]["expression"]
    count = len(calls)
    namespace["cdp"]("Page.getLayoutMetrics")
    assert len(calls) == count + 1  # observations never create cursor movement


def test_cursor_failure_cannot_block_input_and_real_input_errors_propagate(monkeypatch):
    from browser_harness import helpers

    delivered = []

    def dispatch(method, session_id=None, **params):
        if method == "Runtime.evaluate":
            raise RuntimeError("page navigated while painting")
        delivered.append(params)
        if params.get("x") == 99:
            raise ValueError("input refused")
        return {"ok": True}

    monkeypatch.setattr(helpers, "cdp", dispatch)
    namespace = {}
    install_cursor(namespace)
    install_cursor(namespace)
    namespace["cdp"]("Input.dispatchMouseEvent", type="mousePressed", x=15, y=20)
    assert delivered == [{"type": "mousePressed", "x": 15, "y": 20}]
    with pytest.raises(ValueError, match="input refused"):
        namespace["cdp"]("Input.dispatchMouseEvent", type="mousePressed", x=99, y=20)
