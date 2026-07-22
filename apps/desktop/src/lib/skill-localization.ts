import type { Locale } from '@/i18n'
import type { SkillInfo } from '@/types/hermes'

type LocalizedCopy = readonly [name: string, description: string]

// This catalog covers skills that ship in `skills/` plus the official
// `optional-skills/security/` set requested for the built-in catalog.
// Locally-authored and hub skills keep the description their author supplied;
// translating those in the UI would make the catalog claim content it cannot
// verify from that skill's SKILL.md.
const zhBuiltInSkills: Readonly<Record<string, LocalizedCopy>> = {
  'meso-insights': ['文镜', '导入、检索与管理 mesoInsights 文档及其 AI 结果'],
  docx: ['Word 文档', '创建、编辑、审阅和解析 Word（DOCX）文档'],
  xlsx: ['Excel 表格', '创建、编辑、分析和校验 Excel（XLSX）工作簿'],
  pdf: ['PDF 文档', '读取、创建、编辑和校验 PDF 文件'],
  powerpoint: ['PowerPoint 演示文稿', '创建、编辑、渲染和校验 PowerPoint（PPTX）演示文稿'],
  'computer-use': ['计算机操作', '通过视觉与输入控制桌面应用、窗口和网页'],
  dogfood: ['应用验收测试', '探索式测试应用，收集证据并产出缺陷报告'],
  'hermes-desktop-plugins': ['桌面插件开发', '开发为桌面应用添加界面和命令的插件'],
  'apple-notes': ['Apple 备忘录', '读取、搜索和管理 Apple 备忘录'],
  'apple-reminders': ['Apple 提醒事项', '创建、查询和管理 Apple 提醒事项'],
  findmy: ['查找设备', '查询 Apple 设备和 AirTag 的位置'],
  imessage: ['iMessage 信息', '通过命令行发送和接收 iMessage 或短信'],
  'claude-code': ['Claude Code', '委派编码任务给 Claude Code CLI'],
  codex: ['Codex', '委派编码任务给 OpenAI Codex CLI'],
  'hermes-agent': ['Hermes Agent', '配置、扩展或参与 Hermes Agent 开发'],
  opencode: ['OpenCode', '委派功能开发和 PR 审查给 OpenCode CLI'],
  'architecture-diagram': ['架构图', '创建软件、云基础设施和系统关系图'],
  'ascii-art': ['ASCII 艺术', '创建终端 ASCII 艺术和图像转换结果'],
  'ascii-video': ['ASCII 视频', '把视频或音频转换为彩色 ASCII MP4/GIF'],
  'baoyu-infographic': ['信息图', '将内容制作成信息图和视觉摘要'],
  'claude-design': ['Claude 设计', '设计一次性 HTML 页面、演示稿和原型'],
  comfyui: ['ComfyUI', '通过 ComfyUI 工作流生成和编辑图像、视频与音频'],
  'design-md': ['设计文档', '编写、验证和导出 Google DESIGN.md 令牌规范'],
  excalidraw: ['Excalidraw 绘图', '创建手绘风格的架构、流程和时序图'],
  humanizer: ['文本人性化', '润色文本，减少 AI 腔并增强自然表达'],
  'manim-video': ['Manim 动画视频', '使用 Manim 创建数学和算法动画视频'],
  p5js: ['p5.js 创意编码', '创建生成艺术、着色器和交互式 p5.js 草图'],
  'popular-web-designs': ['网页设计参考', '参考真实设计系统制作 HTML/CSS 界面'],
  pretext: ['PreTeXt 文本布局', '构建浏览器创意演示与无 DOM 的文本排版'],
  sketch: ['网页草图', '快速制作多个 HTML 设计方案以供比较'],
  'songwriting-and-ai-music': ['AI 作词与音乐', '辅助歌词创作和 AI 音乐生成提示设计'],
  'touchdesigner-mcp': ['TouchDesigner', '通过 MCP 控制运行中的 TouchDesigner 项目'],
  'jupyter-live-kernel': ['Jupyter 内核', '通过实时 Jupyter 内核迭代运行 Python'],
  himalaya: ['Himalaya 邮件', '通过 Himalaya CLI 收发 IMAP/SMTP 邮件'],
  'codebase-inspection': ['代码库检查', '分析代码库的行数、语言和结构比例'],
  'github-auth': ['GitHub 认证', '配置 GitHub HTTPS、SSH 和 gh CLI 登录'],
  'github-code-review': ['GitHub 代码审查', '审查 PR 差异并提交行级反馈'],
  'github-issues': ['GitHub Issue', '创建、分类、标记和分配 GitHub Issue'],
  'github-pr-workflow': ['GitHub PR 工作流', '处理分支、提交、CI、创建和合并 PR'],
  'github-repo-management': ['GitHub 仓库管理', '管理仓库、远程地址、分支和发布流程'],
  'gif-search': ['GIF 搜索', '从 Tenor 搜索和下载 GIF'],
  heartmula: ['HeartMuLa 音乐', '根据歌词和标签生成歌曲'],
  songsee: ['SongSee 音乐', '提取音频频谱、Mel、Chroma 和 MFCC 特征'],
  'youtube-content': ['YouTube 内容', '将 YouTube 字幕转成摘要、长帖或文章'],
  'huggingface-hub': ['Hugging Face Hub', '搜索、下载和上传模型与数据集'],
  'llama-cpp': ['llama.cpp 推理', '在本地运行 GGUF 模型并发现 Hugging Face 模型'],
  'serving-llms-vllm': ['vLLM 推理服务', '部署高吞吐量的 OpenAI 兼容 LLM 服务'],
  'evaluating-llms-harness': ['LLM 评测', '用 lm-eval-harness 评测 MMLU、GSM8K 等基准'],
  'weights-and-biases': ['Weights & Biases', '记录 ML 实验、Sweep、模型注册表和看板'],
  'audiocraft-audio-generation': ['AudioCraft', '用 MusicGen 和 AudioGen 生成音乐与音效'],
  'segment-anything-model': ['Segment Anything', '通过点、框和掩码进行零样本图像分割'],
  obsidian: ['Obsidian 笔记', '读取、搜索、创建和编辑 Obsidian 知识库'],
  airtable: ['Airtable', '通过 REST API 管理记录、筛选和批量更新'],
  'google-workspace': ['Google Workspace', '操作 Gmail、日历、云端硬盘、文档和表格'],
  maps: ['地图与路线', '执行地理编码、地点、路线和时区查询'],
  'nano-pdf': ['轻量 PDF', '用自然语言修订 PDF 文本、错字和标题'],
  notion: ['Notion', '管理 Notion 页面、数据库、Markdown 和 Workers'],
  'ocr-and-documents': ['OCR 与文档', '从 PDF 和扫描件中提取文本'],
  petdex: ['宠物图鉴', '安装并选择 Hermes 的动画宠物助手'],
  'teams-meeting-pipeline': ['Teams 会议流程', '汇总 Teams 会议、检查状态并重放任务'],
  arxiv: ['arXiv 论文', '按关键词、作者、分类或 ID 检索 arXiv 论文'],
  blogwatcher: ['博客监控', '通过 blogwatcher-cli 监控博客和 RSS/Atom 订阅'],
  'llm-wiki': ['LLM 知识库', '构建和查询互相链接的 LLM Markdown 知识库'],
  polymarket: ['Polymarket', '查询预测市场、价格、订单簿和历史数据'],
  'research-paper-writing': ['研究论文写作', '规划、撰写和修改机器学习会议论文'],
  openhue: ['OpenHue 智能家居', '控制 Philips Hue 灯光、场景和房间'],
  xurl: ['社交链接解析', '通过 xurl CLI 发布、搜索和管理 X/Twitter 内容'],
  'hermes-agent-skill-authoring': ['Hermes 技能编写', '编写符合前置元数据、校验和结构规范的 SKILL.md'],
  'node-inspect-debugger': ['Node 调试器', '通过 --inspect 和 Chrome DevTools 调试 Node.js'],
  plan: ['任务规划', '将目标拆分为可执行的 Markdown 开发计划'],
  'python-debugpy': ['Python 调试', '使用 pdb 和 debugpy 诊断 Python 程序'],
  'requesting-code-review': ['请求代码审查', '在提交前完成安全扫描、质量检查和自动修复'],
  'simplify-code': ['代码简化', '并行清理近期代码变更，同时保持原有行为'],
  spike: ['技术预研', '通过短期实验验证不确定的技术方案'],
  'systematic-debugging': ['系统化调试', '按理解、定位和验证步骤排查根本原因'],
  'test-driven-development': ['测试驱动开发', '贯彻 RED-GREEN-REFACTOR 的测试优先流程'],
  yuanbao: ['元宝', '管理元宝群组中的成员、提及和信息查询'],
  '1password': ['1Password', '安装、配置并使用 1Password CLI 读取和注入密钥'],
  godmode: ['模型越狱红队测试', '使用提示词攻击模式对授权模型开展安全红队测试'],
  'oss-forensics': ['开源软件取证', '调查 GitHub 仓库供应链事件、恢复证据并生成取证报告'],
  sherlock: ['用户名开源情报搜索', '通过 Sherlock 在四百多个社交网络中检索用户名'],
  unbroker: ['个人信息清除', '查找并协助清除数据经纪商网站暴露的个人信息'],
  'web-pentest': ['Web 渗透测试', '在明确授权范围内执行 Web 应用侦察、漏洞验证和报告'],
  'adversarial-ux-test': [
    '压力测试',
    '扮演最挑剔、最不擅长技术的用户测试产品，筛出真实体验问题并生成可执行工单'
  ]
}

const zhToolsets: Readonly<Record<string, LocalizedCopy>> = {
  web: ['网页访问', '搜索并读取网页内容'],
  search: ['网络搜索', '搜索互联网信息'],
  x_search: ['X 搜索', '搜索 X 平台内容'],
  vision: ['视觉', '分析图片与视觉内容'],
  video: ['视频', '处理视频内容'],
  image_gen: ['图像生成', '生成和编辑图像'],
  video_gen: ['视频生成', '生成视频内容'],
  computer_use: ['计算机操作', '操作桌面应用和界面'],
  terminal: ['终端', '执行终端命令'],
  skills: ['技能', '查找、加载和管理技能'],
  browser: ['浏览器', '使用浏览器完成网页交互'],
  cronjob: ['定时任务', '创建和管理定时任务'],
  file: ['文件', '读取、搜索和编辑文件'],
  tts: ['文本转语音', '将文字转换为语音'],
  todo: ['任务清单', '管理任务和待办事项'],
  memory: ['记忆', '检索和管理长期记忆'],
  context_engine: ['上下文引擎', '管理上下文处理能力'],
  session_search: ['会话搜索', '搜索历史会话'],
  project: ['项目', '管理项目工作区'],
  clarify: ['需求澄清', '通过提问补充任务所需的信息和约束'],
  code_execution: ['代码执行', '执行代码'],
  delegation: ['任务委派', '将任务委派给子代理'],
  homeassistant: ['Home Assistant', '控制智能家居'],
  kanban: ['看板', '管理看板任务'],
  debugging: ['调试', '诊断和排查问题'],
  safe: ['安全模式', '使用受限的安全工具集'],
  coding: ['编程', '软件开发工具集'],
  spotify: ['Spotify', '控制播放、搜索音乐并管理播放列表和音乐库'],
  discord: ['Discord', '读取消息、搜索成员并参与 Discord 会话'],
  discord_admin: ['Discord 服务器管理', '管理 Discord 频道、角色、置顶消息和成员角色'],
  yuanbao: ['元宝', '查询元宝群组、成员并发送私信']
}

const zhCategories: Readonly<Record<string, string>> = {
  general: '通用',
  productivity: '生产力',
  creative: '创意',
  research: '研究',
  mlops: 'MLOps',
  'software-development': '软件开发',
  'autonomous-ai-agents': '自主智能体',
  'data-science': '数据科学',
  'note-taking': '笔记',
  'smart-home': '智能家居',
  'social-media': '社交媒体',
  apple: 'Apple',
  github: 'GitHub',
  media: '媒体',
  email: '邮件'
}

const isChinese = (locale: Locale): boolean => locale === 'zh' || locale === 'zh-hant'
const isOfficial = (skill: SkillInfo): boolean => skill.official === true || skill.provenance === 'bundled'

export function localizeSkillName(skill: SkillInfo, locale: Locale): string {
  return isChinese(locale) && isOfficial(skill) ? (zhBuiltInSkills[skill.name]?.[0] ?? skill.name) : skill.name
}

export function localizeSkillDescription(skill: SkillInfo, locale: Locale): string {
  return isChinese(locale) && isOfficial(skill)
    ? (zhBuiltInSkills[skill.name]?.[1] ?? skill.description)
    : skill.description
}

/** The backend extracts this Markdown preview from the actual SKILL.md. A
 * missing Chinese translation deliberately falls back to that original text. */
export function localizeSkillDetail(skill: SkillInfo, locale: Locale): string {
  if (!isOfficial(skill)) return skill.description
  if (isChinese(locale)) return localizeSkillDescription(skill, locale)
  return skill.detail || skill.description
}

export function localizeSkillCategory(category: string, locale: Locale): string {
  return isChinese(locale) ? (zhCategories[category] ?? category) : category
}

export function localizeToolsetName(name: string, fallback: string, locale: Locale): string {
  return isChinese(locale) ? (zhToolsets[name]?.[0] ?? fallback) : fallback
}

export function localizeToolsetDescription(name: string, fallback: string, locale: Locale): string {
  return isChinese(locale) ? (zhToolsets[name]?.[1] ?? fallback) : fallback
}

/** Search must remain bilingual regardless of the selected UI language. */
export function skillSearchTexts(skill: SkillInfo): readonly string[] {
  const localized = zhBuiltInSkills[skill.name]
  return [skill.name, skill.description, localized?.[0] ?? '', localized?.[1] ?? '']
}

export function toolsetSearchTexts(name: string, label: string, description: string): readonly string[] {
  const localized = zhToolsets[name]
  return [name, label, description, localized?.[0] ?? '', localized?.[1] ?? '']
}
