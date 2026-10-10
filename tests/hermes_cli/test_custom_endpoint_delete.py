"""Deleting an endpoint removes its bare-custom model mirror, but no other host."""

import pytest


@pytest.mark.parametrize("legacy", [False, True])
@pytest.mark.parametrize("same_host", [False, True])
def test_delete_bare_custom_endpoint(legacy, same_host, _isolate_hermes_home):
    from starlette.testclient import TestClient

    from hermes_cli.config import load_config, save_config
    from hermes_cli.web_server import _SESSION_HEADER_NAME, _SESSION_TOKEN, app

    cfg = load_config()
    endpoint = {"name": "Box", "base_url": "https://box.example/v1", "model": "box-model",
                "api_key": "test-endpoint-key"}
    cfg["providers"] = {} if legacy else {"box": endpoint}
    cfg["custom_providers"] = [endpoint] if legacy else []
    cfg["model"] = {"provider": "custom", "default": "box-model", "api_key": "test-model-key",
                    "base_url": "https://box.example/v1/" if same_host else "https://other.example/v1"}
    save_config(cfg)
    with TestClient(app) as client:
        client.headers[_SESSION_HEADER_NAME] = _SESSION_TOKEN
        response = client.delete("/api/providers/custom-endpoints/box")
        assert response.status_code == 200
        rows = client.get("/api/providers/custom-endpoints").json()["endpoints"]
    model = load_config()["model"]
    if same_host:
        assert rows == []
        assert not model.get("base_url")
        assert not model.get("api_key")
        assert not model.get("provider")
    else:
        assert model["base_url"] == "https://other.example/v1"
        assert model["api_key"] == "test-model-key"
        assert len(rows) == 1
