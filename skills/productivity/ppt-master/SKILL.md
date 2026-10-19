---
name: ppt-master
description: Generate editable PPTX decks with a local design workflow.
version: 1.2.0
author: Tina; Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    category: productivity
    tags: [ppt, pptx, slides, presentations, svg, 文镜]
---

# PPT Master Skill

Create editable presentations using the app-installed PPT Master package.
This is a Hermes entry point, not a replacement renderer: it preserves the
upstream templates, attribution checks, route selection and export gates.

## When to Use

- The user invokes `/ppt-master` or asks to use PPT Master to generate a PPT.
- A file-generation request calls for an editable `.pptx` with designed slides.
- Existing decks need template-based editing or visual improvement through
  this project's documented workflows.

## Prerequisites

- Desktop initialization installs the complete pinned upstream package, its
  independent PM environment, and the common SVG layout library automatically.
- Run `doctor` without `--root`: it resolves the current profile's managed
  runtime and prints the absolute skill directory and interpreter. An explicit
  `--root` is an optional override for a separately prepared developer checkout.
- `terminal` executes helpers; `read_file` loads runtime instructions and source
  material; `write_file` creates project assets. Use `web_search`/`web_extract`
  only when the selected workflow or user task needs research.

## How to Run

Retain this skill's absolute directory as `BRIDGE_DIR` and the managed runtime
root from `doctor` as `PPT_ROOT`. Expand these placeholders to actual paths in
each `terminal` call; never infer them from the current directory.

```text
python "<BRIDGE_DIR>/scripts/ppt_master.py" doctor
python "<BRIDGE_DIR>/scripts/ppt_master.py" run project_manager.py init <name> --dir "<output-parent>"
```

First run `doctor` to resolve the managed runtime, then use `read_file` on its
returned `entrypoint`, retaining its absolute directory as upstream `SKILL_DIR`.
Doctor checks attribution, dependencies and the independent interpreter.
Follow its absolute `routing` path and the selected runtime. The mandatory
attribution check has already run for this invocation; never alter or bypass it.

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

1. Run `doctor`, then read its returned upstream entry point; if it fails, report the concrete missing path/dependency or
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

## Source Fidelity Versus Template Demand

A requested structure routinely outruns its source. A deck brief can ask for a
metrics page, a chart, or a problem analysis while the source supplies only
prose. Resolve it without inventing evidence:

- Keep the requested page order and section set; carry an unsupported slot with
  qualitative native geometry (sequence chains, hub-and-spoke, opposing fields,
  ordinal lists, clipped-corner blocks) instead of a value-driven chart.
- Label the gap on the page — `定性 / 未量化 / 待核实` — and state in the delivery
  message which page needs what data to become a real chart. Never synthesize
  figures, axes, shares, or percentages to fill a chart or KPI slot.
- Tag each page's claims as fact / inference / recommendation when the brief is
  source-based, keep quoted source wording literal, and mark your own
  structure as your reading (`整理` / `our reading`) rather than the source's.
- Do not embed the source page itself as an image to "use the material". A page
  that carries facts as text brings its own layout and unreadable small type;
  carry the content natively and say why no image was placed.

## Reuse Before Authoring

For speed-sensitive Quick Generate requests, read [performance.md](references/performance.md).
It defines the Hermes batch helpers and a contact-sheet-first review cadence.
These helpers preserve attribution, the early/final SVG gates and native export
postflight. Reusing approved layouts is a user-authorized Hermes optimization;
the main agent still chooses each layout and authors its content. The bundled
upstream files remain unchanged.

For new SVG pages, search the installed common layout library before drawing a
familiar layout from scratch:

```text
python "<BRIDGE_DIR>/scripts/ppt_master.py" svg-search "process three stages"
python "<BRIDGE_DIR>/scripts/ppt_master.py" svg-render process-three-steps --data "<fields.json>" --output "<project>/svg_output/03_process.svg"
```

Search returns matching names, scenarios and required fields. For several
pages, use `svg-render-batch --jobs "<jobs.json>"`; each job contains `layout`,
`data` and an absolute `output` path. Supply every field
in JSON; `colors` and `font_family` may align the result with the selected theme.
Use the generated SVG as editable page source, not a full-slide image. Preserve
source facts and do not invent numbers to fill a layout. Follow the selected
upstream route's final checker and export gates.

For an existing PPTX whose design should survive, select Edit Native PPTX:
import the original `.pptx` with `--roundtrip`, retain existing pages, and copy
suitable source pages as skeletons for additions. Never substitute parsed
Markdown or a screenshot for the original file. The user's explicit output
mapping and requested additions are the authorized scope; ask only for missing
content decisions that materially affect the result.

Read only the selected route and its triggered references. Batch independent
page work; return compact diagnostic summaries. After repairs, recheck modified
pages and the final deck once, then deliver when its gates pass.

## Pitfalls

- Do not switch the default upstream runtime to Quick unless the request calls
  for it; Quick and Default have different gates and output directories.
- Do not run `finalize_svg.py` in Quick mode; its exporter consumes `svg_output`.
- Do not mutate past messages, the system prompt or the active toolset to enable
  this skill. Discovery/configuration changes take effect in a new session.
- Do not install the upstream requirements into Hermes's Python environment.
- If the managed runtime is missing, report an incomplete application setup;
  never search the computer for a developer checkout or silently install into
  Hermes's Python environment.

## Verification

- `doctor` must pass before generation.
- The selected runtime's SVG checker/export postflight must pass.
- Inspect/render slides with the available preview tools and check legibility,
  clipping, slide count and text. Report when visual preview is unavailable.
- Confirm that the delivered `.pptx` exists and its package contains native
  slide content, rather than relying on a successful process exit alone.

Upstream: PPT Master by Hugo He, MIT, https://github.com/hugohe3/ppt-master.
The local upstream package retains its own LICENSE and attribution files.
