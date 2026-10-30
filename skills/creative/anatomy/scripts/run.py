"""Run Anatomy with Hermes's installed Node and Chromium; never install tools."""

import os
from pathlib import Path
import subprocess
import sys


def runtime():
    from hermes_platform.resolver import locate_command
    from pm import installed_package

    node = installed_package("node", allow_outdated=True)
    command = (str(node.binary),) if node and node.binary else locate_command("node").command
    if not command:
        raise RuntimeError("Node.js is missing. Install it through Hermes package management.")
    env = os.environ.copy()
    chromium = installed_package("chromium", allow_outdated=True)
    browser = env.get("CHROME_PATH") or env.get("AGENT_BROWSER_EXECUTABLE_PATH")
    if not browser and chromium and chromium.binary:
        browser = str(chromium.binary)
    if browser:
        env["CHROME_PATH"] = browser
    return command, env


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    if not args or args == ["--help"]:
        print("Usage: python run.py --check | <script.mjs> [arguments...]")
        return 0
    command, env = runtime()
    version = subprocess.check_output([*command, "--version"], env=env, text=True, timeout=10).strip()
    parts = tuple(int(p) for p in version.lstrip("v").split(".")[:2])
    if parts < (20, 10):
        raise RuntimeError(f"Node.js 20.10+ required; found {version}.")
    if args == ["--check"]:
        print(f"Node: {command[0]} ({version})")
        browser = env.get("CHROME_PATH")
        print(f"Chromium: {browser or 'not managed; capture scripts will check system Chrome'}")
        if browser and not Path(browser).is_file():
            raise RuntimeError(f"Configured Chromium does not exist: {browser}")
        return 0
    return subprocess.run([*command, *args], env=env, check=False, timeout=7200).returncode


if __name__ == "__main__":
    raise SystemExit(main())
