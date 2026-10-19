"""Batch SVG preparation and verified export for ordinary Quick Generate projects."""

import json
import re
import subprocess
import time
from pathlib import Path


class BuildFailure(ValueError):
    """A required upstream stage failed; the project contains its diagnostics."""


def _run(skill: Path, python: Path, project: Path, script: str, args: list[str],
         stage: str, timings: dict) -> None:
    started = time.perf_counter()
    result = subprocess.run([str(python), str(skill / "scripts" / script), *args],
                            capture_output=True, text=True, timeout=3600)
    timings[stage] = round(time.perf_counter() - started, 3)
    log = project / "validation" / f"quick-{stage}.log"
    log.write_text(result.stdout + "\n" + result.stderr, encoding="utf-8")
    if result.returncode:
        raise BuildFailure(f"{stage} failed; inspect {log}\n{(result.stdout + result.stderr)[-1800:]}")


def _project(project: Path) -> Path:
    project = project.resolve()
    if not (project / "svg_output").is_dir():
        raise ValueError("Initialize a Quick Generate project before preparing slides")
    if any((project / name).exists() for name in ("design_spec.md", "spec_lock.md", "page_plan.json")):
        raise ValueError("Quick helpers cannot process Default or Edit Native PPTX projects")
    (project / "validation").mkdir(exist_ok=True)
    return project


def _checker(skill: Path, python: Path, project: Path, stage: str, timings: dict) -> None:
    _run(skill, python, project, "svg_quality_checker.py", [str(project), "--quick-generate",
         "--canonical-authoring", "--stage", stage, "--json"], stage, timings)


def _fill_deck(skill: Path, python: Path, project: Path, deck: dict, library: Path, timings: dict) -> None:
    from svg_library import render

    if not isinstance(deck, dict):
        raise ValueError("Deck input must be a JSON object")
    slides = deck.get("slides")
    if not isinstance(slides, list) or not slides:
        raise ValueError("slides must be a non-empty array")
    if any(not isinstance(slide, dict) or not isinstance(slide.get("layout"), str)
           or not isinstance(slide.get("fields"), dict) for slide in slides):
        raise ValueError("Every slide needs a layout ID and fields object")
    names = [f"{index:02d}_{slide['layout']}" for index, slide in enumerate(slides, 1)]
    if any(not re.fullmatch(r"[A-Za-z0-9_-]+", name) for name in names):
        raise ValueError("Use an SVG catalog layout ID for every slide")
    existing = {file.stem for file in (project / "svg_output").glob("*.svg")}
    if existing - set(names):
        raise ValueError("Deck input must cover every existing SVG; use a new project for a different roster")
    started = time.perf_counter()
    for index, (slide, name) in enumerate(zip(slides, names), 1):
        render(library, slide["layout"], {"fields": slide["fields"],
               "colors": deck.get("colors", {}), "font_family": deck.get("font_family")},
               project / "svg_output" / f"{name}.svg")
        if not existing and len(slides) >= 7 and index == 5:
            _checker(skill, python, project, "early", timings)
    timings["svg_fill"] = round(time.perf_counter() - started - timings.get("early", 0), 3)
    if any("notes" in slide for slide in slides):
        if not all(isinstance(slide.get("notes"), str) and slide["notes"].strip() for slide in slides):
            raise ValueError("When notes are supplied, supply non-empty notes for every slide")
        notes = project / "notes"
        notes.mkdir(exist_ok=True)
        (notes / "total.md").write_text("\n\n".join(
            f"# {name}\n\n{slide['notes']}" for name, slide in zip(names, slides)) + "\n", encoding="utf-8")


def _previews(project: Path) -> list[str]:
    import io
    from PIL import Image, ImageDraw
    import resvg_py

    files = sorted((project / "svg_output").glob("*.svg"))
    if not files:
        raise ValueError("No SVG slides to preview")
    output = []
    width, gap = 600, 16
    for start in range(0, len(files), 12):
        batch = files[start:start + 12]
        thumbnails = []
        for file in batch:
            svg = file.read_text(encoding="utf-8")
            png = resvg_py.svg_to_bytes(svg_string=svg, width=width, resources_dir=str(project / "svg_output"))
            with Image.open(io.BytesIO(png)) as rendered:
                thumbnails.append(rendered.convert("RGB"))
        height = max(image.height for image in thumbnails)
        rows = (len(batch) + 2) // 3
        sheet = Image.new("RGB", (3 * (width + gap) + gap, rows * (height + 32 + gap) + gap), "#E6EBF1")
        draw = ImageDraw.Draw(sheet)
        for index, thumbnail in enumerate(thumbnails):
            x = gap + (index % 3) * (width + gap)
            y = gap + (index // 3) * (height + 32 + gap)
            draw.text((x, y), f"{start + index + 1:02d}  {batch[index].stem}", fill="#14233B")
            sheet.paste(thumbnail, (x, y + 26))
        target = project / "validation" / f"quick-preview-{start // 12 + 1:02d}.png"
        sheet.save(target)
        output.append(str(target))
    return output


def _summary(project: Path) -> dict:
    report = json.loads((project / "validation/svg_quality_report.json").read_text(encoding="utf-8"))
    receipts = []
    for item in report.get("files", []):
        carrier = item.get("info", {}).get("carrier_receipt", {})
        geometry = carrier.get("geometry", {})
        receipts.append({"file": item.get("file"), "text": carrier.get("text_elements", 0),
            "images": carrier.get("images", {}).get("placements", 0), "icons": carrier.get("icons", 0),
            "effects": {key: count for key, count in carrier.get("effects", {}).items() if count},
            "presets": geometry.get("preset_names", {}),
            "geometry": {key: count for key, count in geometry.get("svg_elements", {}).items() if count},
            "native_objects": {key: count for key, count in carrier.get("native_objects", {}).items() if count}})
    return {"report": str(project / "validation/svg_quality_report.json"),
            "summary": report.get("summary"), "carrier_receipts": receipts}


def prepare(skill: Path, python: Path, project: Path, *, deck_file: Path | None = None,
            library: Path | None = None) -> dict:
    project = _project(project)
    timings = {}
    started = time.perf_counter()
    try:
        _run(skill, python, project, "attribution_guard.py", [], "attribution", timings)
        if deck_file is not None:
            if library is None:
                raise ValueError("The SVG library is required for a deck input")
            _fill_deck(skill, python, project, json.loads(deck_file.read_text(encoding="utf-8")), library, timings)
        _checker(skill, python, project, "final", timings)
        preview_start = time.perf_counter()
        # Keep rendering dependencies in the independent runtime, never Hermes's Python.
        result = subprocess.run([str(python), str(Path(__file__).resolve()), "preview", str(project)],
                                capture_output=True, text=True, check=True, timeout=180)
        previews = json.loads(result.stdout)
        timings["preview"] = round(time.perf_counter() - preview_start, 3)
        result = {"ok": True, "status": "review_required", "project": str(project),
                  "previews": previews, "quality": _summary(project),
                  "next": "Review the contact sheets and carrier receipts, repair actual findings, then quick-export."}
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        result = {"ok": False, "error": str(error)}
    timings["total"] = round(time.perf_counter() - started, 3)
    result["seconds"] = timings
    (project / "validation/quick-prepare.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


def export(skill: Path, python: Path, project: Path, *, output: Path | None = None,
           with_notes: bool = False, native_charts_and_tables: bool = False) -> dict:
    project = _project(project)
    timings = {}
    started = time.perf_counter()
    try:
        _run(skill, python, project, "attribution_guard.py", [], "attribution", timings)
        if with_notes:
            _run(skill, python, project, "total_md_split.py", [str(project), "--quiet"], "notes", timings)
        args = [str(project), "--quick-generate", "--with-notes" if with_notes else "--no-notes", "--quiet"]
        if output is not None:
            output = output.resolve()
            if output.exists():
                raise ValueError("Output already exists; choose a new filename to preserve earlier exports")
            if output.suffix.lower() != ".pptx":
                raise ValueError("Output must have a .pptx extension")
            output.parent.mkdir(parents=True, exist_ok=True)
            args.extend(["--output", str(output)])
        if native_charts_and_tables:
            args.append("--native-charts-and-tables")
        previous = {file: file.stat().st_mtime_ns for file in (project / "validation").glob("*.report.json")}
        # The exporter verifies the final report fingerprint and package integrity itself.
        _run(skill, python, project, "svg_to_pptx.py", args, "export", timings)
        reports = sorted((file for file in (project / "validation").glob("*.report.json")
                          if file.stat().st_mtime_ns != previous.get(file)),
                         key=lambda file: file.stat().st_mtime_ns, reverse=True)
        receipt_path = next((file for file in reports if output is None or
            Path(json.loads(file.read_text(encoding="utf-8")).get("output", {}).get("path", "")) == output), None)
        if receipt_path is None:
            raise BuildFailure("Export completed without the required PPTX postflight report")
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        if receipt.get("status") not in ("passed", "passed-with-warnings"):
            raise BuildFailure(f"PPTX postflight did not pass: {receipt_path}")
        if not Path(receipt["output"]["path"]).is_file():
            raise BuildFailure("PPTX postflight output does not exist")
        result = {"ok": True, "pptx": receipt["output"]["path"], "postflight": str(receipt_path),
                  "status": receipt["status"], "package": receipt["package"],
                  "checks": receipt.get("checks", {})}
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        result = {"ok": False, "error": str(error)}
    timings["total"] = round(time.perf_counter() - started, 3)
    result["seconds"] = timings
    (project / "validation/quick-export.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3 or sys.argv[1] != "preview":
        raise SystemExit("Use ppt_master.py quick-prepare or quick-export")
    print(json.dumps(_previews(Path(sys.argv[2]))))
