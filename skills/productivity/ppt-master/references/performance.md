# Faster PPT generation

Use this for explicit speed requests and the DeepResearch Quick Generate contract.
Keep the requested facts, language, page count, template, theme and notes setting.
No extra user approval is introduced by the helpers' `review_required` status:
it means the current agent reviews the preview before export.

## Ordinary Quick Generate

1. Run `doctor` once; use its independent interpreter and absolute upstream
   paths. Read selected references once in a batch. Do not rediscover paths,
   probe several Python environments or repeatedly inspect CLI help.
2. Choose layouts by page job and selected visual style. `svg-catalog` returns
   all names, scenarios and field schemas in one call; `svg-search` handles a
   narrow query. Common layouts are editable page sources, not screenshots.
3. If the common layouts fit the requested theme and structure, author one
   content JSON input, then prepare all pages in one invocation:

```text
python "<BRIDGE_DIR>/scripts/ppt_master.py" svg-catalog
python "<BRIDGE_DIR>/scripts/ppt_master.py" quick-prepare "<project>" --deck "<slides.json>"
```

`slides.json` is renderer input, not a strategy/spec/lock or a reasoning log:

```json
{"font_family":"Microsoft YaHei","colors":{"accent":"#277C83"},"slides":[
  {"layout":"three-pillars","fields":{"TITLE":"Three priorities","SUBTITLE":"Based on the supplied material","ITEM_1_TITLE":"Product","ITEM_1_BODY":"First source-backed point.","ITEM_2_TITLE":"Users","ITEM_2_BODY":"Second source-backed point.","ITEM_3_TITLE":"Delivery","ITEM_3_BODY":"Third source-backed point.","SOURCE":"Source document"},"notes":"Speaker notes for this page."}
]}
```

Supply all required fields. Paragraphs wrap inside the existing zone; text that
cannot fit is rejected, never shortened or rasterized. Notes, when present,
must cover every slide. The helper retains the early gate after page 5 for a
new roster of 7+ slides, then runs the final gate and renders contact sheets.
It replaces a separate `svg-render-batch` pass; do not run both on the same input.
Do not apply common geometry over a binding Layout/Deck/Master or an incompatible
canvas/style. For custom pages, author the SVGs directly and run
`quick-prepare "<project>"` without `--deck` after the route's early checkpoint.

4. Review the returned carrier receipts against the chosen page jobs and inspect
   each contact sheet once. Sheets contain up to 12 pages; use focused closeups
   only for unreadable or suspicious areas. Avoid successive per-page vision
   calls for pages already covered by a readable sheet. Preserve chart/data
   verification and any explicitly requested visual-review stage.
5. Repair concrete findings together. Re-run `quick-prepare` without `--deck`
   after direct SVG edits; passing the deck input again regenerates those SVGs.
   Export once when the current final gate and review pass:

```text
python "<BRIDGE_DIR>/scripts/ppt_master.py" quick-export "<project>" --with-notes --output "<new-file.pptx>"
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

## Existing PPTX

Retain Edit Native PPTX for native-design preservation. Do not use the Quick
helpers on a roundtrip workspace. Read `authoring_summary.json`, inspect the
selected reference pages, copy their geometry and edit only affected content.
Keep the native route's checks, review additions together and export once.
