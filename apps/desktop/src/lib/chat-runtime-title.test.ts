import { afterEach, describe, expect, it } from 'vitest'

import { setRuntimeI18nLocale } from '@/i18n/runtime'

import { localizeLegacySessionTitle } from './chat-runtime'

describe('localizeLegacySessionTitle', () => {
  afterEach(() => setRuntimeI18nLocale('en'))

  it('localizes old friendly-greeting titles and preserves their dedupe suffix', () => {
    setRuntimeI18nLocale('zh')

    expect(localizeLegacySessionTitle('Friendly greeting')).toBe('友好问候')
    expect(localizeLegacySessionTitle('Friendly greeting #2')).toBe('友好问候 #2')
  })

  it('does not rewrite semantic or user-authored English titles', () => {
    setRuntimeI18nLocale('zh')

    expect(localizeLegacySessionTitle('Friendly greeting workflow')).toBe('Friendly greeting workflow')
    expect(localizeLegacySessionTitle('Fix login button')).toBe('Fix login button')
  })
})
