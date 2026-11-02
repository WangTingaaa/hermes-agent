"""Provider-wrapped numeric arrays must validate before desktop input dispatch."""
from contextlib import contextmanager
import copy
import json
from unittest.mock import MagicMock

import pytest

import model_tools
from tools.arg_coercion import coerce_tool_args
from tools.computer_use import tool as computer
from tools.computer_use.backend import ActionResult
from tools.tool_search_validation import validate_deferred_call_args


@pytest.mark.parametrize('value', [{'item': ['152', '82']}, ['152', '82'], '["152", "82"]'])
def test_numeric_coordinates_validate_and_reach_the_registered_handler(value, monkeypatch):
    args = {'action': 'click', 'coordinate': value}
    assert validate_deferred_call_args('computer_use', args) is None
    backend = MagicMock()
    backend.click.return_value = ActionResult(ok=True, action='click', effect='confirmed')

    @contextmanager
    def backend_for_call(*_args, **_kwargs):
        yield backend

    monkeypatch.setattr(computer, '_backend_for_call', backend_for_call)
    monkeypatch.setattr(computer, '_request_approval', lambda *_args: None)
    result = json.loads(model_tools.handle_function_call('computer_use', args, session_id='coercion-test'))
    assert result['ok'] is True
    assert backend.click.call_args.kwargs['x'] == 152
    assert backend.click.call_args.kwargs['y'] == 82
    assert backend.click.call_count == 1


@pytest.mark.parametrize('key', ['coordinate', 'from_coordinate', 'to_coordinate'])
@pytest.mark.parametrize('value', [
    {'item': ['152', '82'], 'other': 'do not drop'},
    {'item': ['152.5', '82']}, {'item': ['nan', '82']}, {'item': ['152']},
])
def test_ambiguous_or_invalid_points_still_fail_validation(key, value):
    args = {'action': 'click', key: copy.deepcopy(value)}
    assert validate_deferred_call_args('computer_use', args) is not None


def test_object_array_values_are_not_reinterpreted(monkeypatch):
    from tools.registry import registry
    original = registry.get_schema
    schema = {'parameters': {'properties': {'rows': {'type': 'array', 'items': {'type': 'object'}}}}}
    monkeypatch.setattr(registry, 'get_schema', lambda name: schema if name == 'array-fixture' else original(name))
    row = {'item': ['152', '82']}
    assert coerce_tool_args('array-fixture', {'rows': row})['rows'] == [row]
