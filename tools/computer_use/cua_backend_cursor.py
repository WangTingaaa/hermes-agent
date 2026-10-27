"""Install bundled cursor data locally and select a per-session theme."""

from pathlib import Path


def configure_cursor_theme(backend, theme_id: str) -> None:
    if theme_id == "mira.default":
        from tools.computer_use.cua_backend_driver import resolve_cua_driver_cmd
        from tools.computer_use.permissions import _run

        binary = resolve_cua_driver_cmd()
        if not binary:
            raise RuntimeError("Install cua-driver before configuring the Mira cursor")
        asset = Path(__file__).with_name("assets") / "mira.cua-theme"
        result = _run(binary, "cursor-theme", "install", str(asset), timeout=10)
        if result.returncode:
            raise RuntimeError(result.stderr.strip() or "Could not install the Mira cursor theme")
    result = backend.call_tool("set_agent_cursor_theme", {"theme_id": theme_id})
    if result.get("isError"):
        raise RuntimeError(str(result.get("data") or "Could not select the cursor theme"))
