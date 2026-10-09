import type { TranslationOverrides } from './define-locale'

export const zhSourceUpdates = {
  externalOpenFailed: {
    missing: {
      title: '找不到文件',
      message: '此文件不存在，可能已被删除或移动，也可能位于另一台计算机上。'
    }
  },
  appTour: {
    sessions: {
      text: '所有对话都在这里，可以搜索、置顶或重新打开。'
    },
    composer: {
      text: '告诉 Mira 你想完成什么，输入 @ 添加文件。'
    },
    newSession: {
      text: '每个新会话都有独立上下文，建议每项任务使用一个会话。'
    },
    model: {
      text: '选择为你回答的模型。'
    },
    modelLocal: '这台计算机可以运行本地模型：设置 → 提供商 → 本地模型。',
    capabilities: {
      text: '在这里添加 Mira 可以使用的技能、工具和插件。'
    },
    messaging: {
      text: '通过 Telegram、Slack、Discord 等平台与 Mira 交流。'
    },
    rightPane: {
      title: '工作面板',
      text: '在右侧打开文件、终端、代码审查和内置浏览器。'
    }
  },
  connectors: {
    checking: '正在检查你的应用…'
  },
  connectorsPage: {
    residencyLocal: '在此设备上',
    group: {
      connectedNote: '优先显示连接异常的应用。',
      offNote: '保留登录状态。'
    },
    card: {
      inCatalog: '来自 Mira 目录',
      hostedTwin: '有托管版本可用',
      alsoLocal: '也可在此设备上运行',
      state: {
        couldNotConnect: '无法连接',
        offByYourOrganisation: '已被组织停用',
        offForYou: '已为你停用'
      },
      verb: {
        turnBackOn: '重新启用'
      },
      reason: {
        finishSignIn: '请在浏览器中完成登录。',
        reconnect: '重新连接以继续使用此应用。',
        serverError: '服务器拒绝了连接。',
        serverNeedsAuth: '请登录以使用此服务器。'
      }
    },
    page: {
      loading: '正在读取目录和此计算机上的服务器',
      emptyTitle: '还没有应用。添加此计算机上的服务器即可开始。',
      noMatchTitle: '没有匹配的应用',
      noMatchBody: '没有匹配项。可以添加你自己的 MCP 服务器。',
      clearSearch: '清空搜索',
      hostedFailedTitle: '无法连接托管应用。',
      hostedFailedBody: '此计算机上的服务器不受影响，仍在运行；没有应用被停用。',
      showAllMatches: '显示全部匹配项',
      freeTierNote: '登录前，连接信息保留在此计算机上。',
      signInLine: '登录 Nous 以使用托管应用。',
      managedUnavailable: '此账户暂时无法使用托管应用。',
      writeFailed: '更改未保存。',
      refreshFailed: '工具列表未刷新。',
      disconnectNoAccount: 'Mira 在这里没有可断开的账户，请刷新页面后重试。',
      disconnectRefused: 'Nous 暂时无法移除此登录。可以先用开关停用应用，或稍后重试。'
    },
    add: {
      action: '添加自己的服务',
      title: '连接自定义 MCP',
      hint: '在此设备的 mcp.json 中新增一个条目',
      pasteLabel: '粘贴命令或配置片段',
      pasteNoMatch: '未识别出服务器配置，请填写下方字段。',
      nameTaken: '此名称已被使用。',
      command: '启动命令',
      addEnvVar: '+ 添加环境变量',
      passthrough: '环境变量透传',
      removeRow: '移除此行',
      saveFailed: '服务器未保存。'
    },
    dialog: {
      disconnectBody: 'Mira 将停止使用此账户，你可以随时重新连接。',
      removeServerBody: '从此计算机的 mcp.json 中移除此条目，其他内容不会被删除。',
      turnOffLocal: '停用本地服务器',
      openPlugins: '打开插件选项卡',
      nousLine: 'Nous 应用跟随账户，不随配置档切换。',
      rulesReadOnly: '暂时无法更改规则。',
      rulesSignIn: '登录后可以更改 Mira 在这里的权限。',
      orgLink: '打开连接器管理',
      connectEnded: '登录未完成。',
      connectOpenAgain: '重新打开链接',
      tokensPerCall: '每次调用的 token 数',
      advancedHint: 'mcp.json 条目和日志'
    },
    tools: {
      notInstalledBody: '在此设备上安装后即可查看它提供的工具。',
      allToolsSwitch: '启用或停用全部工具',
      staleSignIn: '登录以读取最新工具列表。',
      quickNoDestructive: '停用破坏性工具',
      lockedHint: '已被组织停用',
      noMatch: '没有工具符合这些筛选条件。',
      loading: '正在读取工具列表',
      unavailableLine: '工具列表不可用。',
      needsAuthBody: '登录信息仅保留在此计算机上，不会传出。',
      goneBody: 'Mira 已无法调用此工具。此条目会保留，直到你手动移除。',
      offBody: '使用上方开关启用后，可以读取它提供的工具。',
      signedOutTitle: '登录 Nous 以读取工具列表。',
      signedOutBody: '此计算机上的服务器不受影响。',
      conflictTitle: '你编辑时，有人更改了此规则。',
      conflictReload: '加载对方的版本',
      conflictSave: '用我的版本覆盖',
      saveFailed: '工具规则未保存。'
    },
    vocabulary: {
      facetRead: {
        long: '从此应用读取数据，不修改任何内容。'
      },
      facetWrite: {
        long: '在此应用中创建或修改内容。'
      },
      facetDestructive: {
        long: '可能永久删除此应用中的内容。'
      },
      facetUnclassified: {
        long: '此应用未说明此工具的用途。'
      },
      hintReadOnly: {
        long: '此工具声明只读取数据。'
      },
      hintCreate: {
        long: '创建新内容。'
      },
      hintUpdate: {
        long: '修改已有内容。'
      },
      hintDestructive: {
        long: '此工具的更改无法在这里撤销。'
      },
      hintIdempotent: {
        long: '执行两次与执行一次的结果相同。'
      },
      hintOpenWorld: {
        long: '访问此应用之外的资源。'
      }
    }
  },
  fileMenu: {
    revealUnavailable: '此路径位于后端计算机上，请使用“在文件树中显示”。'
  },
  boot: {
    errors: {
      gatewaySignInRequiredDetail: '请重新登录以恢复连接，你的对话和设置不会丢失。',
      signInAgain: '重新登录'
    },
    causes: {
      exitedEarly: 'Mira 的后台服务刚启动就停止了。',
      timedOut: 'Mira 的后台服务未及时响应。',
      permission: 'Mira 无法写入数据文件夹，请检查权限。',
      diskFull: '磁盘空间不足，Mira 无法启动。',
      portInUse: 'Mira 需要的网络端口被其他程序占用。',
      installMissing: 'Mira 的安装文件不完整，请选择“修复安装”。'
    },
    updateHold: {
      title: '上一次更新仍占用 Mira',
      titleUnverified: '无法确认上一次更新已完成',
      description: '为避免加载更新过程中仍在修改的文件，Mira 暂缓启动；占用解除后会自动启动。',
      heldUnknown: '更新已退出，但它启动的某个进程仍占用 Mira 安装目录。',
      unverified: '更新助手暂时无法确认安装目录由哪个进程占用，Mira 会继续检查。',
      recoveryHint:
        '通常几分钟后会恢复。如果仍未恢复，请退出 Mira，结束残留的 git 或 hermes 进程，或重启计算机后重新打开。',
      confirmTitle: '在更新仍占用安装目录时启动 Mira？',
      confirmBody:
        '残留的更新进程可能仍在修改 Mira 文件。现在启动可能加载不完整的安装，需再次更新才能恢复。Mira 会记录此选择并保留更新标记。',
      startAnywayRefused: 'Mira 启动前，安装目录的占用状态发生了变化，请检查后重试。'
    }
  },
  notifications: {
    compressDeferredDone: '上下文压缩已完成',
    errors: {
      storageFailure: 'Mira 无法保存到数据文件夹，请打开“维护”进行检查和修复。',
      rpcOutOfSync: '应用与后端版本不一致，请更新两者。',
      restartHermesFailed: '无法重启 Mira'
    }
  },
  keybinds: {
    actions: {
      'view.cycleSidebarGrouping': '切换会话分组',
      'view.toggleHud': '切换 HUD 模式',
      'hud.snapToPointer': '将 HUD 移到指针处（HUD 打开时，全局生效）',
      'view.tabSlot.1': '切换到选项卡 1',
      'view.tabSlot.2': '切换到选项卡 2',
      'view.tabSlot.3': '切换到选项卡 3',
      'view.tabSlot.4': '切换到选项卡 4',
      'view.tabSlot.5': '切换到选项卡 5',
      'view.tabSlot.6': '切换到选项卡 6',
      'view.tabSlot.7': '切换到选项卡 7',
      'view.tabSlot.8': '切换到选项卡 8',
      'view.tabSlot.9': '切换到选项卡 9'
    }
  },
  settings: {
    fieldLabels: {
      'desktop.repoScanEnabled': '自动发现代码仓库',
      'desktop.repoScanRoots': '仓库扫描目录',
      'desktop.repoScanExcludePaths': '排除的仓库路径',
      'agent.maxTurns': '智能体最大步骤数',
      'toolOutput.maxBytes': '终端输出上限',
      'toolOutput.maxLines': '文件分页上限',
      'toolOutput.maxLineLength': '单行长度上限',
      'codeExecution.mode': '代码执行模式',
      'approvals.mcpReloadConfirm': '重新加载 MCP 前确认',
      'security.allowPrivateUrls': '允许访问内网 URL',
      'browser.allowPrivateUrls': '浏览器允许访问内网 URL',
      'browser.autoLocalForPrivateUrls': '内网 URL 使用本地浏览器',
      'browser.useRealProfile': '使用我的真实浏览器配置',
      'voice.maxRecordingSeconds': '最长录音时间',
      'voice.autoTts': '朗读回复',
      'voice.voiceChatMode': '语音对话模式',
      'stt.enabled': '语音转文字',
      'stt.local.model': '本地转录模型',
      'stt.openai.model': 'OpenAI 语音转文字模型',
      'stt.openai.streamingModel': 'OpenAI 实时转录模型',
      'stt.groq.model': 'Groq 语音转文字模型',
      'stt.mistral.model': 'Mistral 语音转文字模型',
      'stt.xai.model': 'xAI 语音转文字模型',
      'stt.deepinfra.model': 'DeepInfra 语音转文字模型',
      'stt.elevenlabs.modelId': 'ElevenLabs 语音转文字模型',
      'stt.elevenlabs.tagAudioEvents': '标注音频事件',
      'tts.openai.model': 'OpenAI 语音合成模型',
      'tts.xai.speed': 'xAI 播放速度',
      'tts.xai.autoSpeechTags': 'xAI 自动语音标签',
      'tts.xai.optimizeStreamingLatency': 'xAI 流式延迟优化',
      'tts.xai.sampleRate': 'xAI 采样率',
      'tts.xai.bitRate': 'xAI 比特率',
      'tts.minimax.model': 'MiniMax 语音合成模型',
      'tts.mistral.model': 'Mistral 语音合成模型',
      'tts.gemini.model': 'Gemini 语音合成模型',
      'tts.deepinfra.model': 'DeepInfra 语音合成模型',
      'compression.codexGpt55Autoraise': 'Codex 自动提高压缩阈值',
      'compression.protectLastN': '保留的最近消息数',
      'auxiliary.compression.timeout': '压缩模型超时（秒）',
      'delegation.maxIterations': '子智能体轮次上限',
      'delegation.reasoningEffort': '子智能体推理强度',
      'updates.nonInteractiveLocalChanges': '应用内更新时的本地改动处理'
    },
    fieldDescriptions: {
      'display.personality': '新会话使用的默认助手风格。',
      'display.showReasoning': '后端提供推理内容时显示推理区域。',
      'desktop.repoScanEnabled': '扫描本地文件夹中的 Git 仓库，并显示在项目列表中。',
      'desktop.repoScanRoots': '要扫描的文件夹，留空则扫描用户主目录。',
      'desktop.repoScanExcludePaths': '仓库发现时跳过的文件夹及其子目录。',
      'browser.useRealProfile':
        '本地浏览器使用你的真实登录状态。Mira 将默认浏览器的配置（Cookie、登录信息和偏好）复制为托管快照，使用自带 Chromium 操作；不会直接打开正在使用的配置，每次运行会刷新副本。即使配置了云端浏览器，智能体也可按请求打开本地配置会话。仅支持 Chrome、Edge、Brave、Brave Origin 和 Chromium；其他默认浏览器会提示错误。默认关闭。',
      'agent.imageInputMode': '控制图片附件发送给模型的方式。',
      'agent.maxTurns': 'Mira 单次任务允许的工具调用轮次上限。',
      'terminal.cwd': '工具和终端工作的默认项目目录。',
      'terminal.persistentShell': '后端支持时，在命令之间保留 Shell 状态。',
      'terminal.envPassthrough': '传入工具执行环境的环境变量。',
      'terminal.dockerImage': 'Docker 执行后端使用的容器镜像。',
      'terminal.singularityImage': 'Singularity 执行后端使用的镜像。',
      'terminal.modalImage': 'Modal 执行后端使用的镜像。',
      'terminal.daytonaImage': 'Daytona 执行后端使用的镜像。',
      'codeExecution.mode': '代码执行限制在当前项目内的严格程度。',
      'approvals.mode': 'Mira 处理需要明确批准的命令的方式。',
      'approvals.timeout': '批准请求的等待时间，超时后取消。',
      'security.redactSecrets': '尽可能从模型可见内容中隐藏检测到的密钥。',
      'checkpoints.enabled': '编辑文件前创建可回滚的快照。',
      'memory.memoryEnabled': '保存可用于后续会话的长期记忆。',
      'memory.userProfileEnabled': '维护精简的用户偏好信息。',
      'context.engine': '对话接近上下文上限时的管理策略。',
      'compression.enabled': '对话变长时概括较早的上下文。',
      'compression.codexGpt55Autoraise': '对支持的 ChatGPT Codex OAuth 模型，将压缩阈值提高到 85%。',
      'auxiliary.compression.timeout': '每次辅助压缩模型调用的等待秒数，默认 120 秒；较慢的本地模型可适当提高。',
      'voice.autoTts': '自动朗读助手回复。',
      'voice.voiceChatMode':
        'chained：使用下方提供商完成语音转文字 → Mira → 语音合成。gpt-live：由 OpenAI 全双工语音模型 gpt-live-1 负责听说，将实际请求交给 Mira；你选择的模型仍可使用完整工具集。需要 OpenAI API 密钥，语音层费用为每分钟 0.05 美元。',
      'voice.gptLive.voice': 'GPT-Live 模式的声音，支持自定义声音 ID。',
      'voice.gptLive.instructions': '实时语音角色的额外指令，如语气、节奏和语言；Mira 保留自己的系统提示词。',
      'tts.xai.voiceId': 'xAI 声音 ID（如 eve）或自定义声音 ID。',
      'tts.xai.language': '朗读语言代码（如 en、pt-BR），或使用 auto 自动检测。',
      'tts.xai.autoSpeechTags': '合成前，让模型在文本中添加笑声、叹气等表现力标签。',
      'tts.xai.sampleRate': '音频采样率，越高质量越好，文件也越大。',
      'tts.xai.bitRate': 'MP3 比特率（bps），仅在使用 mp3 格式时生效。',
      'tts.neutts.device': 'NeuTTS 本地推理使用的设备。',
      'stt.enabled': '启用本地或提供商提供的语音转录。',
      'stt.echoTranscripts': '将语音消息的原始 🎙️ 转录文本发回对话。',
      'stt.streaming': '说话时显示文字（OpenAI、xAI、ElevenLabs）；失败时回退到录音转录。',
      'stt.elevenlabs.languageCode': '可选的 ISO-639-3 语言代码，留空由 ElevenLabs 自动检测。',
      'updates.nonInteractiveLocalChanges':
        'Mira 从应用内更新时，保留本地源码改动（stash）或丢弃（discard）；终端更新始终会询问。'
    },
    uninstallSection: {
      managedBody: '此安装由系统管理，Mira 无法自行卸载。',
      openAppsSettings: '打开应用设置'
    },
    model: {
      mainAppliedTitle: '主模型已更新'
    },
    toolsets: {
      terminalBackend: {
        unavailableTitle: '终端命令不可用',
        openBackendSettings: '打开终端设置',
        switchedToLocal: '终端命令现在在本地运行，对新会话生效。'
      }
    }
  },
  skills: {
    plugins: {
      serverStates: {
        app_not_running: '应用未运行',
        hermes_not_connected: '缺少 MCP 连接',
        no_interactive_session: '没有交互式会话',
        version_too_old: '版本过旧',
        unsupported_gpu: '不支持此 GPU'
      }
    }
  },
  messaging: {
    restartFailedManualDetail: '请再次尝试重启；如果仍失败，请打开日志并发送诊断信息。'
  },
  cron: {
    lastRunFailed: '上次运行失败：'
  },
  sidebar: {
    storageCorrupt: {
      title: '会话数据库已损坏',
      action: '请退出此配置档中的 Mira，然后以只读方式检查文件，或恢复快照：'
    }
  },
  updates: {
    openDownloadPage: '打开下载页面'
  },
  onboarding: {
    useApiKeyInstead: '改用 API 密钥'
  },
  freeTier: {
    unreachableBody: 'Mira 无法连接 Nous 服务以完成登录，请检查网络后重试。你的会话仍然保留。',
    setupFailed: {
      gateClosed: '此版本的 Mira 需要 Nous 账户才能启动。登录或创建免费账户即可继续。',
      paused: '未登录使用 Mira 的服务暂时暂停，Mira 会继续检查。免费登录即可立即开始。',
      unreachable: 'Mira 无法连接 Nous 服务，请检查网络后重试，或暂时连接其他提供商。',
      serverError: 'Nous 服务暂时出现问题，请稍后重试，或暂时连接其他提供商。',
      powRequired: 'Nous 服务器要求工作量证明，但当前 Agent 尚未实现。请登录或创建免费 Nous 账户以继续。',
      locked: '未登录无法继续此会话，请登录或创建免费 Nous 账户。',
      generic: 'Mira 无法启用免登录访问。你可以免费登录，或连接其他提供商。',
      signInBelow: '登录免费，请在下方选择 Nous。'
    }
  },
  preview: {
    missingTarget: '此路径在当前计算机上不存在'
  },
  assistant: {
    thread: {
      errorLayerBodies: {
        auth: 'AI 服务拒绝了登录，请检查此提供商的凭据后重新发送。',
        billing: '此提供商的账户余额不足，请充值或切换提供商后重新发送。',
        disk: '磁盘空间不足，Mira 无法保存此对话，请释放空间后重试。',
        gateway: 'Mira 启动回复时遇到内部问题，请重新发送；如果持续发生，请发送诊断信息。',
        runtime: 'Mira 启动回复时遇到内部问题，请重新发送；如果持续发生，请发送诊断信息。'
      },
      errorCodes: {
        billing: {
          title: '余额不足'
        },
        stream_drop: {
          title: '回复中断',
          body: '连接在回复完成前中断，请重试。'
        },
        no_reply: {
          title: '回复未完成',
          body: 'Mira 本轮未生成回复，请重试。'
        },
        upstream_blocked: {
          title: '请求被防火墙阻止'
        },
        context_overflow: {
          title: '对话过长',
          body: '对话超出模型的上下文容量，请压缩对话或新建会话后重新发送。'
        },
        payload_too_large: {
          title: '消息过大',
          body: '请求超出模型限制，请压缩对话或新建会话后重新发送。'
        },
        model_not_found: {
          title: '此模型不可用'
        },
        truncated: {
          title: '回复被截断',
          body: '模型在完成前停止，请重试以获取完整回复。'
        },
        loop_error: {
          title: 'Mira 陷入循环',
          body: '回复不断重复相同步骤，Mira 已停止。请重试；若再次发生，请新建会话。'
        },
        SESSION_NOT_OWNED: {
          title: '此对话已在其他位置打开',
          body: '此对话已在另一个 Mira 窗口或终端中打开。请在那里关闭后重新发送，或在这里新建会话。'
        },
        disk_full: {
          body: '磁盘空间不足，Mira 无法保存此对话，请释放空间后重试。'
        },
        free_tier_disabled: {
          title: '免登录使用 Mira 暂时关闭',
          body: '登录 Nous 账户即可继续对话，登录免费。'
        },
        free_tier_rate_limited: {
          title: '免登录对话额度已用完',
          body: '额度即将刷新。免费登录 Nous 账户可获得更高额度。'
        },
        free_tier_at_capacity: {
          title: '免登录对话服务繁忙',
          body: '免费登录可跳过等待，也可以稍后重试。'
        },
        free_tier_model_not_free: {
          title: '未登录时无法使用此模型',
          body: 'Mira 暂时使用免费模型，免费登录 Nous 账户可使用更多模型。'
        },
        free_tier_route: {
          title: 'Mira 无法通过此路由连接免费模型',
          body: '请免费登录 Nous 账户，或检查 NOUS_INFERENCE_BASE_URL 设置。'
        },
        free_tier_outage: {
          title: '免费模型暂时无法响应',
          body: '请稍等片刻后重新发送。'
        },
        free_tier_refused: {
          title: '未登录时，Mira 无法发送此请求',
          body: '登录 Nous 账户是免费的。'
        }
      },
      errorToastTitle: 'Mira 无法完成回复',
      errorChooseModel: '选择模型',
      errorCompressFailed: '无法压缩对话',
      errorOpenHermesFolder: '打开 Mira 文件夹',
      errorOpenHermesFolderFailed: '无法打开 Mira 文件夹',
      errorUpdateApiKey: '更新 API 密钥',
      errorSignInFreeTier: '登录 Nous 账户'
    },
    approval: {
      timedOutSystemLine: '批准请求已超时，命令未执行。请让 Mira 重试，或在设置 → 安全 → 批准超时中增加等待时间。',
      openSafetySettings: '打开安全设置'
    },
    catalogInstall: {
      phase: {
        python_packages: '正在安装 Python 包…',
        loading_tools: '正在加载工具…'
      },
      notEnabled: '已安装，但尚未启用',
      alreadyInstalled: '已安装，保留现有状态'
    }
  }
} satisfies TranslationOverrides
