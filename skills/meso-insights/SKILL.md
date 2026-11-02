---
name: meso-insights
description: "检索和管理云端文件夹、查询本地连接、导入文档并管理知识卡片."
---

# mesoInsights 文档、文件夹与知识卡片 Skill

对于已由 mesoInsights 管理的文档和知识卡片，以 mesoInsights MCP 工具返回的信息为准。查询云端文档库时不要用本地文件搜索替代。

## When to Use

用户要求搜索或管理个人云端文件夹、查看链接过的本地文件夹、导入或读取文档，或管理文件及研究笔记的知识卡片时使用。

## Prerequisites

需要已连接并配置有效 API Token 的 `mesoInsights` MCP 服务。使用下方工具前确认服务可用；AI 接口还要求 AI 阅读模块开放及 `intelligence.read` 权限。

## How to Run

查找文件夹时优先按名称搜索，再按路径定位；查看本地连接时查询位置记录。处理知识卡片时，按内容是否已有、归属是文件还是研究笔记选择工具。

## Quick Reference

- 搜索个人云端文件夹：`mcp__mesoInsights__search_user_folders`，按名称、父目录和类型查询。
- 查看目录详情、全树、路径：`mcp__mesoInsights__get_user_folder_detail`、`mcp__mesoInsights__get_user_folders_tree`、`mcp__mesoInsights__get_user_folder_path`。
- 查看目录下全部子孙文件或递归文件数：`mcp__mesoInsights__get_user_folder_descendant_files`、`mcp__mesoInsights__get_user_folder_file_count`。
- 创建、改名/改类型、移动目录：`mcp__mesoInsights__create_user_folder`、`mcp__mesoInsights__update_user_folder`、`mcp__mesoInsights__move_user_folders`。
- 递归删除单个/多个目录及其子目录和文件：`mcp__mesoInsights__delete_user_folder`、`mcp__mesoInsights__batch_delete_user_folders`。
- 查询链接过的本地文件夹及同步状态：`mcp__mesoInsights__get_local_file_locations_page`。
- 导入本地文件：`mcp__mesoInsights__import_file`。 指定个人云端目录时传 `folder_id`（默认 0 为根目录）；此 ID 不是研究笔记 ID，也不是本地目录连接 ID。调用前检查当前工具 schema，不支持目标目录时明确报错，不要改传到其他目录。
- 搜索云端文件：`mcp__mesoInsights__search_user_files`。
- 查看文件解析、分类或同步状态：`mcp__mesoInsights__get_file_detail`。
- 读取已解析文件正文：`mcp__mesoInsights__get_file_parse_content`。
- 保存用户已给出的结果或当前助手已生成的内容：`mcp__mesoInsights__save_knowledge_card`。
- 用户要求调用 mesoInsights 模型生成并保存结果：`mcp__mesoInsights__generate_knowledge_card`。
- 查询某文件或研究笔记的知识卡片、历史结果：`mcp__mesoInsights__list_knowledge_cards`。
- 修改已有卡片正文：`mcp__mesoInsights__update_knowledge_card`。
- 删除知识卡片（进入 AI 阅读回收站）：`mcp__mesoInsights__delete_knowledge_card`。

## Procedure

### 文件夹搜索与管理

1. 用户给出文件夹名称时，优先调用 `search_user_folders(folder_name="名称")`，默认 `parent_id=-1` 跨目录查询。`parent_id=0` 只查根目录，正整数只查该父目录的直接子目录。省略 `folder_name` 可按父目录或类型列出文件夹；不要用文件搜索代替文件夹搜索，也不要默认下载整棵树。
2. 搜索结果在 `result.data` 数组中，保留全部匹配。同名目录用 `get_user_folder_path(folder_id=...)` 获取路径区分；用 ID、名称、路径和 `folderType` 呈现匹配项。只有目标仍不明确时才询问用户；空结果只表示当前查询无匹配，不推断整个文档库没有该目录。
3. `folder_type` 仅支持 `MANUAL`（手动创建）和 `LOCAL_MAPPING`（本地映射）；用户未限定类型时不筛选。查看层级结构才使用树工具，查看直属内容使用详情，读取整个子树文件使用 `get_user_folder_descendant_files`。
4. 子树文件分页在 `result.data.records`，`page_size` 默认 20、范围 1～500；`hasMore=true` 时把 `nextCursor` 原样传给下一次的 `cursor`，直到结束。只读了部分页时说明范围。需要正文时用记录里的文件 `id` 查询解析内容。
5. 创建默认 `parent_id=0`、`folder_type="MANUAL"`。改名时先确认现有 `folderType` 并原样传入 `update_user_folder`，除非用户明确要求改类型。移动使用 `folder_ids` 和目标云端目录 `new_parent_id`，0 表示根目录；不能移动到自身或子目录。
6. 删除接口会递归影响子目录和文件，仅在用户明确要求删除时调用，并明确实际影响范围。搜索、查看和移动任务不应调用删除。

### 已链接的本地文件夹

1. “哪些本地文件夹链接过”使用 `get_local_file_locations_page(parent_id=null, is_folder=1)`。默认 `parent_id=0` 仅查询根连接；null 表示不发送 `parentId`，查询全部层级。默认不筛选 `is_synced`，保留已保存但未同步的连接。
2. 记录在 `result.data.records`，按 `hasNext` 递增 `page_num` 查完，保留 `total` 等分页信息。呈现 `name`、`localPath`、`isSynced`、`refId`。仅在用户要求已同步/未同步时分别传 `is_synced=1`/`0`；需要同时看文件记录时传 `is_folder=null`。
3. 本地记录 `id` 是连接记录 ID；文件夹记录的 `refId` 才是关联云端文件夹 ID，非空有效时可用于查询云端详情和路径。不要把本地记录 ID 传给云端文件夹接口。
4. 保存了连接不代表已同步，也不证明路径在当前设备存在或可读；路径可能含 `hostname::` 设备标识。云端的 `LOCAL_MAPPING` 类型也不能独自证明当前本地连接仍存在。此工具只读，不创建连接或执行同步；创建同类型云端目录同样不会自动连接本地路径。

### 知识卡片

1. 保存、生成、查询卡片时，`file_id` 与 `folder_id` 必须且只能提供一个非 null 正整数。卡片的 `folder_id` 是本人有效研究笔记 ID，允许归档笔记；不能使用上述个人云端文件夹或本地连接记录的 ID。
2. 用户已指定来源文件时，确认文件 ID 后传 `file_id`。文件不明确时先搜索，不猜测 ID。
3. 用户指定保存到研究笔记时，确认该笔记 ID 后传 `folder_id`，直接保存知识卡片，无需额外上传文件。当前 MCP 没有研究笔记列表或创建工具；ID 无法从可信上下文确认时，向用户询问，不能把文件搜索结果的 ID 当作笔记 ID。
4. 用户未指定归属时，先使用已确认的当前文件或研究笔记；上下文无法确定目标时，向用户询问。不要自动创建 Markdown 文件承载卡片。
5. 卡片与源文件正文独立。新建卡片不会修改文件正文；用户明确修改已有卡片时才使用更新工具，更新只支持正文，不支持改变归属。

## Pitfalls

- 读取文件正文前，解析状态未知时先查询详情；解析未完成时明确告知用户。
- `target_type` 为自由文本，如 `text`、`report`，最多 50 字符；保存、更新的 `result_content` 为非空白文本，最多 1000000 字符；生成的 `raw_content` 和 `instruction` 分别最多 16000 字符。
- 生成默认使用系统模型：`system_model=true`，省略 `model` 由服务端选择可用默认模型。指定模型时使用可用模型标识；使用用户自定义模型时显式传 `system_model=false`，不要硬编码历史默认模型。
- 保存和生成每次成功都新建卡片。超时后先按相同归属查询列表，核对是否已创建，再决定重试，避免重复保存。
- 知识卡片列表位于工具返回的 `result.data.records`，不是数组形式的 `data`；按 `hasNext` 和页码继续查询。`page_num` 默认 1、最大 100000；`page_size` 默认 20、最大 100。
- 按 `folder_id` 查询只返回该笔记直属有效卡片，不包含子笔记或收藏文件的卡片；文件卡片需按 `file_id` 查询。
- 笔记直属卡片的 `fileId=null`，不能据此认定来源文件丢失；历史无归属卡片可能 `fileId`、`folderId` 均为空，但不允许新建此类卡片。
- 更新和删除使用卡片自身 `id`，不是文件 ID、笔记 ID 或回收站条目 ID。
- 检查工具的 `success` 与业务响应 `code`，不能只凭 HTTP 状态或展示消息判断成功。错误中的 `business_code=3061` 表示笔记失效，需重选；5001 表示卡片不存在或非本人；1001 表示参数无效。

## Verification

确认工具返回 `success=true`、业务 `code=0` 且 `data` 非 null；列表须检查分页信息。目录操作返回 boolean 时，如实区分 true 和 false，不把 `data=false` 表述为操作成功。最终回复保留实际匹配的目录路径/ID、本地连接及同步状态，或卡片 ID 和归属；只报告工具实际返回的状态和链接。当前 MCP 不支持的操作（如回收站恢复、永久删除），如实说明。

## 示例

- “找一下项目资料文件夹” → 跨目录搜索名称，返回全部匹配；重名时查询完整路径定位。
- “我链接过哪些本地文件夹” → `parent_id=null`、`is_folder=1` 分页查询全部连接，分别说明是否同步。
- “把项目资料移到归档目录” → 分别搜索源和目标，确认路径后按云端目录 ID 移动。
- “把 `/Users/me/report.pdf` 导入文镜” → 导入本地文件。
- “总结刚才那份文档” → 定位文件、确认已解析并读取正文，再生成摘要；用户要求保存时存为该文件知识卡片。
- “把这份总结保存到项目复盘笔记里” → 确认研究笔记 ID，以 `folder_id` 直接保存知识卡片。
- “把这份总结保存到这个文件里” → 以 `file_id` 保存知识卡片。
- “把这份总结保存下来” → 使用已确认的当前文件或研究笔记归属；无法确定时先询问目标。
- “让 mesoInsights 为这份文件自动生成摘要” → 以 `file_id` 生成并保存知识卡片。
- “看看这本研究笔记已有的知识卡片” → 以 `folder_id` 分页查询直属卡片。
