"""Windows build snapshots must preserve inputs beyond MAX_PATH."""
from pathlib import Path

import pytest

from pm.filesystem import long_root
from pm.workspace import _copy_core_inputs


@pytest.mark.platforms("windows")
@pytest.mark.parametrize("deep_side", ["source", "destination"])
def test_copy_core_inputs_preserves_long_paths(tmp_path, deep_side):
    source = tmp_path / "source"
    destination = tmp_path / "destination"
    suffix = Path("nested" * 12) / ("nested" * 12)
    if deep_side == "source":
        source /= suffix
    else:
        destination /= suffix
    long_root(source).mkdir(parents=True)
    long_root(destination).mkdir(parents=True)
    (long_root(source) / "pyproject.toml").write_text(
        '[project]\nname="fixture"\nversion="1"\n'
        '[tool.setuptools.packages.find]\ninclude=["plugins*"]\n', encoding="utf-8")
    relative = Path("plugins") / ("fixture" * 12) / "payload.json"
    original = long_root(source) / relative
    original.parent.mkdir(parents=True)
    original.write_bytes(b'{"preserved": true}')
    assert max(len(str(source / relative)), len(str(destination / relative))) > 260

    _copy_core_inputs(source, destination)

    assert (long_root(destination) / relative).read_bytes() == original.read_bytes()
