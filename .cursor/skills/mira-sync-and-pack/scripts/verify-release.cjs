// Read-only check against the host packager's own file and component hashing rules.
const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function verify(hostPath, revision, ...requestedTargets) {
  const supported = ['darwin-arm64', 'win32-x64'];
  check(hostPath && /^[0-9a-f]{40}$/.test(revision), '用法：node verify-release.cjs <宿主根目录> <40 位提交号> [darwin-arm64|win32-x64]');
  const targets = requestedTargets.length ? [...new Set(requestedTargets)] : supported;
  check(targets.every(target => supported.includes(target)), '平台须为 darwin-arm64 或 win32-x64');

  const host = path.resolve(hostPath);
  const sourceRoot = path.join(host, 'vendor/hermes-runtime');
  const { RESOURCE_MANIFEST } = require(path.join(host, 'electron/hermes/resource-manifest-location'));
  const { createFileManifest } = require(path.join(host, 'scripts/hermes/prepare-hermes-file-manifest'));
  const appVersion = readJson(path.join(host, 'package.json')).version;
  const backend = readJson(path.join(sourceRoot, 'common/backend/manifest.json'));
  const inventory = readJson(path.join(sourceRoot, RESOURCE_MANIFEST));
  const metadata = readJson(path.join(host, 'scripts/hermes/resource-release.json'));
  const key = `${appVersion}:${revision}`;

  check(backend.commit === revision, `后端提交不匹配，实际为 ${backend.commit}`);
  check(inventory.renderer?.runtimeCommit === revision && inventory.renderer.runtimeVersion === backend.version,
    '总清单的 renderer 与目标版本不匹配');
  check(inventory.downloads?.schemaVersion === 3 && inventory.downloads.releases?.[key],
    `总清单缺少有效版本 ${key}`);
  check(metadata.schemaVersion === 1 && metadata.runtimeCommit === revision && metadata.runtimeVersion === backend.version,
    '宿主资源索引版本不匹配');

  const rebuilt = await createFileManifest({ sourceRoot, appVersion, targets });
  for (const target of targets) {
    const entry = rebuilt.releases[key].platforms[target];
    check(isDeepStrictEqual(entry, inventory.downloads.releases[key].platforms?.[target]),
      `${target} 磁盘文件与下载清单不一致`);
    const { appVersion: _appVersion, ...releaseEntry } = entry;
    check(isDeepStrictEqual(releaseEntry, metadata.platforms?.[target]),
      `${target} 磁盘文件与宿主资源索引不一致`);
    console.log(`${target} 校验通过，宿主 ${appVersion}，运行时 ${backend.version}，提交 ${revision}`);
  }
}

verify(...process.argv.slice(2)).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
