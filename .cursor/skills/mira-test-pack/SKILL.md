---
name: mira-test-pack
description: 用户说「mira测试打包」、要求给文镜打 Mac 和 Windows 内置 Mira 资源的测试包，或要求打包后检查桌面「mira测试」时使用。覆盖资源刷新、生产 vendor 安装包、验包和桌面测试工具回归。
---

# mira测试打包

默认从本仓库当前要交付的提交构建，宿主在同级 `information-system`，测试工具在 `~/Desktop/mira测试`。记录 Hermes 完整提交号、宿主版本、两个仓库的分支和待改文件。后端使用 `git archive`，前端使用工作树；先确认两边的产品改动属于同一版本。按本次请求决定是否提交、推送或发布线上资源。

## 刷新文镜资源

1. 在宿主执行 `zsh scripts/hermes/desktop-build-tool.sh resources`。使用当前 Hermes 项目锁定的 Node 和 pnpm；若命中旧 pnpm，将已有匹配版本的目录放到 PATH 前再重试。
2. 在 Hermes 仓库执行以下命令，按实际磁盘文件验证两个平台的索引。核对宿主 vendor 与同级 `hermes-build-zip/common` 的后端清单、前端 `.runtime-pair.json` 和入口引用的资源。资源脚本更新本地发布副本；线上发布需要单独执行。

   ```sh
   node .cursor/skills/mira-sync-and-pack/scripts/verify-release.cjs ../information-system "$(git rev-parse HEAD)"
   ```

## 串行构建与验包

1. 在宿主执行 `npm run build:electron:mac:prod:vendor`。等待脚本退出成功、DMG 与更新 ZIP 写入 `release/`。用 `hdiutil verify` 检查本轮 DMG。
2. 在启动 Windows 构建前，检查本轮 `release-build/mac-arm64/MesoInsights.app/Contents/Resources`。核对 ASAR 内的 `package.json` 的 `hermesResources.mode` 为 `bundled`，`hermes-agent/manifest.json` 与 `hermes-renderer/.runtime-pair.json` 同指目标提交。检查前端入口、后端归档、bootstrap、wheels 和 MCP。此时即可用下节的 Mac 实机入口对解包的 .app 做离线盘点。
3. 在 Mac 构建 Windows 前，用 `command -v pwsh` 确认 PowerShell 可用，以便宿主校验 `install.ps1`。若宿主已有可执行的 `.tmp/powershell-build/pwsh`，将其所在目录加入本次命令的 PATH。在宿主执行 `npm run build:electron:win:prod:vendor`。两平台共用 dist、release-staging 和 release-build；后一个命令会清理前一个的暂存文件。在 `release-build/win-unpacked/resources` 重复核对资源身份，核验 SQLite 等原生模块的 Windows x64 架构与目标 Electron ABI。跨平台构建使用目标预编译件，保留宿主开发环境中的原生模块。
4. 两个脚本均成功后执行 `node scripts/verify-update-release.js release`。确认输出包括本轮 DMG、ZIP 和 EXE，版本、提交、文件大小、SHA-512 与 blockmap 齐全。以 `release/` 下校验通过的 DMG 和 EXE 作为交付件。同名旧包可能仍在该目录，以更新清单与本轮提交核对。

## 检查桌面「mira测试」

- 用测试工具自带的 Node 对真实包盘点。传入**绝对路径**，给报告和测试数据分配临时目录。读取报告中的模式、完整提交、资源问题和离线清单，`--inspect` 的退出码只说明盘点完成。

  ```sh
  kit="$HOME/Desktop/mira测试"
  scratch="$(mktemp -d)"
  "$kit/Mac实机验收.command" --inspect --network Offline --app "$mac_app" \
    --home "$scratch/home" --reports "$scratch/reports"
  "$kit/tools/mac/node" "$kit/quick-test.js" --project "$host_root" --report-dir "$scratch/source"
  ```

  `mac_app` 指向本轮解包或只读挂载的 .app，`host_root` 是文镜源码绝对路径。Windows 真机从 `Run-Diagnostics.cmd` 进入，传已安装程序或解包目录。记录实际执行的平台与场景。
- 对照本轮变更检查双击入口、源码测试路径、桌面 workspace 的 Vitest、两平台自带 Node、测试说明和手工验收步骤。若需修复，保留原有断言，运行实际入口，检查每组的退出码、失败和跳过项。初始化、升级和本地 HTML 预览等 UI 行为由真实客户端确认。预览需看到已知正文，并在切换标签、隐藏重开后再次看到。
- 交付两份安装包的本地链接、宿主和运行时版本、目标提交、桌面测试目录是否改动以及实测范围。按当前项目的文镜归档约定处理最终文件；超出上传限制时保留本地安装包并说明。
