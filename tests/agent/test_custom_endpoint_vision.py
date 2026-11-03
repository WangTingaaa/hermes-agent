"""Known vendor endpoints retain their model's vision capability on custom routes."""

from types import SimpleNamespace
from unittest.mock import patch

from agent.image_routing import _lookup_supports_vision


def test_custom_vendor_endpoint_uses_catalog_without_changing_wire_route():
    cfg = {"model": {"provider": "custom", "base_url": "https://api.minimaxi.com/v1"}}
    with patch("agent.models_dev.get_model_capabilities", return_value=SimpleNamespace(supports_vision=True)) as lookup:
        assert _lookup_supports_vision("custom", "MiniMax-M3.1-Flash", cfg) is True
    assert lookup.call_args.args[0] in {"minimax", "minimax-cn"}
    assert cfg["model"]["provider"] == "custom"


def test_explicit_text_only_override_wins_over_vendor_catalog():
    cfg = {"model": {"base_url": "https://api.minimaxi.com/v1", "supports_vision": False}}
    with patch("agent.models_dev.get_model_capabilities") as lookup:
        assert _lookup_supports_vision("custom", "MiniMax-M3.1-Flash", cfg) is False
    lookup.assert_not_called()
