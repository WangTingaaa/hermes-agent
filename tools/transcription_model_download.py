"""Verified GET fallback for Hub mirrors that omit model-file HEAD metadata."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path
import tempfile
from urllib.parse import quote


_MODEL_FILES = frozenset({"config.json", "preprocessor_config.json", "model.bin",
                          "tokenizer.json", "vocabulary.txt", "vocabulary.json"})


def _download_snapshot(repo_id, *, endpoint, cache_dir, api, client):
    info = api.model_info(repo_id, files_metadata=True)
    revision = info.sha
    if not isinstance(revision, str) or len(revision) != 40 or any(c not in "0123456789abcdef" for c in revision):
        raise ValueError("Whisper mirror returned an invalid immutable revision")
    files = {entry.rfilename: entry for entry in info.siblings if entry.rfilename in _MODEL_FILES}
    if not {"config.json", "model.bin", "tokenizer.json"} <= files.keys():
        raise ValueError("Whisper mirror is missing required model files")
    repo_cache = Path(cache_dir) / ("models--" + repo_id.replace("/", "--"))
    snapshot = repo_cache / "snapshots" / revision
    repo_cache.mkdir(parents=True, exist_ok=True)
    # Stage and verify the entire snapshot before making any of its bytes
    # discoverable through refs/main. Interrupted downloads remain retryable.
    with tempfile.TemporaryDirectory(prefix=".whisper-download-", dir=repo_cache) as temporary:
        for name, entry in files.items():
            lfs = entry.lfs
            expected_hash = lfs.sha256 if lfs is not None else entry.blob_id
            expected_size = lfs.size if lfs is not None else entry.size
            if not expected_hash or not isinstance(expected_size, int) or expected_size <= 0:
                raise ValueError("Whisper mirror returned incomplete file integrity metadata: " + name)
            digest = hashlib.sha256() if lfs is not None else hashlib.sha1()
            if lfs is None:
                digest.update(f"blob {expected_size}\0".encode())
            url = f"{endpoint.rstrip('/')}/{quote(repo_id, safe='/')}/resolve/{revision}/{quote(name)}"
            downloaded = 0
            with client.stream("GET", url, follow_redirects=True, timeout=120) as response:
                response.raise_for_status()
                with (Path(temporary) / name).open("wb") as output:
                    for chunk in response.iter_bytes():
                        downloaded += len(chunk)
                        if downloaded > expected_size:
                            raise ValueError("Whisper model file exceeds its declared size: " + name)
                        digest.update(chunk)
                        output.write(chunk)
            if downloaded != expected_size or digest.hexdigest() != expected_hash:
                raise ValueError("Whisper model integrity check failed: " + name)
        snapshot.mkdir(parents=True, exist_ok=True)
        for name in files:
            os.replace(Path(temporary) / name, snapshot / name)
        refs = repo_cache / "refs"
        refs.mkdir(exist_ok=True)
        ref = Path(temporary) / "main"
        ref.write_text(revision, encoding="utf-8")
        os.replace(ref, refs / "main")
    return str(snapshot)


def download_mirror_model(model_name: str) -> str:
    from faster_whisper.utils import _MODELS
    from huggingface_hub import HfApi, constants
    from huggingface_hub.utils import get_session

    endpoint = os.environ.get("HF_ENDPOINT", "").rstrip("/")
    if not endpoint or endpoint == "https://huggingface.co":
        raise ValueError("No alternate Hugging Face mirror is configured")
    repo_id = _MODELS.get(model_name)
    if repo_id is None:
        raise ValueError("Mirror download supports named faster-whisper models only")
    return _download_snapshot(repo_id, endpoint=endpoint, cache_dir=constants.HF_HUB_CACHE,
                              api=HfApi(endpoint=endpoint), client=get_session())
