"""Computer-use configuration defaults; kept separate from the defaults hub."""

COMPUTER_USE_DEFAULTS = {
    # Refuse foreground delivery and focus escalation even when action approvals allow them.
    "background_only": False,
    # cua-driver's upstream PostHog telemetry defaults ON; Hermes sets
    # CUA_DRIVER_RS_TELEMETRY_ENABLED=0 in every child env unless this is true.
    "cua_telemetry": False,
    # Windows only: opt IN to the per-boot cua-driver-serve logon task. False (default)
    # keeps the driver on-demand — Computer Use starts it per session, exactly as on
    # macOS/Linux, and install/enable flows register no scheduled task (#97389). True
    # registers (or repairs) the task at install time — needed to drive Windows over SSH,
    # where Session 0 has no interactive desktop (see the computer-use guide).
    "autostart": False,
    "native_wayland": False,
    # Cap driver screenshot longest edge (pixels) via set_config at session start; shrinks SOM
    # multimodal payloads. 0 disables.
    "max_image_dimension": 1456,
    # capture_after mode: som = screenshot + overlays; ax = elements only, no PNG (faster);
    # vision = pixels only.
    "capture_after_mode": "som",
    # Bound cua-driver's accessibility-tree WALK on every capture (get_window_state max_elements).
    # _DEFAULT_MAX_ELEMENTS in tools/computer_use/tool.py caps the SURFACED element list at 100 and
    # spills the rest to a cache file, so an unbounded walk pays for nodes the model never sees:
    # measured on macOS (cua-driver 0.28.2, M-series) a 1,444-node Chrome window went 540 ms -> 83 ms
    # and a 456-node Finder window 6.9 s -> 0.6 s at 200, with the returned elements a prefix of the
    # unbounded walk. 0 = driver default (2,000 elements / depth 25) — the pre-fix behaviour.
    # ~400 keeps the full first 100 visible elements on a pathological tree, at ~1.4 s on Finder;
    # the walk's cost grows with the bound, so keep it in the low hundreds. This caps the nodes
    # COLLECTED, not the walk's wall clock: a target whose AX surface exceeds the driver's own 20 s
    # walk timeout still fails at every bound (measured; a depth bound does not help there either).
    "ax_max_elements": 200,
    # Disable cua-driver's cursor overlay. None = auto (off on headless/WSL2/X11 Linux,
    # on for macOS, Windows and Linux Wayland); True also avoids macOS idle redraw CPU use.
    # True = always disable; False = always enable.
    "no_overlay": None,
    "cursor_theme": "mira.default",  # bundled, installed locally without a download
    # standard = cua-driver's own approval boundary; bounded = no runtime prompts, anything
    # outside capability_manifest fails closed. `unrestricted` is NOT accepted here: it stays on
    # the per-session YOLO toggle so config can't bypass approvals.
    "permission_mode": "standard",
    # Path (~ ok) to the reviewed manifest for permission_mode bounded; passed as
    # --capability-manifest. See cua.ai/docs/reference/cua-driver/permission-modes
    "capability_manifest": "",
    # macOS only: allow an UNSIGNED CuaDriver.app for the private-session daemon. False fails
    # closed unless signed with the official com.trycua.driver identity. Only for local driver
    # development from source.
    "allow_unsigned_driver": False,
}
