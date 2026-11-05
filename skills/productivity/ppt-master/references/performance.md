# Faster PPT generation

Use this for explicit speed requests and the DeepResearch Quick Generate contract.
Keep the requested facts, language, page count, template, theme and notes setting.
No extra user approval is introduced by the helpers' `review_required` status:
it means the current agent reviews the preview before export.

## Ordinary Quick Generate

1. Run `doctor` once; use its independent interpreter and absolute upstream
   paths. Read selected references once in a batch. Do not rediscover paths,
   probe several Python environments or repeatedly inspect CLI help. The bridge
   bootstraps from the terminal's explicit profile and delegates to the installed
   interpreter. A missing runtime is a setup error, not permission to search the
   filesystem for another checkout.
2. Read the selected route's mandatory reference/capability batch once. Freeze
   one concise roster: each page's source-backed takeaway, layout/carrier and
   notes. A template's metric slot without source measurements is qualitative
   and visibly marked `未量化 / 待核实`; this is a resolved source gap, not a reason
   to invent numbers or revisit the planning decision on every page.
   Choose layouts by page job and selected visual style. `svg-catalog` returns
   all names, scenarios and field schemas in one call; `svg-search` handles a
   narrow query. Common layouts are editable page sources, not screenshots.
3. If the common layouts fit the requested theme and structure, author one
   content JSON input, then prepare all pages in one invocation:

```text
python3 "<BRIDGE_DIR>/scripts/ppt_master.py" svg-catalog
python3 "<BRIDGE_DIR>/scripts/ppt_master.py" quick-prepare "<project>" --deck "<slides.json>"
```

`slides.json` is renderer input, not a strategy/spec/lock or a reasoning log:

Copy `visual_style` and `visual_reference` directly from the user's execution
contract into the deck JSON. The helper resolves the preview palette itself;
do not translate or omit those fields. Common layouts support `glassmorphism`,
`swiss-minimal`, `soft-rounded`, `dark-tech`, `editorial`, `data-journalism` and
`chalkboard` (dark slate, chalk outlines and pastel accents, all native/editable).
Other selected styles require custom/template authoring; an unsupported style
is rejected instead of silently producing the default light theme.

```json
{"visual_style":"glassmorphism","font_family":"Microsoft YaHei","colors":{"accent":"#8875FF"},"slides":[
  {"layout":"three-pillars","fields":{"TITLE":"Three priorities","SUBTITLE":"Based on the supplied material","ITEM_1_TITLE":"Product","ITEM_1_BODY":"First source-backed point.","ITEM_2_TITLE":"Users","ITEM_2_BODY":"Second source-backed point.","ITEM_3_TITLE":"Delivery","ITEM_3_BODY":"Third source-backed point.","SOURCE":"Source document"},"notes":"Speaker notes for this page."}
]}
```

Supply all required fields. Paragraphs wrap inside the existing zone; text that
cannot fit is rejected, never shortened or rasterized. Notes, when present,
must cover every slide. The helper retains the early gate after page 5 for a
new roster of 7+ slides, then runs the final gate and renders contact sheets.
It replaces a separate `svg-render-batch` pass; do not run both on the same input.
Common-layout preparation also compacts inherited styles before the final gate.
Headings and same-row labels are checked against their available slot before
writing; keep headings short and retain the full explanation in body text/notes.
Do not add pages or drop facts to repair a slot; choose compatible geometry or
redistribute content within the requested roster.
Do not apply common geometry over a binding Layout/Deck/Master or an incompatible
canvas/style. For custom pages, write one project-local authoring script that
reuses the deck's geometry, typography and icon setup. Write pages 1–5 in one
batch, run the documented early checker once when required, then write the
remaining pages in one batch. This remains main-agent authoring, with each page
retaining its own content and topology decisions. Do not check before page 5
merely to test a pattern. Finally run `quick-prepare "<project>"` without `--deck`.

Use the official checker's JSON report and `validation/quick-*.log` to repair
concrete errors together. Before an actual checker/export failure, do not inspect
checker, exporter, project-manager or native-data implementation source to guess
their rules. If a failure genuinely requires source-level diagnosis, read only
the reported subsystem once and return to authoring; additional inspection
requires new error evidence. Keep required contract documentation and capability
discovery; do not replace them with code tours.

4. Review the returned carrier receipts against the chosen page jobs and inspect
   each contact sheet once. Sheets contain up to 12 pages; use focused closeups
   only for unreadable or suspicious areas. Avoid successive per-page vision
   calls for pages already covered by a readable sheet. Preserve chart/data
   verification and any explicitly requested visual-review stage.
5. Repair concrete findings together. Re-run `quick-prepare` without `--deck`
   after direct SVG edits; passing the deck input again regenerates those SVGs.
   Export once when the current final gate and review pass:

```text
python3 "<BRIDGE_DIR>/scripts/ppt_master.py" quick-export "<project>" --with-notes --output "<new-file.pptx>"
```

Use `--no-notes` when disabled. Add `--native-charts-and-tables` when the route
requires it. The helper splits enabled notes and delegates to the official
exporter, which rejects stale fingerprints and runs package postflight. Inspect
its compact JSON receipt; do not re-count shapes, re-open the ZIP, search for
another renderer or run multiple speculative checks after a passing postflight.
An absent PowerPoint renderer is reported honestly; the contact sheet is an SVG
preview. A specific rendering concern or user request can justify further checks.

Timing reports and detailed failure logs are in `validation/quick-*.json` and
`validation/quick-*.log`. Measure preparation/export separately from content
reasoning and external model/vision latency; do not promise an end-to-end time
from the script-only timings.

For a supplied planning template, preserve its placeholders and use its headings
as the content roster. Do not research missing project facts. Spend the generation
budget on writing one compact content JSON, not a long bespoke rendering program.
If `doctor` fails, stop with its concrete setup diagnostic; environment repair
belongs to app setup, not to the generation agent. A 360-second target includes
model and tool latency and is not a timeout or permission to skip validation.

## Existing PPTX

Retain Edit Native PPTX for native-design preservation. Do not use the Quick
helpers on a roundtrip workspace. Read `authoring_summary.json`, inspect the
selected reference pages, copy their geometry and edit only affected content.
Keep the native route's checks, review additions together and export once.

Use the selected preview palette and material consistently on every page. The common
SVG renderer supports `visual_style: "glassmorphism"` with native gradient light
and translucent panels; do not use plain light cards for the dark glass preview.
For unsupported materials or a binding template, keep the custom/template route.
