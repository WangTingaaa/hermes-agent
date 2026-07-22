import { describe, expect, it } from 'vitest'

import {
  localizeSkillDescription,
  localizeSkillDetail,
  localizeSkillName,
  skillSearchTexts,
  toolsetSearchTexts
} from './skill-localization'

const bundled = {
  category: 'productivity',
  description: 'Create, read, and edit Word .docx documents and templates.',
  detail: '## Overview\n\nCreate and edit `.docx` files.\n\n## When to Use\n\nUse it for document work.',
  enabled: true,
  name: 'docx',
  provenance: 'bundled' as const
}

describe('skill localization', () => {
  it('uses bundled Chinese copy while English keeps SKILL.md frontmatter copy', () => {
    expect(localizeSkillName(bundled, 'zh')).toBe('Word 文档')
    expect(localizeSkillDescription(bundled, 'zh')).toContain('创建、编辑')
    expect(localizeSkillName(bundled, 'en')).toBe('docx')
    expect(localizeSkillDescription(bundled, 'en')).toBe(bundled.description)
    expect(localizeSkillDetail(bundled, 'zh')).toBe(localizeSkillDescription(bundled, 'zh'))
    expect(localizeSkillDetail(bundled, 'en')).toBe(bundled.detail)
  })

  it('does not translate third-party skill content', () => {
    const thirdParty = { ...bundled, name: 'vendor-docx', provenance: 'hub' as const }
    expect(localizeSkillName(thirdParty, 'zh')).toBe('vendor-docx')
    expect(localizeSkillDescription(thirdParty, 'zh')).toBe(thirdParty.description)
    expect(localizeSkillDetail(thirdParty, 'zh')).toBe(thirdParty.description)
  })

  it('uses SKILL.md detail for official optional skills such as adversarial UX testing', () => {
    const optional = {
      ...bundled,
      name: 'adversarial-ux-test',
      official: true,
      provenance: 'hub' as const
    }
    expect(localizeSkillDetail(optional, 'zh')).toContain('最挑剔')
  })

  it('exposes both English and Chinese text to search regardless of UI locale', () => {
    expect(skillSearchTexts(bundled)).toContain('docx')
    expect(skillSearchTexts(bundled)).toContain('Word 文档')
    expect(toolsetSearchTexts('web', 'Web', 'Browse the web.')).toEqual(expect.arrayContaining(['web', 'Web', '网页访问']))
  })
})
