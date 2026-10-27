"""Opt-in visual feedback for the browser harness's actual CDP input calls."""

from __future__ import annotations

import functools
import json
import logging
import math
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def cursor_preamble(color: str = "#10b5c8") -> str:
    """Load beside the harness without relying on its subprocess PYTHONPATH."""
    return (f"__import__('runpy').run_path({str(Path(__file__).resolve())!r})"
            f"['install_cursor'](globals(), color={color!r})\n")


def with_cursor_feedback(code: str, config: dict[str, Any]) -> str:
    return cursor_preamble(config.get("cursor_color", "#10b5c8")) + code if config.get("show_cursor") is True else code


def _pointer_event(method: str, params: dict[str, Any]) -> dict[str, Any] | None:
    if method == "Input.insertText" or (
        method == "Input.dispatchKeyEvent" and params.get("type") in {"keyDown", "rawKeyDown"}
    ):
        return {"kind": "focus"}
    if method != "Input.dispatchMouseEvent":
        return None
    kind = {"mousePressed": "click", "mouseMoved": "move", "mouseWheel": "scroll"}.get(params.get("type"))
    coords = [params.get("x"), params.get("y")]
    if not kind or not all(isinstance(n, (int, float)) and not isinstance(n, bool) and math.isfinite(n) for n in coords):
        return None
    return {"kind": kind, "x": coords[0], "y": coords[1]}


def install_cursor(namespace: dict[str, Any], color: str = "#10b5c8") -> None:
    """Decorate input dispatch only; visual failures must never suppress real input."""
    from browser_harness import helpers

    original = helpers.cdp
    color = color if isinstance(color, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", color) else "#10b5c8"
    if getattr(original, "_hermes_visual_cursor", False):
        namespace["cdp"] = original
        return
    script = Path(__file__).with_suffix(".js").read_text(encoding="utf-8")

    @functools.wraps(original)
    def with_cursor(method, session_id=None, *args, **params):
        event = _pointer_event(method, params)
        if event is not None:
            expression = f"({script})({json.dumps({**event, 'color': color, 'label': 'Mira'}, allow_nan=False)})"
            try:
                original("Runtime.evaluate", session_id=session_id, expression=expression,
                         returnByValue=True, awaitPromise=True)
            except (OSError, RuntimeError, ValueError) as exc:
                logger.debug("Browser cursor unavailable: %s", type(exc).__name__)
        return original(method, session_id, *args, **params)

    with_cursor._hermes_visual_cursor = True
    helpers.cdp = namespace["cdp"] = with_cursor
