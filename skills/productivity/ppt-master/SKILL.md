---
name: ppt-master
description: Generate editable PPTX decks with a local design workflow.
version: 1.0.0
author: Tina; Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    category: productivity
    tags: [ppt, pptx, slides, presentations, svg, 文镜]
    config:
      - key: ppt_master_root
        description: Absolute path to the local PPT Master repository.
        prompt: Where is the local PPT Master repository?
---

# PPT Master Skill

Create editable presentations using a separately installed PPT Master package.
This is a Hermes entry point, not a replacement renderer: it preserves the
upstream templates, attribution checks, route selection and export gates.

## When to Use

- The user invokes `/ppt-master` or asks to use PPT Master to generate a PPT.
- A file-generation request calls for an editable `.pptx` with designed slides.
- Existing decks need template-based editing or visual improvement through
  this project's documented workflows.

## Prerequisites

- `skills.config.ppt_master_root` identifies the repository. Use the resolved
  skill configuration supplied by Hermes; do not assume a machine-specific path.
- The repository contains `skills/ppt-master/SKILL.md` and its original assets.
- Its own `.venv` supplies dependencies. Keep those separate from Hermes PM.
- `terminal` executes helpers; `read_file` loads runtime instructions and source
  material; `write_file` creates project assets. Use `web_search`/`web_extract`
  only when the selected workflow or user task needs research.

## How to Run

Retain this skill's absolute directory as `BRIDGE_DIR` and the configured
repository as `PPT_ROOT`. Expand these placeholders to actual paths in each
`terminal` call; never infer them from the current directory.

```text
python "<BRIDGE_DIR>/scripts/ppt_master.py" --root "<PPT_ROOT>" doctor
python "<BRIDGE_DIR>/scripts/ppt_master.py" --root "<PPT_ROOT>" run project_manager.py init <name> --dir "<output-parent>"
```

First use `read_file` on `<PPT_ROOT>/skills/ppt-master/SKILL.md`, retaining
that absolute directory as upstream `SKILL_DIR`. Then `doctor` checks the
original attribution gate, dependencies and interpreter,
then returns JSON with the absolute upstream `skill_dir`, `entrypoint` and
`routing` paths. Verify these paths match the entry point just read and follow its selected
runtime. Its mandatory attribution
check has already run for this invocation; do not alter or bypass it.

For upstream commands, invoke the returned independent Python interpreter with
absolute script paths, or use `run <script-relative-to-upstream-scripts> <args>`.
Keep stdout separate from stderr when consuming JSON.

## Quick Reference

- Generate a deck: the upstream entry point selects the appropriate route.
- Explicit “quick”, “fast”, “快速” or “直接生成” requests use its Quick profile.
- An existing native PPTX plus new content uses its native editing route.
- Reusable brand/style/layout/deck creation uses its template route.
- Page-image reconstruction is upstream Codex-only; do not offer it as a
  supported Hermes mode. Ordinary source-based PPTX generation is supported.

## Procedure

1. Read the upstream entry point, then run `doctor`; if it fails, report the concrete missing path/dependency or
   attribution failure. Never modify the official integrity gate.
2. Read the upstream routing authority. Load only the selected
   runtime and the references it triggers. Adapt tool names to Hermes native
   tools without changing the workflow's artifact contracts.
3. Use the user's topic, attached sources, page count, language and selected
   DeepResearch template/settings as the brief. Resolve only missing facts;
   do not replace explicit settings with this skill's defaults.
4. Initialize under the user's output location or the current task workspace,
   retaining the exact absolute project path returned by initialization. Keep
   user outputs outside the skill/runtime directories.
5. Follow the selected planning, SVG authoring, quality checking and export
   procedure. A topic-only brief requires the runtime's source-intake research.
6. Deliver the actual `.pptx` and a supported file link. Keep the project assets
   available for revision; include source references where the brief asks for
   them. Do not claim that a textual outline is a generated deck.

## Pitfalls

- Do not switch the default upstream runtime to Quick unless the request calls
  for it; Quick and Default have different gates and output directories.
- Do not run `finalize_svg.py` in Quick mode; its exporter consumes `svg_output`.
- Do not mutate past messages, the system prompt or the active toolset to enable
  this skill. Discovery/configuration changes take effect in a new session.
- Do not install the upstream requirements into Hermes's Python environment.
- This adapter depends on a local installation; on another machine configure
  its actual repository path and prepare its independent environment first.

## Verification

- `doctor` must pass before generation.
- The selected runtime's SVG checker/export postflight must pass.
- Inspect/render slides with the available preview tools and check legibility,
  clipping, slide count and text. Report when visual preview is unavailable.
- Confirm that the delivered `.pptx` exists and its package contains native
  slide content, rather than relying on a successful process exit alone.

Upstream: PPT Master by Hugo He, MIT, https://github.com/hugohe3/ppt-master.
The local upstream package retains its own LICENSE and attribution files.
