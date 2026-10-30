# Hermes resource integration

This copy is bundled in `skills/creative/anatomy` and is seeded into the active
profile by Hermes's normal bundled-skill synchronization. Start a new session
after installation so `/anatomy` and the skill index can discover it without
changing the cached prompt of an existing conversation.

## Local resources

The development machine already has the resources used by information-system's
`vendor/hermes-runtime`: offline archives under `mac/bootstrap` and
`win/bootstrap`, including Node, Chromium and Python. The extracted Mira
development runtime is under `~/Library/Caches/mira-development/runtime` on this
Mac; production Hermes uses its own PM store. These are machine-local locations,
not paths to embed into generated figures.

`scripts/run.py` reads the active PM installation facts for `node` and `chromium`.
An already installed Node is accepted even if its version differs from the
current PM lock, provided it satisfies Anatomy's minimum version. The runner
checks this before executing a script. It respects an explicit `CHROME_PATH`,
then `AGENT_BROWSER_EXECUTABLE_PATH`, then the managed Chromium binary. The
upstream capture/drive scripts retain their system Chrome fallback.

Select the intended Hermes profile and runtime using the normal Hermes launch
configuration. The runner does not extract archives, download tools, mutate PM
facts or install npm packages. If PM resources are unavailable, it tries Node
through the Hermes platform resolver; the screenshot scripts can use an
installed system Chrome. Use Hermes PM to provision missing managed tools.

The `kit/`, examples and screenshot tools use Node built-ins. React examples
need the host project's React toolchain. There is no need to import the entire
information-system vendor tree or install its mesoInsights MCP server merely to
draw a figure. For document-based figures, obtain source material through the
user's already configured document tools when requested.

## Origin and changes

Upstream: https://github.com/wheresryan22/anatomy

Imported from the user's local checkout at commit
`e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f` (MIT, Ryan).
The kit, example sources, browser scripts and detailed design references are preserved.
Generated example HTML is excluded; rebuild it with each example's build script.
Two complex upstream geometry functions carry documented health exceptions so
the port preserves their behavior. The runner bounds version probes to 10 seconds
and build/audit/browser commands to two hours.
The Hermes entry point adds metadata, native-tool guidance, resource resolution
and a Python runner. Version 1.1 uses `scripts/start.py` to reuse the smallest
example as an immediately buildable, portable baseline. Read `quick-start.md`
and that baseline first; load long manuals only for a concrete feature or issue.
The dial-indicator baseline snaps to its correct reading under reduced motion
instead of waiting for its decorative spring. Adapt the baseline to the user's
request before final delivery. Upstream's original entry point is retained as
`references/original-workflow.md`; read it relative to the skill root.
Claude session accounting is optional gallery functionality and is not used by
the local Hermes drawing workflow.
