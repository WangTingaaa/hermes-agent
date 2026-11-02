"""Failed auxiliary analysis must remain a failed vision result, with fresh AX intact."""
import base64
import json
from unittest.mock import MagicMock

from tools.computer_use import tool as computer
from tools.computer_use.backend import CaptureResult, UIElement


def test_aux_timeout_is_not_presented_as_successful_visual_evidence(monkeypatch, tmp_path):
    cap = CaptureResult(mode='som', width=100, height=100, png_b64=base64.b64encode(b'fixture').decode(),
                        elements=[UIElement(index=7, role='AXButton', label='Create')])
    monkeypatch.setattr(computer, '_persist_capture_image', lambda *_args: None)
    monkeypatch.setattr(computer, '_cache_file', lambda *_args, **_kwargs: tmp_path / 'capture.png')
    monkeypatch.setattr(computer, '_should_route_through_aux_vision', lambda: True)
    monkeypatch.setattr('tools.vision_tools.vision_analyze_tool', MagicMock(return_value='coroutine-placeholder'))
    monkeypatch.setattr('model_tools._run_async', lambda _coro: json.dumps({
        'success': False, 'error': 'Request timed out', 'analysis': 'The image could not be analyzed.'}))
    result = json.loads(computer._capture_response(cap))
    assert result['vision_unavailable'] is True
    assert 'vision_analysis' not in result
    assert result['elements'][0]['index'] == 7
    assert result['elements'][0]['label'] == 'Create'
