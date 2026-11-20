# 离线构建与验收

以下命令使用 macOS shell。先令 `hermes`、`host`、`mcp` 指向三个仓库的绝对路径，`revision` 为待交付的 Hermes 完整提交号，`stage` 为独立的暂存宿主根目录。从新的 shell 或脚本运行命令块；任一步非零退出即保留暂存区排查。

## 准备输入

- 按宿主 `scripts/hermes`、`electron/hermes` 当前实现确定安装和构建入口。记录源文件、资源清单和将替换的文件的初始指纹。暂存区保留宿主的工作树版 `package.json`、上述两个目录、PPT 预览模板、所需项目输入和完整的原 `vendor/hermes-runtime`。保留文件权限；APFS 可用 `cp -cR`，其他文件系统用独立副本。确保写入暂存 vendor 不会改到正式目录。确认磁盘足够且最终切换目录位于目标卷。
- 对照 `prepare-ppt-master.js` 校验锁定源码归档或本地检出，并检查 `src/components/AIFileReader/DeepResearch/Templates/ppt/ppt-previews/svg`。对照 `prepare-hermes-skills.js` 标明实际使用的文镜 skill 来源（Hermes 源码或宿主模板）；检查打入的脚本、资源和 SOUL.md。若来源有分歧，按用户要测试的版本核实。
- 检查当前 `pm/lock.json`、根、PM 和 PPT 运行时的 Python 锁，确认各平台的 Python ABI、wheel 标签、实际 extras 及 PEP 517 构建需求。使用项目 [依赖规划说明](../../audit-mira-offline-resources/references/planning.md) 和宿主 `hermes-wheel-plan.py` 的当前实现；把 `prepare-hermes-wheels.js` 追加的锁定版本 wheel 也纳入计划。Bootstrap 工具列表以安装器和锁为准，注意 pnpm 启动所需的平台包与通用包。

## 生成本地资源

在暂存宿主上运行下列命令。将 `HERMES_BUNDLE_SOURCE_ROOT` 指向内容与目标提交一致的检出，保持构建所需的锁定工具在 PATH 上。

```bash
set -eu
test "$(git -C "$hermes" rev-parse HEAD)" = "$revision"
cd "$stage"
export HERMES_BUNDLE_SOURCE_ROOT="$hermes"
node scripts/hermes/prepare-hermes-resources.js --build-renderer
for target in darwin-arm64 win32-x64; do
  node scripts/hermes/prepare-hermes-bootstrap.js "$target"
  node scripts/hermes/prepare-hermes-wheels.js "$target"
done
```

这一步生成生产 renderer、后端源码归档、安装器、技能、宿主预览文件和当前构建平台的 renderer-native。核查另一平台的 renderer-native 与目标 Electron/ABI 匹配。需更新时在对应平台构建并回填。缓存命中需验证文件哈希；缺项可从锁定来源下载到临时文件，核对 SHA 后替换。诊断超时要标明具体包和来源，下载到的错误页或残缺文件不能计入库存。

**MCP 单独构建。** 用户要求重打或 MCP 构建输入有变化时，从对应源码使用 `scripts/build-mac.sh` 或 Windows 上的 `scripts/build-win.ps1`。这两个脚本会写入同级的 `information-system/vendor`；在临时父目录按原名并排放置 MCP 的独立源码副本和暂存宿主，或在隔离构建环境执行同一套 PyInstaller 步骤，只将最终二进制拷入暂存区。复制源码时包含应交付的本地修改，按锁准备独立虚拟环境。分别检查 `mac/mcp/mesoInsights-mcp` 和 `win/mcp/mesoInsights-mcp.exe` 的 Mach-O arm64 / PE x64 架构、SHA 和原生启动。Windows 主机不可用且确需重编时，说明缺少对应构建，保留已完成的平台；不可把旧二进制重新盖章。

全部目标输入就绪后，在暂存宿主执行以下命令。使用本地清单生成器可避免发布命令自动同步到同级发布仓库。

```bash
set -eu
cd "$stage"
node scripts/hermes/prepare-hermes-file-manifest.js
node "$hermes/.cursor/skills/mira-sync-and-pack/scripts/verify-release.cjs" "$stage" "$revision"
```

校验脚本默认核验双平台。用户指定只验 Mac 时可追加 `darwin-arm64`，只验 Windows 时可追加 `win32-x64`。共享 backend、renderer 和总索引会影响两个平台。单平台测试可先交付暂存副本；正式切换前确认另一平台的受支持版本仍可解析，不把未完成的平台写为就绪。

## 验证和替换

1. 用完整的 Mac/Windows 平台计划再跑库存比对，比对 bootstrap 所有 pin 以及 wheels 的文件、大小、SHA、构建辅助包。核对两个 MCP、平台原生库、技能内容；清单自洽不能代替依赖闭包检查。
2. 在构建目标对应的原生主机上，从空的用户目录、空缓存和隔离的 PATH 验证首次离线安装。宿主入口为 `node scripts/hermes/verify-isolated-install.js <尚不存在的测试目录>`，从暂存宿主运行。隔离 HOME/USERPROFILE、Hermes 运行时和缓存路径，禁止外网并清除开发源码覆盖。检查安装源与目标 SHA、首次成功、二次初始化复用；核对没有借用用户环境或开发检出。保留失败阶段、首个缺包和原始错误。
3. 仅有 Mac 时，Windows 除逐文件校验外，用安装器的 `windows-offline.materializeWheels` 对临时源码重建本地 wheel 来源，在根、PM 和 PPT 环境分别按实际 extras 执行目标平台的 uv 离线 frozen dry-run（`--python-platform x86_64-pc-windows-msvc`）。此结果记为 Windows 依赖解析通过；Windows 首装和 MCP 运行另列为未实测。
4. 切换前再次比对初始指纹，包括用户可能同时更新的模型、skill、MCP 和宿主生成文件。遇到并发改动时从最新目录重建受影响项。保留可还原的旧目录及索引，在同卷替换 `vendor/hermes-runtime`，配套更新 `scripts/hermes/resource-release.json` 和有变化的 `electron/hermes/desktop-preview.js`。若任一步失败还原整组。对正式 `$host` 再运行同一个只读校验脚本。报告此次变更的预取包、平台和验证范围，区分构建时下载、用户首次安装和在线功能。
