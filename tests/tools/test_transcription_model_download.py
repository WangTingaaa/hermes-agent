"""Mirror downloads pin a revision and verify weights before publishing a cache ref."""

from contextlib import contextmanager
import hashlib
from pathlib import Path
from types import SimpleNamespace

import pytest

from tools.transcription_model_download import _download_snapshot


def _mirror(corrupt=False):
    contents = {"config.json": b'{"model":"whisper"}', "tokenizer.json": b'{}', "model.bin": b'weights'}
    entries = []
    for name, payload in contents.items():
        lfs = SimpleNamespace(sha256=hashlib.sha256(payload).hexdigest(), size=len(payload)) if name == "model.bin" else None
        entries.append(SimpleNamespace(rfilename=name, lfs=lfs, size=len(payload),
                                       blob_id=hashlib.sha1(f"blob {len(payload)}\0".encode() + payload).hexdigest()))

    class API:
        def model_info(self, repo_id, files_metadata=False):
            assert repo_id == "Systran/faster-whisper-tiny" and files_metadata
            return SimpleNamespace(sha="a" * 40, siblings=entries)

    class Client:
        @contextmanager
        def stream(self, method, url, **kwargs):
            assert method == "GET" and ("/resolve/" + "a" * 40 + "/") in url
            name = url.rsplit("/", 1)[1]
            payload = b"invalid" if corrupt and name == "model.bin" else contents[name]
            yield SimpleNamespace(raise_for_status=lambda: None, iter_bytes=lambda: iter([payload]))

    return API(), Client(), contents


def test_mirror_model_is_complete_and_discoverable_offline(tmp_path):
    api, client, contents = _mirror()
    result = _download_snapshot("Systran/faster-whisper-tiny", endpoint="https://mirror.example",
                                cache_dir=tmp_path, api=api, client=client)
    snapshot = Path(result)
    for name, payload in contents.items():
        assert (snapshot / name).read_bytes() == payload
    assert (snapshot.parent.parent / "refs/main").read_text() == "a" * 40


def test_corrupt_weights_are_not_published_to_the_cache(tmp_path):
    api, client, _contents = _mirror(corrupt=True)
    with pytest.raises(ValueError, match="integrity check"):
        _download_snapshot("Systran/faster-whisper-tiny", endpoint="https://mirror.example",
                           cache_dir=tmp_path, api=api, client=client)
    assert not list(tmp_path.glob("**/refs/main"))
    assert not list(tmp_path.glob("**/snapshots/*/model.bin"))
