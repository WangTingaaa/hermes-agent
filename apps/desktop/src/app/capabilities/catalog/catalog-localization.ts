import type { Locale } from '@/i18n'
import { localizeSkillDescription, localizeSkillName } from '@/lib/skill-localization'

import type { CatalogEntry, CatalogKind } from './catalog-data'

/** Public rows and installed rows share presentation, but keep their install identities. */
export function catalogSkillCopy(entry: CatalogEntry, kind: CatalogKind, locale: Locale) {
  const skill = {
    name: entry.name,
    description: entry.description,
    category: entry.category,
    enabled: true,
    official: kind === 'skills' && ['built-in', 'optional', 'official'].includes(entry.source)
  }

  return {
    name: localizeSkillName(skill, locale),
    description: localizeSkillDescription(skill, locale)
  }
}

export function catalogSkillSearchEntry(entry: CatalogEntry, kind: CatalogKind): CatalogEntry {
  const copy = catalogSkillCopy(entry, kind, 'zh')

  if (copy.name === entry.name && copy.description === entry.description) {return entry}

  return { ...entry, search: `${entry.search} ${copy.name} ${copy.description}`.toLowerCase() }
}
