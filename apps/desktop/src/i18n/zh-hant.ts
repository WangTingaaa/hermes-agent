import { defineLocale, type TranslationOverrides } from './define-locale'
import { introZhHant } from './intro-zh-hant'
import { zhHantArtifacts } from './zh-hant_artifacts'
import { zhHantAssistant } from './zh-hant_assistant'
import { zhHantBoot } from './zh-hant_boot'
import { zhHantCapabilities } from './zh-hant_capabilities'
import { zhHantChat } from './zh-hant_chat'
import { zhHantChrome } from './zh-hant_chrome'
import { zhHantCommandCenter } from './zh-hant_command_center'
import { zhHantCommon } from './zh-hant_common'
import { zhHantConnectors } from './zh-hant_connectors'
import { zhHantDiagnostics } from './zh-hant_diagnostics'
import { zhHantSettings } from './zh-hant_settings'

export const zhHantOverrides = {
  skillDeepLink: {
    installTitle: (name: string) => `安裝「${name}」？`,
    installDescription: '此技能將於新的工作階段中可用。請僅安裝可信來源的內容。',
    installTo: '安裝至',
    thisComputer: '這部電腦',
    installing: '正在安裝…',
    installComplete: (name: string) => `已安裝「${name}」`,
    destinationChanged: '安裝目標已變更。請關閉此對話框並重新開啟安裝連結。',
    installed: '已安裝',
    source: '來源'
  },
  externalOpenFailed: {
    title: '無法開啟此連結',
    message: '沒有註冊用於開啟此位址的瀏覽器。請複製連結並手動開啟。',
    copyUrl: '複製連結',
    close: '關閉'
  },
  sharedMetrics: {
    consentTitle: '分享使用統計？',
    dialogTitle: '使用統計',
    consentBody:
      'Mira 可以統計你的使用方式：工作階段長度、執行了哪些模型和工具，以及何時發生失敗。它絕不記錄你的訊息、檔案、路徑或錯誤文字。',
    whatIsCollected: '統計哪些內容',
    collectedActivity: '工作階段：長度、結果、錯誤類型、每日活躍時間',
    collectedModels: '模型：使用哪些模型、token 總量',
    collectedNames: '功能：使用或關閉的內建工具、指令、應用程式區域和設定',
    collectedMilestones: '設定：完成了哪些步驟、提供方連線、技能、外掛和排程工作的數量',
    collectedReliability: '應用程式健康狀態：當機、啟動與回覆速度、更新、訊息平台連線',
    collectedUsage: '代理品質：未成功的編輯、損壞的工具呼叫、卡住的迴圈、每個任務的成本',
    collectedMachine: '機器：作業系統、記憶體範圍、GPU 類型、Mira 版本、本機模型使用情況',
    sending:
      '除非你選擇分享，否則統計資料只會保留在這台電腦上。分享的統計資料每天傳送給 Nous 一次，並附帶此設定檔的隨機 ID。除了一則 Mira 已安裝的一次性記錄（僅在你同意後計入）之外，你同意之前的統計資料永遠不會被傳送。你可以隨時在設定中變更。',
    readDocs: '查看完整說明',
    share: '與 Nous 分享',
    local: '保留在這部電腦上',
    off: '不用了',
    saveFailed: '無法儲存你的選擇',
    collectLabel: '收集使用統計',
    collectDesc: '僅限計數，保留在這部電腦上。絕不包含你的訊息、檔案、路徑或錯誤文字。',
    sendLabel: '與 Nous 分享使用統計',
    sendDesc:
      '每天一次將統計資料連同此設定檔的隨機 ID 傳送給 Nous。除一次性的安裝記錄外，你同意之前的統計資料絕不會被傳送。需要先開啟收集。',
    unavailable: '請更新 Mira 後端以變更此設定。',
    stripBody: '僅限計數，絕不包含你的訊息或檔案。',
    stripReaskBody: '再次詢問：舊版本可能在你看到此問題之前就已儲存了「不用了」。',
    stripChoices: { share: '與 Nous 分享', local: '保留在這部電腦上', off: '不用了' },
    stripDetails: '詳細資訊'
  },
  intro: introZhHant,
  sessionImport: zhHantConnectors.sessionImport,
  common: zhHantCommon.common,
  fileMenu: zhHantChrome.fileMenu,
  boot: zhHantBoot.boot,
  notifications: zhHantDiagnostics.notifications,
  remoteDisplayBanner: zhHantBoot.remoteDisplayBanner,
  butterbar: zhHantBoot.butterbar,
  billingBlock: zhHantCommon.billingBlock,
  sendDiagnostics: zhHantDiagnostics.sendDiagnostics,
  titlebar: zhHantChrome.titlebar,
  language: zhHantSettings.language,
  settings: {
    ...zhHantSettings.settings,
    about: {
      heading: 'Mira Agent Desktop',
      version: value => `版本 ${value}`,
      versionUnavailable: '版本不可用',
      updates: '更新',
      checkNow: '立即檢查',
      checking: '檢查中…',
      seeWhatsNew: '查看新增內容',
      updateNow: '立即更新',
      releaseNotes: '發行說明',
      runtimeChanges: '本次更新內容',
      runtimeNoNotes: '此版本暫未提供詳細更新說明。',
      runtimeUpdateReady: (current, target) =>
        `Mira Agent 有可用更新：${current || '目前版本'} → ${target || '最新版本'}`,
      runtimeUpdating: (target, progress) => `正在更新至 Mira Agent ${target || '最新版本'}（${progress || 0}%）`,
      runtimeReleaseNotes: {
        '0.0.0': [
          '連接器將託管應用與本機 MCP 伺服器整合至同一頁面，支援工具權限、篩選和連線復原。',
          '引導設定改善本機模型選擇、瀏覽器登入和免費存取；設定未完成時提供更清楚的復原指引。',
          '改善對話復原、分支、設定檔切換、排隊執行及澄清卡片，減少工作階段狀態遺失。',
          '捲動後輸入框會自動恢復顯示；專案支援加入多個資料夾，並可復原側欄隱藏。',
          '語音設定支援即時對話；本機瀏覽器可使用既有登入設定的託管副本。',
          '插件啟用與探索更一致。Spotify、Home Assistant 及部分記憶提供商遷移至目錄中的獨立插件。',
          '安裝與更新改善內建執行環境支援、中斷更新復原及遠端 SSH 相容性。',
          '修正 Codex 工具呼叫的串流關聯及桌面後端啟動就緒偵測，提高執行穩定性。'
        ],
        '0.21.3': [
          '遠端閘道連線更加可靠，重新導向、驗證請求標頭和媒體串流都能正確處理。',
          '子代理程式狀態與控制更加完整，可查看進度、追蹤輸出，並在執行中引導或中斷工作。',
          'MCP 與技能流程更加穩健，改善了延遲載入狀態、並行安裝保護和安全驗證。',
          '憑證與設定體驗升級，包括憑證保險庫、1Password 支援，以及更嚴格的設定檔隔離。'
        ],
        '0.21.0': [
          '提升長對話壓縮與圖片 Token 計算的準確性',
          '修正嚴格模型服務下工具結果訊息的相容性',
          '增強 API 呼叫日誌，補充快取寫入、回應 ID 與上游資訊',
          '改善外掛記憶鉤子和外部預取的穩定性',
          '修正桌面版工作階段側邊欄與篩選顯示問題'
        ]
      },
      onLatest: '你已是最新版本。',
      installing: '正在安裝更新。',
      cantUpdate: '此版本無法從應用程式內自行更新。',
      cantReach: '無法連線到更新伺服器。',
      tapCheck: '點選「立即檢查」以尋找更新。',
      updateReady: count => `新更新已就緒（包含 ${count} 項變更）。`,
      updateReadyUnknown: '新更新已就緒。',
      lastChecked: age => `上次檢查：${age}`,
      justNowSuffix: ' · 剛剛',
      automaticUpdates: '自動更新',
      automaticUpdatesDesc: 'Mira Agent 會在背景自動檢查更新，並在有可用更新時通知你。',
      branchCommit: (branch, commit) => `分支 ${branch} · 提交 ${commit}`,
      never: '從未',
      justNow: '剛剛',
      minAgo: count => `${count} 分鐘前`,
      hoursAgo: count => `${count} 小時前`,
      daysAgo: count => `${count} 天前`
    }
  },
  skills: zhHantCapabilities.skills,
  starmap: zhHantCapabilities.starmap,
  agents: zhHantCapabilities.agents,
  commandCenter: zhHantCommandCenter.commandCenter,
  messaging: zhHantCommandCenter.messaging,
  profiles: zhHantCommandCenter.profiles,
  modelAssignment: {
    saveFailed: 'Mira 未儲存該模型變更。',
    confirmTitle: '模型選擇警告',
    confirmDetail: '僅在你接受此權衡時確認。',
    confirmAction: '確認',
    declined: '已取消模型變更 — 你拒絕了資料訓練層級警告。'
  },
  cron: zhHantCommandCenter.cron,
  artifacts: zhHantArtifacts.artifacts,
  artifactCard: zhHantArtifacts.artifactCard,
  artifactPreview: zhHantArtifacts.artifactPreview,
  sidebar: zhHantChrome.sidebar,
  composer: zhHantChat.composer,
  statusStack: zhHantChat.statusStack,
  updates: zhHantBoot.updates,
  install: zhHantBoot.install,
  onboarding: zhHantBoot.onboarding,
  modelPicker: zhHantSettings.modelPicker,
  modelVisibility: zhHantSettings.modelVisibility,
  shell: zhHantChrome.shell,
  rightSidebar: zhHantChrome.rightSidebar,
  preview: zhHantArtifacts.preview,
  interfaceMode: {
    title: '介面模式',
    hint: '只改變顯示的內容，不改變 Mira 的能力。',
    sessionNote: '由簡潔模式設定。此處的變更僅在本次工作階段內生效；切換到進階模式即可保留為你的設定。',
    simple: {
      label: '簡潔',
      description: '用於與 Mira 對話。只有側邊欄和聊天；沒有終端機、檔案或差異面板。'
    },
    advanced: {
      label: '進階',
      description: '面向開發者。終端機、檔案、差異、狀態列和版面配置，按你的設定顯示。'
    }
  },
  zones: zhHantChrome.zones,
  contextMenu: zhHantChrome.contextMenu,
  assistant: zhHantAssistant.assistant,
  prompts: zhHantChat.prompts,
  desktop: zhHantChat.desktop,
  errors: zhHantDiagnostics.errors,
  tips: zhHantChat.tips,
  ui: zhHantCommon.ui,
  handoffTour: {
    profileTitle: '你的第一個任務在預設設定檔中執行',

    profileText:
      '這條欄用來切換設定檔。現在亮著的是 default，任務工作階段就在這裡。另一個是設定用的設定檔，歡迎聊天在那裡。',

    sessionsTitle: '每個設定檔都有自己的工作階段',

    sessionsText:
      '這個清單屬於 default 設定檔。「新工作階段」會在目前選取的設定檔中開始。在欄上切換設定檔，清單也會跟著改變。',

    stayTitle: 'Mira 一鍵可及',

    stayText: '需要幫忙時，切換到設定用的設定檔並開啟「歡迎使用 Mira」。它會一直在那裡。',
    localTitle: '這台電腦可以在本機執行模型',
    localText: (model: string) =>
      `${model} 適合你的硬體。免費執行，對話不會離開你的電腦。隨時在這裡的模型選單中選擇它。`
  },
  freeTier: {
    offer: {
      heading: '繼續使用 Mira',
      body: '你正在使用免費額度。繼續使用 Mira 的話，你會開始遇到限制。登入免費的 Nous 帳戶，即可獲得更多額度。',
      signIn: '登入',
      notNow: '暫不'
    }
  }
} satisfies TranslationOverrides

export const zhHant = defineLocale(zhHantOverrides)
