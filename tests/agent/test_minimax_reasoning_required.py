"""MiniMax adaptive-thinking failures must use the existing low-effort recovery rung."""
from unittest.mock import MagicMock, patch

from agent import auxiliary_reasoning_floor
from agent.auxiliary_client import call_llm
from agent.error_classifier import is_reasoning_required_rejection

_ERROR = ('Error code: 400 - model "MiniMax-M3.1-Flash" requires adaptive thinking; '
          'reasoning effort none is not allowed (2013)')


def test_minimax_none_rejection_retries_low_and_remembers_the_route():
    auxiliary_reasoning_floor._FLOORED_ROUTES.clear()
    client = MagicMock()
    client.base_url = 'https://api.minimaxi.com/v1'
    client.chat.completions.create.side_effect = [RuntimeError(_ERROR), {'ok': True}, {'ok': True}]
    try:
        with (
            patch('agent.auxiliary_client._resolve_task_provider_model', return_value=(
                'custom', 'MiniMax-M3.1-Flash', client.base_url, 'fixture-key', None)),
            patch('agent.auxiliary_client._get_cached_client', return_value=(client, 'MiniMax-M3.1-Flash')),
            patch('agent.auxiliary_client._validate_llm_response', side_effect=lambda r, *_args, **_kw: r),
            patch('agent.auxiliary_client._try_payment_fallback', return_value=None),
        ):
            for _ in range(2):
                assert call_llm(task='title_generation', messages=[{'role': 'user', 'content': 'Fixture'}],
                                reasoning_config={'enabled': False}) == {'ok': True}
        assert [c.kwargs['reasoning_effort'] for c in client.chat.completions.create.call_args_list] == ['none', 'low', 'low']
    finally:
        auxiliary_reasoning_floor._FLOORED_ROUTES.clear()


def test_unrelated_none_rejection_is_not_a_reasoning_floor():
    assert not is_reasoning_required_rejection('response_format none is not allowed')
