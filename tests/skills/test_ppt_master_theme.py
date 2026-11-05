"""Selected visual material survives layout reuse without changing source text."""
import importlib
import json
import pytest
from pathlib import Path
from xml.etree import ElementTree as ET

SCRIPTS = Path(__file__).resolve().parents[2] / 'skills/productivity/ppt-master/scripts'


def test_glass_theme_keeps_text_editable_and_matches_dark_preview(tmp_path, monkeypatch):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    library = importlib.import_module('svg_library')
    (tmp_path / 'catalog.json').write_text(json.dumps({'entries': [
        {'id': 'body', 'name': 'Body', 'file': 'body.svg', 'placeholders': ['TITLE']}]}))
    (tmp_path / 'body.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#F3F6FA"/><rect x="50" y="120" width="1100" height="500" fill="#FFFFFF"/><text x="80" y="200" fill="#24324B">{{TITLE}}</text></svg>')
    target = tmp_path / 'slide.svg'
    library.render(tmp_path, 'body', {'fields': {'TITLE': '项目目标：待填写'}, 'visual_style': 'glassmorphism'}, target)
    root = ET.fromstring(target.read_text())
    ns = {'s': 'http://www.w3.org/2000/svg'}
    assert ''.join(root.itertext()) == '项目目标：待填写'
    assert root.find('s:rect', ns).get('fill') == '#080B24'
    assert root.findall('.//s:radialGradient', ns)
    assert root.findall('.//s:rect[@fill-opacity]', ns)
    assert not root.findall('.//s:image', ns)
    before = target.stat().st_mtime_ns
    library.render(tmp_path, 'body', {'fields': {'TITLE': '项目目标：待填写'}, 'visual_style': 'glassmorphism'}, target)
    assert target.stat().st_mtime_ns == before


@pytest.mark.parametrize('style,background,text', [
    ('swiss-minimal', '#F8FAFC', '#172033'),
    ('soft-rounded', '#EEF4FC', '#213651'),
    ('dark-tech', '#101827', '#F5F9FF'),
    ('editorial', '#F4F0E9', '#302D29'),
    ('data-journalism', '#F6F8F9', '#20333B'),
])
def test_selected_theme_survives_batch_fill(tmp_path, monkeypatch, style, background, text):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    build = importlib.import_module('quick_build')
    library = tmp_path / 'library'
    library.mkdir()
    (library / 'catalog.json').write_text(json.dumps({'entries': [
        {'id': 'body', 'file': 'body.svg', 'placeholders': ['TITLE']}]}))
    (library / 'body.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#F3F6FA"/><text fill="#24324B">{{TITLE}}</text></svg>')
    project = tmp_path / 'project'
    (project / 'svg_output').mkdir(parents=True)
    deck = {'visual_style': style, 'visual_reference': {'colors': {
        'background': background, 'text': text, 'accent': '#987654'}},
        'slides': [{'layout': 'body', 'fields': {'TITLE': '项目 XXX / 日期待填写'}}]}
    build._fill_deck(tmp_path, tmp_path, project, deck, library, {})
    root = ET.fromstring((project / 'svg_output/01_body.svg').read_text())
    assert root[0].get('fill') == background
    assert root[1].get('fill') == text
    assert ''.join(root.itertext()) == '项目 XXX / 日期待填写'


def test_custom_material_is_not_silently_replaced_with_light_cards(monkeypatch):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    theme = importlib.import_module('visual_theme')
    with pytest.raises(ValueError, match='custom/template route'):
        theme.resolve_theme({'visual_style': 'blueprint'})


def test_chalkboard_batch_keeps_native_text_and_chalk_outlines(tmp_path, monkeypatch):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    library = importlib.import_module('svg_library')
    (tmp_path / 'catalog.json').write_text(json.dumps({'entries': [
        {'id': 'body', 'file': 'body.svg', 'placeholders': ['TITLE']}]}))
    (tmp_path / 'body.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">'
        '<rect width="1280" height="720" fill="#F3F6FA"/>'
        '<rect x="60" y="100" width="1100" height="500" rx="18" fill="#FFFFFF"/>'
        '<rect x="60" y="200" width="1100" height="80" fill="#EBF0F6"/>'
        '<path d="M0 300 H100 V400 H0 Z" fill="#277C83"/>'
        '<text x="80" y="160" fill="#24324B">{{TITLE}}</text></svg>')
    target = tmp_path / 'slide.svg'
    library.render(tmp_path, 'body', {'fields': {'TITLE': '非洲象：数据未量化'},
                   'visual_style': 'chalkboard'}, target)
    root = ET.fromstring(target.read_text())
    ns = {'s': 'http://www.w3.org/2000/svg'}
    assert root.find('s:rect', ns).get('fill') == '#1E2B27'
    panel = root.findall('s:rect', ns)[1]
    assert panel.get('fill') == '#1E2B27'
    assert panel.get('stroke') == '#F4F1E8'
    assert root.findall('s:rect', ns)[2].get('fill') == '#1E2B27'
    assert root.find('s:path', ns).get('fill') == '#1E2B27'
    assert root.find('s:path', ns).get('stroke') == '#E7BB86'
    assert root.find('s:text', ns).get('fill') == '#F4F1E8'
    assert ''.join(root.itertext()) == '非洲象：数据未量化'
    assert not root.findall('.//s:image', ns)
