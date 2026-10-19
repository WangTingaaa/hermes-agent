"""Match and fill editable SVG layouts without asking the model to redraw them."""

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
    palette = data.get("colors", {})
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
    svg = _wrap_body_fields(svg, fields)
    ElementTree.fromstring(svg)
    output.parent.mkdir(parents=True, exist_ok=True)
    if not output.exists() or output.read_text(encoding="utf-8") != svg:
        output.write_text(svg, encoding="utf-8")
    return {"ok": True, "layout": entry["id"], "output": str(output), "editable": True}


def _wrap_body_fields(source: str, fields: dict) -> str:
    """Flow paragraphs inside their existing layout zone without shortening facts."""
    namespace = "http://www.w3.org/2000/svg"
    ElementTree.register_namespace("", namespace)
    root = ElementTree.fromstring(source)
    parents = {child: parent for parent in root.iter() for child in parent}
    for node in root.iter(f"{{{namespace}}}text"):
        match = re.fullmatch(r"\{\{([A-Z0-9_]+)\}\}", node.text or "")
        if not match:
            continue
        text = fields[match[1]]
        node.text = str(text)
        if not re.search(r"BODY|SUMMARY|QUOTE|MESSAGE|INSIGHT|CTA", match[1]):
            continue
        if not isinstance(text, str):
            raise ValueError(f"SVG field {match[1]} must be text")
        parent = parents.get(node)
        while parent is not None and "data-pptx-bounds" not in parent.attrib:
            parent = parents.get(parent)
        if parent is None or node.get("text-anchor", "start") != "start":
            continue
        bx, by, width, height = map(float, parent.attrib["data-pptx-bounds"].split())
        x, y = float(node.get("x", "0")), float(node.get("y", "0"))
        size = float(node.get("font-size", "20"))
        inset = max(12, x - bx)
        available = bx + width - x - inset
        if available <= 0:
            continue
        lines = _lines(text, available / size / 1.08)
        bottom = by + height - 12 - size * 0.35
        following = [float(other.get("y", "0")) - size * 1.4
                     for other in parent.iter(f"{{{namespace}}}text") if float(other.get("y", "0")) > y]
        if following:
            bottom = min(bottom, min(following))
        if y + (len(lines) - 1) * size * 1.45 > bottom:
            raise ValueError(f"SVG field {match[1]} exceeds its layout zone; choose a roomier layout or distribute the content across pages")
        node.text = None
        for index, line in enumerate(lines):
            span = ElementTree.SubElement(node, f"{{{namespace}}}tspan", {"x": str(x), "y": str(y + index * size * 1.45)})
            span.text = line
    return ElementTree.tostring(root, encoding="unicode")


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
