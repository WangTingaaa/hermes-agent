"""Apply selected materials to compatible common SVG layouts, keeping native text."""
from __future__ import annotations

from xml.etree import ElementTree as ET

NS = 'http://www.w3.org/2000/svg'
GLASS_COLORS = {
    'background': '#080B24', 'primary': '#B7ACFF', 'accent': '#8875FF',
    'text': '#F5F7FF', 'muted': '#B8C2E9', 'surface': '#26376B',
}

# These palettes match the selector previews. Materials needing different
# topology must use their custom/template route instead of these common layouts.
PALETTES = {
    'glassmorphism': GLASS_COLORS,
    'swiss-minimal': dict(background='#F8FAFC', primary='#172033', accent='#D74736',
                          text='#172033', muted='#65748B', surface='#FFFFFF'),
    'soft-rounded': dict(background='#EEF4FC', primary='#213651', accent='#3478CA',
                         text='#213651', muted='#526A87', surface='#FFFFFF'),
    'dark-tech': dict(background='#101827', primary='#40C9D4', accent='#40C9D4',
                      text='#F5F9FF', muted='#B7C8DC', surface='#203047'),
    'editorial': dict(background='#F4F0E9', primary='#302D29', accent='#AC5736',
                      text='#302D29', muted='#736A61', surface='#FAF7F1'),
    'data-journalism': dict(background='#F6F8F9', primary='#20333B', accent='#1B7385',
                            text='#20333B', muted='#576C76', surface='#FFFFFF'),
    'chalkboard': dict(background='#1E2B27', primary='#F4F1E8', accent='#E7BB86',
                       text='#F4F1E8', muted='#C3CEC4', surface='#2D3D35'),
}


def resolve_theme(data: dict) -> dict:
    """Accept the selector contract directly, with explicit overrides last."""
    style = data.get('visual_style')
    if style and style not in PALETTES:
        raise ValueError(f'Common layouts do not support {style}; use the selected custom/template route')
    reference = data.get('visual_reference') or {}
    colors = reference.get('colors') or {}
    palette = {**PALETTES.get(style, {}), **colors, **data.get('colors', {})}
    # A foreground override also owns headings; otherwise dark backgrounds can
    # retain the library's dark heading color.
    if 'text' in colors and 'primary' not in colors and 'primary' not in data.get('colors', {}):
        palette['primary'] = colors['text']
    return palette


def apply_material(svg: str, style: str | None, palette: dict) -> str:
    if style == 'chalkboard':
        return _chalkboard(svg, palette)
    if style not in ('glassmorphism', 'soft-rounded', 'swiss-minimal', 'editorial'):
        return svg
    ET.register_namespace('', NS)
    root = ET.fromstring(svg)
    if style != 'glassmorphism':
        for rect in root.iter(f'{{{NS}}}rect'):
            if rect.get('fill', '').upper() == palette['surface'].upper():
                rect.set('rx', '20' if style == 'soft-rounded' else '0')
        return ET.tostring(root, encoding='unicode')
    # The common library is 16:9; preserve its geometry and editable carriers.
    viewbox = list(map(float, root.get('viewBox', '0 0 1280 720').split()))
    width, height = viewbox[2:]
    defs = ET.Element(f'{{{NS}}}defs')
    glow = ET.SubElement(defs, f'{{{NS}}}radialGradient', id='mira-glass-glow')
    ET.SubElement(glow, f'{{{NS}}}stop', offset='0', attrib={'stop-color': palette['accent'], 'stop-opacity': '.55'})
    ET.SubElement(glow, f'{{{NS}}}stop', offset='1', attrib={'stop-color': palette['background'], 'stop-opacity': '0'})
    for node in root.iter(f'{{{NS}}}text'):
        if node.get('fill', '').upper() in {palette['background'].upper(), palette['surface'].upper()}:
            node.set('fill', palette['text'])
    rectangles = list(root.iter(f'{{{NS}}}rect'))
    for rect in rectangles:
        if rect.get('fill', '').upper() in {palette['surface'].upper(), palette['primary'].upper()}:
            rect.set('fill', palette['surface'])
            rect.set('fill-opacity', '.58')
            rect.set('stroke', palette['primary'])
            rect.set('stroke-opacity', '.45')
            rect.set('stroke-width', '1')
            rect.set('rx', '18')
    root.insert(0, defs)
    # Insert light behind content and above the full-canvas background.
    background = next((node for node in root if node.tag == f'{{{NS}}}rect'
                       and node.get('fill', '').upper() == palette['background'].upper()), None)
    position = list(root).index(background) + 1 if background is not None else 1
    for index, (cx, cy, radius) in enumerate(((width * .8, height * .15, width * .48),
                           (width * .1, height * .9, width * .32)), 1):
        root.insert(position, ET.Element(f'{{{NS}}}circle', cx=str(cx), cy=str(cy),
                    r=str(radius), fill='url(#mira-glass-glow)',
                    attrib={'data-pptx-role': 'decoration', 'id': f'mira-glass-light-{index}'}))
    return ET.tostring(root, encoding='unicode')


def _chalkboard(svg: str, palette: dict) -> str:
    """Use native chalk outlines instead of filled business cards on the board."""
    ET.register_namespace('', NS)
    root = ET.fromstring(svg)
    panel_colors = {palette['surface'].upper(), palette['primary'].upper(),
                    '#EBF0F6', '#216171', '#4B999D'}
    for node in root.iter():
        if node.tag == f'{{{NS}}}text':
            # Labels originally knocked out of a dark badge must remain legible
            # when that badge becomes an outline on the dark board.
            if node.get('fill', '').upper() in {palette['background'].upper(), palette['surface'].upper()}:
                node.set('fill', palette['text'])
            continue
        if node.get('fill', '').upper() in panel_colors:
            # Opaque board-colored panels mask connectors behind the text.
            node.set('fill', palette['background'])
            node.set('stroke', palette['text'])
            node.set('stroke-width', '2')
            node.set('stroke-linejoin', 'round')
            if node.tag == f'{{{NS}}}rect':
                node.set('rx', '3')
        if node.tag == f'{{{NS}}}path' and node.get('fill', '').upper() == palette['accent'].upper():
            node.set('fill', palette['background'])
            node.set('stroke', palette['accent'])
            node.set('stroke-width', '2')
        if node.get('stroke', '').upper() == '#CFD9E6':
            node.set('stroke', palette['muted'])
    return ET.tostring(root, encoding='unicode')
