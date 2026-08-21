import { describe, expect, it } from 'vitest'

import type { AutomationBlueprint } from '@/hermes'

import { localizeAutomationBlueprint } from './blueprint-localization'

const blueprint: AutomationBlueprint = {
  appUrl: '',
  category: 'daily',
  command: '',
  description: 'A short daily briefing.',
  fields: [
    {
      default: '08:00',
      help: '24h local time',
      label: 'What time?',
      name: 'time',
      optional: false,
      options: [],
      type: 'time'
    }
  ],
  key: 'morning-brief',
  tags: [],
  title: 'Morning briefing'
}

describe('localizeAutomationBlueprint', () => {
  it('localizes server display metadata for Chinese without changing stable values', () => {
    const localized = localizeAutomationBlueprint(blueprint, 'zh')

    expect(localized.title).toBe('晨间简报')
    expect(localized.description).toContain('今日行程')
    expect(localized.fields[0]).toMatchObject({ default: '08:00', label: '什么时间？', name: 'time' })
    expect(blueprint.title).toBe('Morning briefing')
  })

  it('keeps backend copy for English and unknown catalog entries', () => {
    expect(localizeAutomationBlueprint(blueprint, 'en')).toBe(blueprint)
    expect(localizeAutomationBlueprint({ ...blueprint, key: 'future-blueprint' }, 'zh').title).toBe('Morning briefing')
  })
})
