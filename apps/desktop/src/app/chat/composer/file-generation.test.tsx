import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useFileGeneration } from './file-generation'
import { taggedFilePrompt } from './file-generation-tag'

vi.mock('@/i18n', () => ({ useI18n: () => ({ t: { composer: { generateFile: '生成文件' } } }) }))
vi.mock('@/store/notifications', () => ({ notify: vi.fn() }))

const drafts = vi.hoisted(() => ({
  stashSessionDraft: vi.fn(),
  takeSessionDraft: vi.fn(() => ({ text: '原草稿', attachments: [] }))
}))

vi.mock('@/store/composer', () => drafts)
vi.mock('./composer-utils', () => ({ liveComposerDraft: (_editor: unknown, text: string) => text }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('host file generation', () => {
  it('inserts a confirmed prompt and leaves the draft alone on cancellation', async () => {
    const open = vi.fn().mockResolvedValueOnce('研究提示词').mockResolvedValueOnce(null)
    vi.stubGlobal('hermesDesktop', { fileGeneration: { open } })
    const insertText = vi.fn()

    const { result } = renderHook(() =>
      useFileGeneration({
        draftRef: { current: '资料' },
        editorRef: { current: null },
        insertText,
        scopeRef: { current: 'session-a' }
      })
    )

    await act(async () => {
      await result.current?.()
    })
    expect(open).toHaveBeenCalledWith({ initialMarkdown: '资料' })
    expect(insertText).toHaveBeenCalledWith(taggedFilePrompt('研究提示词'))
    await act(async () => {
      await result.current?.()
    })
    expect(insertText).toHaveBeenCalledTimes(1)
  })

  it('saves the result to its original session when the user switches conversations', async () => {
    const open = vi.fn()

    let confirm: (text: string) => void = () => {}
    open.mockReturnValue(
      new Promise<string>(resolve => {
        confirm = resolve
      })
    )
    vi.stubGlobal('hermesDesktop', { fileGeneration: { open } })
    const insertText = vi.fn()
    const scopeRef = { current: 'session-a' }

    const { result } = renderHook(() =>
      useFileGeneration({
        draftRef: { current: '资料' },
        editorRef: { current: null },
        insertText,
        scopeRef
      })
    )

    const pending = result.current?.()
    scopeRef.current = 'session-b'
    await act(async () => {
      confirm('研究提示词')
      await pending
    })
    expect(insertText).not.toHaveBeenCalled()
    expect(drafts.stashSessionDraft).toHaveBeenCalledWith(
      'session-a',
      `原草稿\n\n${taggedFilePrompt('研究提示词')}`,
      []
    )
  })
})
