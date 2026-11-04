"""Profile-owned input preferences, independent of action approval grants."""

from typing import Any


def background_only() -> bool:
    from hermes_cli.config import load_config_readonly

    return bool((load_config_readonly().get("computer_use") or {}).get("background_only", False))


def background_alternative(escalation: dict[str, Any] | None = None) -> dict[str, Any]:
    if isinstance(escalation, dict) and escalation.get("recommended") == "px":
        return {
            "decision": "escalate",
            "recommended": "px",
            "hint": "Retry by coordinate with background delivery, then verify fresh state. Do not use foreground input.",
        }
    return {
        "decision": "use_background_alternative",
        "recommended": "background",
        "hint": (
            "The user requires background-only automation. Use accessibility actions, an application API, "
            "or browser CDP without moving the user's cursor or changing focus. If unsupported, report the "
            "limitation. Do not retry in foreground or bypass this preference with shell input automation."
        ),
    }


def foreground_refusal(action: str, args: dict[str, Any]) -> dict[str, Any] | None:
    changes_focus = args.get("bring_to_front") or (action == "focus_app" and args.get("raise_window"))
    if not (args.get("delivery_mode") == "foreground" or changes_focus) or not background_only():
        return None
    return {
        "ok": False,
        "action": action,
        "code": "background_only",
        "error": "Foreground input and window activation are disabled by computer_use.background_only.",
        "verdict": background_alternative(),
    }
