import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { useOperationPreview } from './use-operation-preview'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('discards delayed frames when the conversation operation target changes', async () => {
  let resolve!: (value: unknown) => void

  const snapshot = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        })
    )
    .mockResolvedValue({ image: 'new', name: 'Safari', sourceId: '2' })

  vi.stubGlobal('hermesDesktop', { desktopPreview: { snapshot } })

  const hook = renderHook(({ app }) => useOperationPreview({ app, windowTitle: '' }, true), {
    initialProps: { app: 'Notes' }
  })

  hook.rerender({ app: 'Safari' })
  await waitFor(() => expect(hook.result.current.frame?.image).toBe('new'))
  await act(async () => {
    resolve({ image: 'old', name: 'Notes', sourceId: '1' })
  })
  expect(hook.result.current.frame?.name).toBe('Safari')
  hook.unmount()
})

it('never captures the local desktop for a remote connection', () => {
  const snapshot = vi.fn()
  vi.stubGlobal('hermesDesktop', { desktopPreview: { snapshot } })
  const hook = renderHook(() => useOperationPreview({ app: 'Notes', windowTitle: '' }, false))
  expect(snapshot).not.toHaveBeenCalled()
  expect(hook.result.current.frame).toBeNull()
})

it('keeps synchronizing the selected window and reconnects when its capture becomes available', async () => {
  vi.useFakeTimers()

  const snapshot = vi
    .fn()
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ image: 'first', name: 'Chrome', sourceId: '1' })
    .mockResolvedValue({ image: 'updated', name: 'Chrome', sourceId: '1' })

  vi.stubGlobal('hermesDesktop', { desktopPreview: { snapshot } })
  const hook = renderHook(() => useOperationPreview({ app: 'Google Chrome', windowTitle: '' }, true))
  await act(async () => {})
  expect(hook.result.current.frame).toBeNull()
  expect(hook.result.current.error).toBe('window-unavailable')
  await act(() => vi.advanceTimersByTimeAsync(500))
  expect(hook.result.current.frame?.image).toBe('first')
  expect(hook.result.current.error).toBe('')
  await act(() => vi.advanceTimersByTimeAsync(500))
  expect(hook.result.current.frame?.image).toBe('updated')
  hook.unmount()
})
