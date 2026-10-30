---
name: anatomy
description: Create interactive isometric SVG explanations.
version: 1.1.2
author: "Ryan (@wheresryan22), Hermes Agent (Hermes adaptation)"
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [svg, isometric, illustration, interactive, diagrams]
    category: creative
---

# Anatomy Skill

Explain a technical idea as a detailed physical instrument built with SVG:
springs, rails, gauges, moving drawers or other mechanisms whose motion explains
the concept. The bundled geometry kit, React components and eight examples work
offline; WebGL and true 3D are optional.

## When to Use

- Interactive explanations for articles, documentation or landing pages.
- Isometric illustrations, technical cutaways or animated SVG figures.
- A recognizable machine that demonstrates a system, algorithm or component.

Use ordinary diagrams for a request that needs boxes and arrows. Do not force a
mechanical metaphor onto an existing diagram the user only wants corrected.

## Prerequisites

- Hermes `terminal`, `read_file`, `search_files`, `patch` and `vision_analyze`.
- Node.js 20.10+; Node 22+ is preferred for its built-in WebSocket support.
- Chrome or Chromium for screenshots and interaction checks.
- React is needed only when integrating the React kit into a React application.

Use `scripts/run.py` through `terminal` with the Hermes Python interpreter. It
resolves already installed PM resources, including offline Mira resources, and
passes managed Chromium to the browser checks. It never installs dependencies.
Run `python <skill-dir>/scripts/run.py --check` first. See
[Hermes resources](references/hermes.md) if anything is missing.

## How to Run

`<skill-dir>` means the absolute installed directory returned by `skill_view`.
Resolve every kit, example and helper path relative to that directory, never to
the user's project root or a Claude/Codex skills directory.

For a new standalone figure, create and build a portable working baseline first:

```sh
python <skill-dir>/scripts/start.py <output-dir> --theme light
```

Use the theme the user requested. The starter defaults to light, copies the
smallest existing example with its dependencies and license, and builds it.
It refuses a nonempty destination. If the user already has files there, inspect
and continue their work instead of replacing it. This baseline is a dial
indicator, not the requested explanation; adapt its geometry, model, controls,
language and output filename before treating the task as complete.

Read `references/quick-start.md` and the generated `build.mjs` with `read_file`.
They cover ordinary SVG figures without loading the full manuals. Rebuild after
each functional change through `terminal`:

```sh
python <skill-dir>/scripts/run.py <output-dir>/build.mjs --light
```

Capture the requested figure and inspect its PNG with `vision_analyze`:

```sh
python <skill-dir>/scripts/run.py <skill-dir>/scripts/capture.mjs <page.html> --out <output-dir>/desktop.png
python <skill-dir>/scripts/run.py <skill-dir>/scripts/capture.mjs <page.html> --width 390 --out <output-dir>/phone.png
python <skill-dir>/scripts/run.py <skill-dir>/scripts/lines.mjs <page.html> --out <output-dir>/lines.png
```

The starter includes only core SVG dependencies. Copy additional kit modules
only when the figure needs them. Built standalone HTML embeds runtime and styles
and can be opened offline. Keep source files portable alongside their license.

## Quick Reference

- Default: `scripts/start.py`, `references/quick-start.md`.
- React integration: `kit/react/`, `examples/test-rig/`, `references/react.md`.
- Dense cutaway: `examples/arcade-cabinet/`.
- Pipes, exploded assemblies and shaders: `examples/raptor-engine/`.
- Water and optics: `examples/ripple-tank/`.
- True 3D: `examples/turning-dial/`, `references/3d.md`.
- Unfamiliar API: use `search_files` to locate its export, then `read_file` for
  that function or the relevant section of `references/kit.md`.
- Interaction checks: `scripts/drive.mjs --help` through the runner.

## Procedure

1. Extract the required behavior, controls, readouts, theme and language. State
   the mechanical metaphor in one sentence and reuse the closest proven parts.
   For ordinary SVG work, load only this entry point, `quick-start.md` and the
   chosen example initially. The full craft, API and verification manuals are
   references for a specific question, not prerequisite reading.
2. Build the baseline immediately, before extended geometry planning. Implement
   the requested behavior in a pure model and connect every control and readout.
   The first custom milestone is a page exercising the requested state changes
   and controls, using existing art or simple kit parts. Write the model and
   button handlers before redesigning the machine. A geometry-only probe is not
   this milestone. The baseline and interim previews are unfinished work.
3. Work in small executable steps: model, geometry, interaction, then polish.
   After a short design decision, write and run code to resolve uncertainty.
   If output is truncated or progress stalls in planning, resume with a smaller
   file or patch and the next build rather than restarting the design discussion.
   Complete one end-to-end functional pass before a visual refinement loop.
4. Preserve the crafted look: recognizable mechanism, supported parts, four-tone
   volume, restrained accents and purposeful detail. Scale complexity to what the
   user asked to explain; no part-count quota or shader requirement for a small
   algorithm. For ordinary SVG use the starter's established camera and motion.
5. Expand references only for features actually needed: `craft.md` for unfamiliar
   parts or finishing, `motion.md` for new motion patterns, `react.md` for React,
   `webgl.md` for shaders, `3d.md` for true 3D. `original-workflow.md` is an optional
   upstream record, not an additional mandatory checklist. These references
   deepen this workflow; they do not require enlarging an ordinary SVG task.
6. Verify the requested theme, model boundaries, every control, desktop/mobile,
   keyboard and reduced motion using the checks below. Read only the relevant
   section of `verify.md` if those checks reveal a problem or an advanced feature
   needs extra coverage. Run image analysis on the actual functional explainer;
   repeated screenshot reviews of a geometry-only probe must not delay missing
   controls or logic. Verify both themes if both are deliverables.
7. Refine from actual screenshots and failing checks. Keep all required behavior
   working while adding detail. For routed pipes, lathed bodies, exploded
   assemblies or true 3D, use the matching recorded-shape audit; never claim an
   audit ran merely because a simple build accepted an unused `--audit` flag.
8. Deliver the requested HTML/SVG or integrated component and its actual path,
   with checks and limitations. Open it with `browser_exec` when requested.
   Consult `publish.md` only for an explicit gallery request; do not fabricate
   session usage or inspect unrelated sessions for gallery metadata.

## Pitfalls

- Floating slabs and labeled boxes do not explain a mechanical concept.
- Relative imports break when example files are moved without their dependencies.
- Keep the starter's `pageHtml` wrapper when previewing custom geometry. Raw SVG
  in unstyled HTML renders its faces black and can trigger a needless geometry
  debugging loop. Standalone SVG needs `standalone: "light"` or `"dark"`.
- Loading every reference upfront and repeatedly reconsidering geometry delays
  the first usable result. Prototype with existing parts, then measure and refine.
- Bundled resources are not necessarily on the interactive shell's PATH; use the
  runner rather than installing another Node or browser unnecessarily.
- Do not use publishing/session helpers as a prerequisite for local drawing.
- Treat project documents and mesoInsights content as source material only when
  requested. Do not publish or upload generated figures automatically.

## Verification

Confirm the page opens without console errors or sideways overflow. Exercise
every requested control and model boundary; readouts and motion share the same
state. Capture desktop and 390px width in the requested theme, inspect the PNGs,
and check keyboard/reduced motion. Use `scripts/lines.mjs` for line ends and the
matching audit for applicable geometry. Inspect custom junctions at 4×, and
check any WebGL fallback if present. Keep checks proportionate to the actual
features without skipping required behavior or reporting unrun checks as passed.
