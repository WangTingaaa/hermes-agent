"""A real transcription may prepare Local Whisper; passive probes never install."""

import wave
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

import tools.transcription_tools as transcription


@pytest.fixture
def recording(tmp_path):
    target = tmp_path / "recording.wav"
    with wave.open(str(target), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(16000)
        audio.writeframes(b"\x00\x00" * 16000)
    return str(target)


@pytest.mark.parametrize("provider", [None, "local"])
def test_first_transcription_reaches_local_setup(monkeypatch, recording, provider):
    config = {"local": {"unload_after_idle_seconds": 0}, "language": "zh"}
    if provider is not None:
        config["provider"] = provider
    monkeypatch.setattr(transcription, "_load_stt_config", lambda: config)
    monkeypatch.setattr(transcription, "_get_provider", lambda cfg: "none")
    monkeypatch.setattr(transcription, "_HAS_FASTER_WHISPER", False)
    install = Mock(return_value=True)
    monkeypatch.setattr(transcription, "_try_lazy_install_stt", install)
    model = Mock(supported_languages=["zh"])
    model.transcribe.return_value = ([], SimpleNamespace(language="zh", duration=1.0))
    monkeypatch.setattr(transcription, "_get_or_load_local_model", lambda *args: model)
    monkeypatch.setattr(transcription, "_join_confident_segments", lambda *args: "你好")

    result = transcription._transcribe_prepared_audio(recording)

    assert result["success"] is True
    assert result["transcript"] == "你好"
    assert result["provider"] == "local"
    install.assert_called_once_with()
    assert model.transcribe.call_args.kwargs["language"] == "zh"


def test_local_setup_refusal_has_an_actionable_error(monkeypatch, recording):
    monkeypatch.setattr(transcription, "_load_stt_config", lambda: {"provider": "local"})
    monkeypatch.setattr(transcription, "_get_provider", lambda cfg: "none")
    monkeypatch.setattr(transcription, "_HAS_FASTER_WHISPER", False)
    monkeypatch.setattr(transcription, "_try_lazy_install_stt", lambda: False)
    result = transcription._transcribe_prepared_audio(recording)
    assert result["success"] is False
    assert "hermes pm install stt-whisper" in result["error"]


def test_passive_provider_probe_never_prepares_dependencies(monkeypatch):
    install = Mock(side_effect=AssertionError("passive probe attempted an install"))
    monkeypatch.setattr(transcription, "_try_lazy_install_stt", install)
    monkeypatch.setattr(transcription, "_detect_local_backend", lambda: None)
    monkeypatch.setattr(transcription, "_CLOUD_PROVIDER_SPECS", {})
    assert transcription._get_provider({}) == "none"
    install.assert_not_called()


def test_invalid_audio_cannot_start_dependency_setup(monkeypatch, tmp_path):
    install = Mock()
    monkeypatch.setattr(transcription, "_try_lazy_install_stt", install)
    result = transcription._transcribe_prepared_audio(str(tmp_path / "missing.wav"))
    assert result["success"] is False
    install.assert_not_called()
