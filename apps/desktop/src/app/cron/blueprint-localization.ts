import type { AutomationBlueprint, AutomationBlueprintField } from '@/hermes'
import type { Locale } from '@/i18n'

interface BlueprintCopy {
  description: string
  title: string
}

const ZH_BLUEPRINTS: Record<string, BlueprintCopy> = {
  'morning-brief': { title: '晨间简报', description: '每日简报：今日行程、天气，以及需要你及时处理的事项。' },
  'important-mail': { title: '重要邮件监控', description: '定期检查收件箱，仅在邮件确实需要关注时提醒你。' },
  'weekly-review': { title: '每周回顾', description: '每周总结已完成、仍待处理以及即将开始的事项。' },
  'workday-start': { title: '工作日开始提醒', description: '在工作日开始时发送日程和首要任务提醒。' },
  'custom-reminder': { title: '自定义提醒', description: '按你的时间安排，重复发送自定义内容。' },
  'evening-winddown': { title: '晚间收尾', description: '在一天结束时回顾明日日程，并帮助你轻松收尾。' },
  'news-digest': { title: '主题新闻摘要', description: '定期汇总你关注主题的新闻，并自动去重。' },
  'bill-renewal-watch': { title: '账单与续费提醒', description: '在周期性付款、订阅续费或账单到期前提醒你。' },
  'price-watch': { title: '价格与库存监控', description: '监控指定商品、航班、酒店或房源的价格与可用情况。' },
  'competitor-watch': { title: '竞品动态监控', description: '追踪指定公司的重要动态，例如新品发布、融资和重大公告。' },
  'habit-checkin': { title: '习惯打卡', description: '定期提醒你坚持习惯，并简短回顾进展。' },
  'hydration-move': { title: '饮水与活动提醒', description: '在白天定期提醒你喝水、起身和活动。' },
  'meal-plan': { title: '每周膳食计划', description: '每周生成膳食计划和汇总后的购物清单。' },
  'learn-daily': { title: '每日学习', description: '每天推送一个关于指定主题的精简知识点。' },
  'gratitude-journal': { title: '感恩与反思', description: '在晚间温和地引导你回顾一天并记录值得感恩的事。' },
  'on-this-day': { title: '历史上的今天', description: '每天分享一个值得了解的历史事件、人物或发现。' }
}

const ZH_FIELDS: Record<string, Pick<AutomationBlueprintField, 'help' | 'label'>> = {
  time: { label: '什么时间？', help: '本地时间（24 小时制），例如 08:00' },
  deliver: { label: '投递到哪里？', help: '' },
  interval_min: { label: '多久检查一次？', help: '两次检查之间的分钟数' },
  criteria: { label: '仅在邮件符合以下条件时通知我…', help: '' },
  day: { label: '星期几？', help: '' },
  what: { label: '提醒内容', help: '' },
  recurrence: { label: '重复日期', help: '' },
  topic: { label: '主题', help: '' },
  count: { label: '摘要条数', help: '' },
  habit: { label: '习惯', help: '' },
  item: { label: '具体监控对象', help: '' },
  condition: { label: '在以下情况提醒我…', help: '' },
  interval_h: { label: '多久检查一次？', help: '' },
  interval_hours: { label: '多久提醒一次？', help: '' },
  companies: { label: '公司或竞品', help: '' },
  categories: { label: '关注哪些动态？', help: '' },
  start_hour: { label: '开始时间', help: '' },
  end_hour: { label: '结束时间', help: '' },
  diet: { label: '饮食偏好', help: '' },
  meals: { label: '每天几餐？', help: '' },
  effort: { label: '烹饪难度', help: '' },
  flavor: { label: '内容类型', help: '' }
}

/** Localize server-owned blueprint display metadata without changing the stable
 * key, command template, or values sent back to the backend. Unknown catalog
 * additions deliberately retain the server's English copy. */
export function localizeAutomationBlueprint(blueprint: AutomationBlueprint, locale: Locale): AutomationBlueprint {
  if (locale !== 'zh') {
    return blueprint
  }

  const copy = ZH_BLUEPRINTS[blueprint.key]

  return {
    ...blueprint,
    ...(copy ?? {}),
    fields: blueprint.fields.map(field => ({ ...field, ...(ZH_FIELDS[field.name] ?? {}) }))
  }
}
