"""Match and fill editable SVG layouts without asking the model to redraw them."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from xml.sax.saxutils import escape
from xml.etree import ElementTree


def library_root() -> Path:
    from runtime_install import state_path
    state = json.loads(state_path().read_text(encoding="utf-8"))
    return Path(state["svg_library"])


def search(root: Path, query: str, count: int = 5) -> list[dict]:
    entries = json.loads((root / "catalog.json").read_text(encoding="utf-8"))["entries"]
    words = re.findall(r"[a-z0-9-]+|[\u4e00-\u9fff]+", query.lower())
    scored = []
    for entry in entries:
        terms = [entry["id"], entry["name"], *entry["scenes"]]
        score = sum(3 if term.lower() in query.lower() else
                    int(any(word in term.lower() for word in words)) for term in terms)
        if score:
            scored.append({**entry, "score": score})
    return sorted(scored, key=lambda entry: (-entry["score"], entry["id"]))[:count]


def render(root: Path, name: str, data: dict, output: Path) -> dict:
    entries = json.loads((root / "catalog.json").read_text(encoding="utf-8"))["entries"]
    entry = next((item for item in entries if item["id"] == name or item["name"] == name), None)
    if entry is None:
        raise ValueError(f"Unknown SVG layout: {name}")
    fields = data.get("fields", data)
    missing = [key for key in entry["placeholders"] if key not in fields]
    if missing:
        raise ValueError(f"Missing SVG fields: {', '.join(missing)}")
    source = (root / entry["file"]).read_text(encoding="utf-8")
    svg = source
    from visual_theme import resolve_theme, apply_material
    style = data.get("visual_style")
    palette = resolve_theme(data)
    colors = {"#14233B": "primary", "#277C83": "accent", "#F3F6FA": "background",
              "#24324B": "text", "#65748B": "muted", "#FFFFFF": "surface"}
    replacements = {}
    for original, role in colors.items():
        replacement = palette.get(role)
        if replacement:
            if not re.fullmatch(r"#[0-9a-fA-F]{6}", replacement):
                raise ValueError(f"Invalid {role} color; use #RRGGBB")
            replacements[original] = replacement
    if replacements:
        svg = re.sub("|".join(map(re.escape, replacements)), lambda match: replacements[match[0]], svg)
    font = data.get("font_family")
    if font:
        svg = svg.replace('font-family="Microsoft YaHei"', 'font-family="' + escape(font, {'"': '&quot;'}) + '"')
    svg = apply_material(svg, style, palette)
    svg = _fill_text_fields(svg, fields)
    ElementTree.fromstring(svg)
    output.parent.mkdir(parents=True, exist_ok=True)
    if not output.exists() or output.read_text(encoding="utf-8") != svg:
        output.write_text(svg, encoding="utf-8")
    return {"ok": True, "layout": entry["id"], "output": str(output), "editable": True}


def _fill_text_fields(source: str, fields: dict) -> str:
    """Fill complete and mixed labels; reject overflow before writing any SVG."""
    namespace = "http://www.w3.org/2000/svg"
    ElementTree.register_namespace("", namespace)
    root = ElementTree.fromstring(source)
    _group_connectors(root, namespace)
    parents = {child: parent for parent in root.iter() for child in parent}
    for node in root.iter(f"{{{namespace}}}text"):
        original = node.text or ""
        keys = re.findall(r"\{\{([A-Z0-9_]+)\}\}", original)
        if not keys:
            continue
        text = re.sub(r"\{\{([A-Z0-9_]+)\}\}", lambda match: str(fields[match[1]]), original)
        node.text = text
        parent = parents.get(node)
        while parent is not None and "data-pptx-bounds" not in parent.attrib:
            parent = parents.get(parent)
        if parent is None:
            continue
        _bx, by, _width, height = map(float, parent.attrib["data-pptx-bounds"].split())
        x, y = float(node.get("x", "0")), float(node.get("y", "0"))
        size = float(node.get("font-size", "20"))
        available = _text_width(node, parent)
        if available <= 0:
            continue
        lines = _lines(text, available / size / 1.08)
        flow = any(re.search(r"BODY|SUMMARY|QUOTE|MESSAGE|INSIGHT|CTA|DETAIL|ACCEPTANCE|NOTE", key) for key in keys)
        if flow and any(not isinstance(fields[key], str) for key in keys):
            raise ValueError(f"SVG field {', '.join(keys)} must be text")
        if not flow:
            if len(lines) > 1:
                raise ValueError(f"SVG field {', '.join(keys)} exceeds its layout zone; use a shorter heading or a roomier layout")
            continue
        bottom = by + height - size * 0.25
        following = [float(other.get("y", "0")) - float(other.get("font-size", "20")) * 0.85 - size * 0.2
                     for other in parent.iter(f"{{{namespace}}}text") if float(other.get("y", "0")) > y]
        if following:
            bottom = min(bottom, min(following))
        if y + (len(lines) - 1) * size * 1.45 > bottom:
            raise ValueError(f"SVG field {', '.join(keys)} exceeds its layout zone; choose a roomier layout or distribute the content across pages")
        node.text = None
        for index, line in enumerate(lines):
            span = ElementTree.SubElement(node, f"{{{namespace}}}tspan", {"x": str(x), "y": str(y + index * size * 1.45)})
            span.text = line
    return ElementTree.tostring(root, encoding="unicode")


def _group_connectors(root, namespace: str) -> None:
    connectors = [node for node in root if node.tag == f"{{{namespace}}}line"
                  and node.get("data-pptx-role") is None]
    if not connectors:
        return
    content = [node for node in root if node in connectors or
               (node.tag == f"{{{namespace}}}g" and node.get("id") not in
                {"slide-heading", "slide-footer"})]
    xs = [float(node.get(key, "0")) for node in connectors for key in ("x1", "x2")]
    ys = [float(node.get(key, "0")) for node in connectors for key in ("y1", "y2")]
    for node in content:
        if "data-pptx-bounds" in node.attrib:
            x, y, width, height = map(float, node.attrib["data-pptx-bounds"].split())
            xs.extend((x, x + width))
            ys.extend((y, y + height))
    x, y = min(xs), min(ys)
    bounds = f"{x:g} {y:g} {max(max(xs) - x, 1):g} {max(max(ys) - y, 1):g}"
    group = ElementTree.Element(f"{{{namespace}}}g", {
        "id": "common-layout-diagram", "data-pptx-bounds": bounds})
    root.insert(list(root).index(content[0]), group)
    for node in content:
        root.remove(node)
        group.append(node)


def _text_width(node, parent) -> float:
    """Keep same-row labels out of their neighbors, including centered text."""
    namespace = "http://www.w3.org/2000/svg"
    bx, _, width, _ = map(float, parent.attrib["data-pptx-bounds"].split())
    x, y = float(node.get("x", "0")), float(node.get("y", "0"))
    size = float(node.get("font-size", "20"))
    anchor = node.get("text-anchor", "start")
    if anchor == "middle":
        return 2 * min(x - bx, bx + width - x) - 24
    if anchor == "end":
        return x - bx - 12
    right = bx + width - 12
    for other in parent.iter(f"{{{namespace}}}text"):
        ox, oy = float(other.get("x", "0")), float(other.get("y", "0"))
        osize = float(other.get("font-size", "20"))
        if ox > x and max(y - size, oy - osize) < min(y, oy):
            right = min(right, ox - 12)
    return right - x


def _lines(text: str, capacity: float) -> list[str]:
    lines = []
    for paragraph in text.split("\n"):
        line, used = "", 0.0
        for char in paragraph:
            advance = 1.0 if unicodedata.east_asian_width(char) in "WF" else 0.64
            if line and used + advance > capacity:
                lines.append(line)
                line, used = "", 0.0
            line += char
            used += advance
        lines.append(line)
    return lines
