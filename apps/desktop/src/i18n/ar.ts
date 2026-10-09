import { arArtifacts } from './ar_artifacts'
import { arAssistant } from './ar_assistant'
import { arBoot } from './ar_boot'
import { arCapabilities } from './ar_capabilities'
import { arChat } from './ar_chat'
import { arChrome } from './ar_chrome'
import { arCommandCenter } from './ar_command_center'
import { arCommon } from './ar_common'
import { arConnectors } from './ar_connectors'
import { arDiagnostics } from './ar_diagnostics'
import { arSettings } from './ar_settings'
import { defineLocale, type TranslationOverrides } from './define-locale'

export const arOverrides = {
  sharedMetrics: arCommon.sharedMetrics,
  externalOpenFailed: arChrome.externalOpenFailed,
  sessionImport: arConnectors.sessionImport,
  sendDiagnostics: arDiagnostics.sendDiagnostics,
  common: arCommon.common,
  fileMenu: arChrome.fileMenu,
  boot: arBoot.boot,
  notifications: arDiagnostics.notifications,
  remoteDisplayBanner: arBoot.remoteDisplayBanner,
  butterbar: arBoot.butterbar,
  titlebar: arChrome.titlebar,
  keybinds: arChrome.keybinds,
  language: arSettings.language,
  settings: {
    ...arSettings.settings,
    about: {
      heading: 'حول Mira',
      version: value => `الإصدار ${value}`,
      versionUnavailable: 'الإصدار غير متاح',
      updates: 'التحديثات',
      checkNow: 'التحقق الآن',
      checking: 'جار التحقق...',
      seeWhatsNew: 'عرض الجديد',
      updateNow: 'تحديث الآن',
      releaseNotes: 'ملاحظات الإصدار',
      onLatest: 'أنت على أحدث إصدار',
      installing: 'جار التثبيت...',
      cantUpdate: 'تعذر التحديث',
      cantReach: 'تعذر الوصول لخدمة التحديث',
      tapCheck: 'اضغط للتحقق من التحديثات.',
      updateReady: count => `${count} تحديث متاح`,
      updateReadyUnknown: 'تحديث جديد جاهز.',
      lastChecked: age => `آخر تحقق ${age}`,
      justNowSuffix: 'الآن',
      automaticUpdates: 'التحديثات التلقائية',
      automaticUpdatesDesc: 'اسمح لـ Mira بالتحقق من التحديثات وتثبيتها.',
      branchCommit: (branch, commit) => `${branch} عند ${commit}`,
      never: 'أبدا',
      justNow: 'الآن',
      minAgo: count => `قبل ${count} دقيقة`,
      hoursAgo: count => `قبل ${count} ساعة`,
      daysAgo: count => `قبل ${count} يوم`
    }
  },
  skills: arCapabilities.skills,
  agents: arCapabilities.agents,
  commandCenter: arCommandCenter.commandCenter,
  messaging: arCommandCenter.messaging,
  profiles: arCommandCenter.profiles,
  modelAssignment: arSettings.modelAssignment,
  cron: arCommandCenter.cron,
  artifacts: arArtifacts.artifacts,
  artifactCard: arArtifacts.artifactCard,
  artifactPreview: arArtifacts.artifactPreview,
  sidebar: arChrome.sidebar,
  composer: arChat.composer,
  statusStack: arChat.statusStack,
  updates: arBoot.updates,
  install: arBoot.install,
  onboarding: arBoot.onboarding,
  modelPicker: arSettings.modelPicker,
  modelVisibility: arSettings.modelVisibility,
  shell: arChrome.shell,
  rightSidebar: arChrome.rightSidebar,
  preview: arArtifacts.preview,
  interfaceMode: arSettings.interfaceMode,
  zones: arChrome.zones,
  contextMenu: arChrome.contextMenu,
  assistant: arAssistant.assistant,
  prompts: arChat.prompts,
  desktop: arChat.desktop,
  errors: arDiagnostics.errors,
  tips: arChat.tips,
  ui: arCommon.ui,
  handoffTour: {
    profileTitle: 'مهمتك الأولى تعمل على الملف الشخصي الافتراضي',
    profileText:
      'يبدّل هذا الشريط بين الملفات الشخصية. المضاء الآن هو الافتراضي، حيث توجد جلسة المهمة. والآخر هو ملف الإعداد، حيث توجد محادثة الترحيب.',
    sessionsTitle: 'لكل ملف شخصي جلساته الخاصة',
    sessionsText:
      'هذه القائمة تخص الملف الافتراضي. «جلسة جديدة» تبدأ جلسة على الملف المحدد. بدّل الملف من الشريط فتتغير القائمة معه.',
    stayTitle: 'Mira على بُعد نقرة',
    stayText: 'انتقل إلى ملف الإعداد وافتح «مرحبًا بك في Mira» متى احتجت إلى مساعدة. ستبقى هناك.',
    localTitle: 'يمكن لهذا الجهاز تشغيل النماذج محليًا',
    localText: (model: string) =>
      `${model} يناسب أجهزتك. يعمل مجانًا، ولا تغادر المحادثات جهازك. اختره من هنا، من قائمة النماذج، متى شئت.`
  },
  freeTier: {
    offer: {
      heading: 'واصل مع Mira',
      body: 'أنت تستخدم الحصة المجانية. إذا واصلت استخدام Mira فستبدأ بمواجهة حدود الاستخدام. سجّل الدخول بحساب Nous مجاني للحصول على حصة أكبر.',
      signIn: 'تسجيل الدخول',
      notNow: 'ليس الآن'
    }
  }
} satisfies TranslationOverrides

export const ar = defineLocale(arOverrides)
