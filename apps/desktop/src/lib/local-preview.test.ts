import { afterEach, describe, expect, it, vi } from 'vitest'

import { normalizeOrLocalPreviewTarget } from './local-preview'

describe('normalizeOrLocalPreviewTarget', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to a renderer target when an embedded host returns a partial target', async () => {
    Object.defineProperty(window, 'hermesDesktop', {
      configurable: true,
      value: {
        normalizePreviewTarget: vi.fn(async () => ({ kind: 'file', path: '/Downloads/report.pdf' }))
      }
    })

    await expect(normalizeOrLocalPreviewTarget('/Downloads/report.pdf')).resolves.toMatchObject({
      kind: 'file',
      label: 'report.pdf',
      path: '/Downloads/report.pdf',
      previewKind: 'text',
      source: '/Downloads/report.pdf',
      url: 'file:///Downloads/report.pdf'
    })
  })

  it('keeps a complete target returned by the desktop bridge', async () => {
    const target = {
      kind: 'file' as const,
      label: 'report.pdf',
      path: '/resolved/report.pdf',
      previewKind: 'binary' as const,
      source: '/Downloads/report.pdf',
      url: 'file:///resolved/report.pdf'
    }

    Object.defineProperty(window, 'hermesDesktop', {
      configurable: true,
      value: { normalizePreviewTarget: vi.fn(async () => target) }
    })

    await expect(normalizeOrLocalPreviewTarget('/Downloads/report.pdf')).resolves.toBe(target)
  })
})
