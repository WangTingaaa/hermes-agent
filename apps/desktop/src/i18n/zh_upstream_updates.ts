import type { TranslationOverrides } from './define-locale'

export const zhUpstreamUpdates = {
  connectorOffer: {
    heading: '保留已连接的应用',
    body: '登录免费的 Nous 账户，将 Gmail、Slack 等已连接的应用保存到你的账户。'
  },
  catalog: {
    tier: '级别',
    previousSlide: '上一个精选',
    nextSlide: '下一个精选',
    slideOf: (index, count) => `第 ${index} 项，共 ${count} 项`,
    tierLabels: { official: '官方', verified: '已验证', community: '社区' },
    tiers: {
      official: { title: '官方插件', blurb: '由 Nous Research 开发和维护。' },
      verified: { title: '已验证插件', blurb: '由集成服务的官方团队提供，并经 Nous 验证。' }
    },
    moreToExplore: '更多探索',
    moreToExploreBlurb: '在这里发现目录中的更多内容。',
    skillsFor: category => `${category}相关技能。`,
    discoverKind: kind => `探索${kind}`,
    developer: {
      heading: '开发者模式',
      title: '为 Mira 开发',
      pitch: '开发了工具、连接器、插件或 Mod？',
      pitchFollowUp: '想动手，却不知道从何开始？',
      submit: '提交 Mod',
      docs: '开发者文档'
    },
    toolsets: {
      mostUsed: '最常使用',
      mostUsedBlurb: 'Mira 在此配置文件中最常使用的工具集。',
      essentials: '基础工具',
      essentialsBlurb: 'Mira 完成日常任务所需的常用工具。',
      toolCount: count => `${count} 个工具`,
      callCount: count => `${count} 次调用`,
      themes: {
        work: { label: '浏览、工作与自动化', blurb: '操作浏览器和桌面、编辑文件、运行代码并安排任务。' },
        create: { label: '视觉、音频与创作', blurb: '查看图片和视频、转录语音并生成媒体。' },
        recall: { label: '记忆与知识', blurb: 'Mira 的记忆，以及可以搜索的技能和历史记录。' },
        connect: { label: '连接与沟通', blurb: '连接账户、其他智能体和智能家居，并搜索更多信息来源。' },
        more: { label: '更多工具', blurb: '此配置文件可以启用的其他工具。' }
      }
    }
  },
  boot: {
    failure: {
      webappTitle: '登录 Mira',
      webappDescription: '在这台电脑上运行 hermes webapp，让此浏览器完成登录。'
    }
  },
  settings: { plugins: { enable: '启用', disable: '停用' } },
  skills: {
    plugins: {
      updateScanTitle: name => `安全扫描发现 ${name} 存在风险`,
      updateScanBody: (name, count) =>
        `${name} 的更新被评为需谨慎（发现 ${count} 项问题）。每次更新都会扫描，请仅在信任来源时应用：`,
      updateScanMore: count => `另有 ${count} 项`,
      updateScanConfirm: '仍然更新',
      updateScanBlocked: name => `安全扫描已阻止 ${name} 的更新（评为危险），无法跳过此限制。`,
      updatedGit: name => `${name} 已更新到最新提交。`,
      settingsForm: { optional: '（可选）' }
    }
  },
  gatewayGroupOpen: {
    opening: '正在打开网关群组…',
    lookupFailed: '无法在网关上查找此群组，请重试。',
    missing: '此网关群组已不存在。'
  },
  shell: {
    statusbar: {
      togglePlanUsage: '方案用量',
      planUsageTitle: (used, resetsIn) =>
        `已使用方案用量的 ${used}${resetsIn ? ` · ${resetsIn}后重置` : ''} · 打开账单`
    }
  },
  rightSidebar: {
    terminalDropUploadFailed: name => `无法上传 ${name}`,
    terminalDropTooLargeTitle: '文件过大，无法上传',
    terminalDropTooLarge: (names, limit) => `每个文件最多 ${limit}。未上传：${names}`,
    terminalDropControlTitle: '未输入到终端',
    terminalDropControl: paths => `以下名称包含会被终端解释为按键的控制字符：${paths}`
  },
  assistant: {
    thread: {
      errorCodes: {
        SESSION_OWNER_BUSY: {
          title: 'Mira 正在此对话中工作',
          body: '这里有一轮任务正在运行，你的消息未能加入队列，尚未发送。请在该任务结束后重试。'
        },
        SESSION_OWNER_UNCONFIRMED: {
          title: '你的消息可能已加入队列',
          body: '网关未及时确认你的消息。如果已入队，它会在前一轮任务结束或问题解决后执行。请先检查对话，再决定是否重新发送。'
        }
      }
    },
    catalogInstall: { requiresHermes: range => `Mira ${range}` }
  }
} satisfies TranslationOverrides
