---
name: meso-insights
description: "管理 mesoInsights 中的文档及其 AI结果、智能生成结果和历史结果。当用户要求将本地文件导入 mesoInsights、搜索已上传或云端文件、查看文件解析或同步状态、读取解析内容、为文件生成 AI 结果，或在 mesoInsights 中保存/创建 Markdown 文档和结果时使用。用户所说的产物、结果、生成内容等也属于此场景。"
---

# mesoInsights 文档管理

## 概述

对于已由 mesoInsights 管理的文档，必须以 mesoInsights MCP 工具返回的
信息为准。用户询问 mesoInsights 文档库时，不要用本地文件搜索替代。

## 选择操作

根据用户意图选择对应工具：

- 需要导入本地路径中的文件：`mcp__mesoInsights__import_file`。
- 需要查找已有云端文件：`mcp__mesoInsights__search_user_files`。
- 需要查看解析状态、分类或同步信息：
  `mcp__mesoInsights__get_file_detail`.
- 需要读取已经解析完成的文件正文：
  `mcp__mesoInsights__get_file_parse_content`.
- 用户已给出确定的内容，且指定了承载结果的目标文件：将内容作为该文件的
  **AI结果**保存，使用 `mcp__mesoInsights__save_ai_result_to_file`。
- 用户已给出确定的内容，但未指定承载结果的目标文件：新建一个 Markdown 文件，
  并将内容作为新文件的**AI结果**保存，使用
  `mcp__mesoInsights__create_file_and_save_ai_result`。
- 用户指定了目标文件，但要求 mesoInsights 生成内容：为该文件生成并保存
  **智能生成结果**，使用 `mcp__mesoInsights__generate_ai_result_for_file`。
- 用户既未指定目标文件，也要求 mesoInsights 生成内容：新建一个 Markdown 文件，
  再为它生成并保存**智能生成结果**，使用
  `mcp__mesoInsights__create_file_and_generate_ai_result`。

## 工作流程规则

1. 目标文件不明确时，先搜索；绝不猜测文件 ID。
2. 解析状态未知时，读取正文前先查询文件详情；若解析未完成，向用户明确说明。
3. 这四个工具读写的是文件级的**AI结果**或**智能生成结果**，不是对源文件正文
   的改写。用户所说的“产物”“结果”“历史结果”“生成内容”等，都应按此功能域
   理解。用户已指定承载结果的目标文件时使用该文件；未指定时，创建 Markdown
   文件承载结果。
4. 写入、创建或生成内容前，若目标文件或内容要求不明确，先确认。除非用户明确
   要求，否则不要批量导入、覆盖或创建文件。
5. 在最终回复中保留文件 ID、状态和工具返回的链接，方便用户继续后续流程。
6. 请求的操作不被 MCP 支持时，如实说明，不能声称已经完成。

## 示例

- “把 `/Users/me/report.pdf` 导入文镜” → 导入本地文件。
- “找一下我上传过的年度规划” → 先搜索云端文件。
- “总结刚才那份文档” → 定位文件，确认已解析，读取解析正文后生成摘要。
- “把这份总结保存到项目复盘里” → 将总结作为“项目复盘”文件的 AI结果保存，
  不改写该文件正文。
- “把这份总结保存下来” → 未指定目标文件，创建 Markdown 文件并保存 AI结果。
- “为这份材料/文件自动生成一份摘要” → 对指定文件生成并保存智能生成结果。
- “为这个内容自动生成摘要” → 创建 Markdown 文件，并保存智能生成结果。
