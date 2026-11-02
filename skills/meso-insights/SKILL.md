---
name: meso-insights
description: "导入和检索文档，生成、保存、查询及管理文件或研究笔记的知识卡片."
---

# mesoInsights 文档与知识卡片 Skill

对于已由 mesoInsights 管理的文档和知识卡片，以 mesoInsights MCP 工具返回的信息为准。查询云端文档库时不要用本地文件搜索替代。

## When to Use

用户要求导入、搜索、读取 mesoInsights 文档，或保存、生成、查询、修改、删除知识卡片时使用。

## Prerequisites

需要已连接并配置有效 API Token 的 `mesoInsights` MCP 服务。使用下方工具前确认服务可用；AI 接口还要求 AI 阅读模块开放及 `intelligence.read` 权限。

## How to Run

按内容是否已有、归属是文件还是研究笔记选择下方工具，并遵循归属与结果规则。

## Quick Reference

- 导入本地文件：`mcp__mesoInsights__import_file`。
- 搜索云端文件：`mcp__mesoInsights__search_user_files`。
- 查看文件解析、分类或同步状态：`mcp__mesoInsights__get_file_detail`。
- 读取已解析文件正文：`mcp__mesoInsights__get_file_parse_content`。
- 保存用户已给出的结果或当前助手已生成的内容：`mcp__mesoInsights__save_knowledge_card`。
- 用户要求调用 mesoInsights 模型生成并保存结果：`mcp__mesoInsights__generate_knowledge_card`。
- 查询某文件或研究笔记的知识卡片、历史结果：`mcp__mesoInsights__list_knowledge_cards`。
- 修改已有卡片正文：`mcp__mesoInsights__update_knowledge_card`。
- 删除知识卡片（进入 AI 阅读回收站）：`mcp__mesoInsights__delete_knowledge_card`。

## Procedure

1. 保存、生成、查询卡片时，`file_id` 与 `folder_id` 必须且只能提供一个非 null 正整数。`folder_id` 是本人有效研究笔记 ID，允许归档笔记，不是文件系统目录 ID。
2. 用户已指定来源文件时，确认文件 ID 后传 `file_id`。文件不明确时先搜索，不猜测 ID。
3. 用户指定保存到研究笔记时，确认该笔记 ID 后传 `folder_id`，直接保存知识卡片，无需额外上传文件。当前 MCP 没有研究笔记列表或创建工具；ID 无法从可信上下文确认时，向用户询问，不能把文件搜索结果的 ID 当作笔记 ID。
4. 用户未指定归属时，先使用已确认的当前文件或研究笔记；上下文无法确定目标时，向用户询问。不要自动创建 Markdown 文件承载卡片。
5. 卡片与源文件正文独立。新建卡片不会修改文件正文；用户明确修改已有卡片时才使用更新工具，更新只支持正文，不支持改变归属。

## Pitfalls

- 读取文件正文前，解析状态未知时先查询详情；解析未完成时明确告知用户。
- `target_type` 为自由文本，如 `text`、`report`，最多 50 字符；保存、更新的 `result_content` 为非空白文本，最多 1000000 字符；生成的 `raw_content` 和 `instruction` 分别最多 16000 字符。
- 生成默认使用系统模型：`system_model=true`，省略 `model` 由服务端选择可用默认模型。指定模型时使用可用模型标识；使用用户自定义模型时显式传 `system_model=false`，不要硬编码历史默认模型。
- 保存和生成每次成功都新建卡片。超时后先按相同归属查询列表，核对是否已创建，再决定重试，避免重复保存。
- 列表位于工具返回的 `result.data.records`，不是数组形式的 `data`；按 `hasNext` 和页码继续查询。`page_num` 默认 1、最大 100000；`page_size` 默认 20、最大 100。
- 按 `folder_id` 查询只返回该笔记直属有效卡片，不包含子笔记或收藏文件的卡片；文件卡片需按 `file_id` 查询。
- 笔记直属卡片的 `fileId=null`，不能据此认定来源文件丢失；历史无归属卡片可能 `fileId`、`folderId` 均为空，但不允许新建此类卡片。
- 更新和删除使用卡片自身 `id`，不是文件 ID、笔记 ID 或回收站条目 ID。
- 检查工具的 `success` 与业务响应 `code`，不能只凭 HTTP 状态或展示消息判断成功。错误中的 `business_code=3061` 表示笔记失效，需重选；5001 表示卡片不存在或非本人；1001 表示参数无效。

## Verification

确认工具返回 `success=true`、业务 `code=0` 且 `data` 非 null；列表须检查分页信息。最终回复保留卡片 ID、归属文件或笔记 ID，以及工具实际返回的状态和链接。当前 MCP 不支持的操作（如回收站恢复、永久删除），如实说明。

## 示例

- “把 `/Users/me/report.pdf` 导入文镜” → 导入本地文件。
- “总结刚才那份文档” → 定位文件、确认已解析并读取正文，再生成摘要；用户要求保存时存为该文件知识卡片。
- “把这份总结保存到项目复盘笔记里” → 确认研究笔记 ID，以 `folder_id` 直接保存知识卡片。
- “把这份总结保存到这个文件里” → 以 `file_id` 保存知识卡片。
- “把这份总结保存下来” → 使用已确认的当前文件或研究笔记归属；无法确定时先询问目标。
- “让 mesoInsights 为这份文件自动生成摘要” → 以 `file_id` 生成并保存知识卡片。
- “看看这本研究笔记已有的知识卡片” → 以 `folder_id` 分页查询直属卡片。
