---
name: mira-sync-and-pack
description: 从 fork 拉取 Hermes，合并 Mira 功能分支、解决冲突、补桌面国际化和「关于」更新记录，再为文镜准备和验证本地 Mac ARM64 与 Windows x64 离线资源。用户说「从拉代码到离线包」「同步 Mira 并补齐 vendor」「更新 Hermes、文镜 skill 和 MCP 后打测试资源包」时使用。支持从已合并的版本续跑。
---

# Mira 同步与离线打包

默认交付到与 Hermes 同级的 `information-system/vendor/hermes-runtime`。文镜 MCP 源码默认在同级的 `mesoInsights-mcp`。优先执行用户指定的平台、工序和路径。如果用户只要求清点缺包，使用 [资源审计](../audit-mira-offline-resources/SKILL.md)。本流程的完成条件是本地资源和宿主索引可供测试；Git 推送、线上发布、构建桌面安装程序需由用户另行指定。

## 1. 定位工作现场

- 读取目标目录的 AGENTS.md。在 Hermes 记录分支、工作树状态、原功能分支 SHA、fork 地址和进行中的 Git 操作。在宿主记录版本、打包脚本的本地修改和 vendor 当前版本。在 MCP 仓库记录版本、SHA 和待纳入打包的本地修改。以后者的实际构建输入判断 MCP 是否更新。
- 用户说「已经合了，补包」时，从已审定的功能分支提交继续。重复运行时比较该提交、文镜 skill/MCP 输入、宿主安装器、资源清单和磁盘文件。相同的已验证产物可复用；同一 Hermes SHA 下文镜组件也可能单独更新。

## 2. 更新源码、文案和版本记录

1. 按项目内 [sync-mira](../sync-mira/SKILL.md) 从 fork 的 `origin/main` 快进本地 `main`，再将 `main` 合入 `feature-mesoInsights-skill`。已有合并时先核对分支和 `MERGE_HEAD`，匹配则续解冲突。保护用户未提交的修改，遇到会覆盖本地工作的操作先隔离工作树或说明具体冲突。
2. 有冲突按 [merge-and-run-mira](../merge-and-run-mira/SKILL.md) 采用上游架构，接回 Mira 品牌、宿主集成、文镜技能和已有交互。核对 `git diff --name-only --diff-filter=U` 和 `git diff --check`。用本次合并前后的功能分支提交比较实际引入的变化。
3. 逐项补新增可见文案，含空态、按钮、提示和无障碍标签。检查英文基准、简中及对应的分模块翻译。按真实用户可见变化更新「关于」的 `settings.about.runtimeReleaseNotes`，同步英文、简中、繁中、日文的版本和条目；同版本已有记录就追加或合并，保留历史。运行时版本取宿主 `scripts/hermes/hermes-source-version.js` 使用的来源。
4. 使用当前锁文件和项目脚本。项目使用 pnpm 时，按 `pm/lock.json` 准备 Node/pnpm，用 `node scripts/build/node-deps.mjs --source "$PWD" --workspace apps/desktop --workspace tests-js --reuse` 准备依赖。从 `apps/desktop` 执行 `pnpm run typecheck` 和 `pnpm exec vitest run src/i18n/overlay-completeness.test.ts src/app/settings/mira-about-settings.test.tsx`，另外运行受影响的测试；Python 使用 `scripts/run_tests.sh`。根据失败修翻译或依赖声明，保留有效回归断言。
5. 按同步流程提交本次合并与国际化改动，并记录最终完整 SHA。后端使用 `git archive`，因此所有应交付的产品改动须进入这个提交，生产 renderer 也从同一内容构建。

## 3. 审计、构建和交接

1. 使用 [资源审计](../audit-mira-offline-resources/SKILL.md) 生成两个平台的依赖计划。根据当前安装器和锁，与现有资源按目标、文件、版本、大小和 SHA-256 比较。明确新增、更新、已可复用和缺失的资源。用户要求重打的文镜 skill 或 MCP 即使版本号未改也纳入。
2. 执行 [离线构建与验收](references/offline-build.md)。先在独立暂存目录构建，再验证真实安装路径，最后替换已通过验证的本地资源和配套索引。保留成功步骤的输入身份与校验结果，下载中断时从暂存区续跑。
3. 用简体中文交接功能分支与提交、运行时版本、宿主版本、交付路径和每个平台的测试结果。直接回答「这次是否新增需要联网或 VPN 预取的资源」，列出具体包、目标平台、是否已随包提供；说明终端首次离线安装是否实测、哪些在线服务仍需网络。遗漏包、仅做静态校验或需 Windows 原生打包时写明具体项。
