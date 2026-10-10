import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { taggedFilePrompt } from '../file-generation-tag'

import { useMiddlewareSubmit } from './use-middleware-submit'

vi.mock('../contrib', () => ({ runComposerMiddleware: async (draft: unknown) => draft }))

describe('composer submission with a file generation tag', () => {
  it('passes the complete prompt to the backend without the draft tag', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    const { result } = renderHook(() => useMiddlewareSubmit(onSubmit))

    await result.current.onSubmit(taggedFilePrompt('制作演示文稿\n包含预算表'))

    expect(onSubmit).toHaveBeenCalledWith('制作演示文稿\n包含预算表', { attachments: undefined })
  })
})
