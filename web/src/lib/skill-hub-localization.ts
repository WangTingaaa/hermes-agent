import type { SkillHubResult } from "@/lib/api";
import type { Locale } from "@/i18n/types";

type ChineseCopy = readonly [name: string, description: string];

// Official catalog copy is deliberately keyed by the SKILL.md `name` field.
// Community sources never pass through this catalog: their author-provided
// title and description remain intact.
const OFFICIAL_ZH: Readonly<Record<string, ChineseCopy>> = {
  "1password": ["1Password", "使用 1Password CLI 设置、读取和注入命令所需的凭据。"],
  "3-statement-model": ["三表模型", "在 Excel 中构建完整的利润表、资产负债表和现金流量表模型。"],
  "adversarial-ux-test": ["对抗式用户体验测试", "扮演最挑剔、最不擅长技术的用户测试产品，识别真实体验阻力并产出可执行工单。"],
  agentmail: ["AgentMail 邮件", "为代理配置独立邮箱，并自动收发和管理邮件。"],
  "antigravity-cli": ["Antigravity CLI", "操作 Antigravity CLI，包括插件、认证和沙箱功能。"],
  axolotl: ["Axolotl 微调", "使用 YAML 配置进行 LoRA、DPO、GRPO 等大语言模型微调。"],
  "baoyu-article-illustrator": ["文章配图", "为文章规划并生成风格一致的插图。"],
  "baoyu-comic": ["宝玉漫画", "创建知识漫画、教育漫画和教程漫画。"],
  bioinformatics: ["生物信息学", "覆盖基因组学、转录组学、单细胞和变异分析等生物信息学工作流。"],
  blackbox: ["Blackbox", "将编码任务委派给 Blackbox AI CLI，并由多模型评审选择结果。"],
  "blender-mcp": ["Blender MCP", "通过 Blender MCP 和 bpy 配方驱动 Blender。"],
  canvas: ["Canvas LMS", "通过 API 令牌获取和管理 Canvas 课程、作业与学习数据。"],
  "cloudflare-temporary-deploy": ["Cloudflare 临时部署", "将网站临时部署到 Cloudflare，便于分享和验收。"],
  "code-wiki": ["代码知识库", "从代码库构建并查询结构化知识库。"],
  "concept-diagrams": ["概念图", "把抽象概念整理为清晰的关系图和说明图。"],
  "creative-ideation": ["创意构思", "生成、比较并完善创意方向与方案。"],
  "darwinian-evolver": ["达尔文式演化", "通过迭代评估和选择来演化候选方案。"],
  "docker-management": ["Docker 管理", "构建、运行、检查和排查 Docker 容器与镜像。"],
  "drug-discovery": ["药物发现", "支持药物发现中的检索、分析和候选研究工作。"],
  dspy: ["DSPy", "使用 DSPy 构建、优化和评估语言模型程序。"],
  "excel-author": ["Excel 建模", "创建和维护财务建模用的 Excel 工作簿。"],
  "fitness-nutrition": ["健身与营养", "制定和跟踪健身、营养及习惯计划。"],
  "gitnexus-explorer": ["GitNexus 代码探索", "探索代码图谱、依赖和实现关系。"],
  godmode: ["Godmode", "在受控前提下执行高级安全与系统操作。"],
  guidance: ["Guidance", "使用 Guidance 控制语言模型生成过程。"],
  "here-now": ["此时此地", "查询当前位置、时间和相关本地信息。"],
  honcho: ["Honcho", "使用 Honcho 的记忆与推理能力分析目标、模式和当前状态。"],
  hyperframes: ["Hyperframes", "创建可交互的视觉和动态内容。"],
  "mcp-oauth-remote-gateway": ["MCP OAuth 远程网关", "为远程 MCP 服务配置 OAuth 网关。"],
  mcporter: ["MCporter", "发现、配置和调用 MCP 服务器工具。"],
  "memento-flashcards": ["Memento 闪卡", "从内容生成和复习记忆闪卡。"],
  "openclaw-migration": ["OpenClaw 迁移", "规划并执行 OpenClaw 配置和数据迁移。"],
  openhands: ["OpenHands", "将软件任务委派给 OpenHands 代理。"],
  "osint-investigation": ["开源情报调查", "使用公开来源开展可验证的 OSINT 调查。"],
  "page-agent": ["页面代理", "在网页中嵌入可通过自然语言操控界面的页面代理。"],
  "parallel-cli": ["并行 CLI", "并行执行命令行任务并汇总结果。"],
  qmd: ["QMD", "检索和处理本地 Markdown 知识库。"],
  scrapling: ["Scrapling", "抓取并提取网页结构化内容。"],
  searxng: ["SearXNG 搜索", "配置并使用私有 SearXNG 搜索服务。"],
  sherlock: ["Sherlock", "在多个社交平台中检索用户名线索。"],
  shop: ["购物助手", "根据需求搜索、比较和筛选商品。"],
  shopify: ["Shopify", "管理 Shopify 商店、商品和运营流程。"],
  siyuan: ["思源笔记", "读取和管理思源笔记中的内容与知识。"],
  "subagent-driven-development": ["子代理驱动开发", "用明确分工的子代理推进软件开发任务。"],
  telephony: ["电话能力", "管理电话、语音和相关通信自动化。"],
  "web-pentest": ["Web 渗透测试", "在授权范围内测试 Web 应用安全性。"]
};

const OFFICIAL_ZH_DETAIL: Readonly<Record<string, string>> = {
  xlsx: [
    "## 能力",
    "创建、读取和编辑 Excel 工作簿；可处理公式、格式、图表、数据清洗与格式转换。交付包含公式的工作簿前，必须重新计算并确认没有错误。",
    "",
    "## 何时使用",
    "当电子表格是主要输入或输出时使用：打开、读取、编辑或修复已有的 `.xlsx`、`.xlsm`、`.xltx`、`.csv` 或 `.tsv` 文件；从零创建新工作簿或从其他数据生成工作簿；在表格格式之间转换；清理杂乱的表格数据；或生成可直接使用的电子表格。用户按名称或路径提到电子表格时也应使用。若交付物是 Word、CSV、HTML 报告、独立脚本或 Google Sheets API 集成，则不要触发。对于金融级建模约定（DCF、LBO、三表模型），`excel-author` 会在此基础上增加更严格的标准。"
  ].join("\n")
};

const isChinese = (locale: Locale) => locale === "zh" || locale === "zh-hant";
const isOfficial = (result: SkillHubResult) => result.source === "official" || result.trust_level === "builtin";

export function localizeHubSkill(result: SkillHubResult, locale: Locale): ChineseCopy {
  if (isChinese(locale) && isOfficial(result)) {
    return OFFICIAL_ZH[result.name] ?? [result.name, result.description];
  }
  return [result.name, result.description];
}

export function localizeHubSkillDetail(result: SkillHubResult, skillMd: string, locale: Locale): string {
  return isChinese(locale) && isOfficial(result)
    ? OFFICIAL_ZH_DETAIL[result.name] ?? skillMd
    : skillMd;
}
