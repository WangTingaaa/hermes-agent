import { expect, it } from 'vitest'

import { parseCatalog } from './catalog-data'
import { catalogSkillCopy, catalogSkillSearchEntry } from './catalog-localization'

it('localizes first-party skills while preserving third-party and plugin copy with the same name', () => {
  const original = { name: 'docx', description: 'Author-provided description' }

  const [bundled, community] = parseCatalog('skills', [
    { ...original, source: 'built-in' },
    { ...original, source: 'community' }
  ])

  expect(catalogSkillCopy(bundled, 'skills', 'zh').name).toBe('Word 文档')
  expect(catalogSkillCopy(bundled, 'skills', 'en')).toEqual(original)
  expect(catalogSkillCopy(community, 'skills', 'zh')).toEqual(original)
  expect(catalogSkillCopy(bundled, 'plugins', 'zh')).toEqual(original)
  expect(catalogSkillSearchEntry(bundled, 'skills').search).toContain('word 文档')
  expect(catalogSkillSearchEntry(community, 'skills')).toBe(community)
  expect(bundled.name).toBe('docx')
})
