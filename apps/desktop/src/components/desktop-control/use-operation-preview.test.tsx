import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { useOperationPreview } from './use-operation-preview'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it.each([
  ['No handler registered for hermes:desktop-preview:snapshot', 'unavailable'],
  ['SCREEN_CAPTURE_PERMISSION: denied', 'permission'],
  ['Failed to get sources', 'capture-failed']
])('distinguishes preview failures: %s', async (message, expected) => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.stubGlobal('hermesDesktop', { desktopPreview: { snapshot: vi.fn().mockRejectedValue(new Error(message)) } })
  const hook = renderHook(() => useOperationPreview({ app: 'Notes', windowTitle: '' }, true))
  try {
    await waitFor(() => expect(hook.result.current.error).toBe(expected))
  } finally {
    hook.unmount()
    warning.mockRestore()
  }
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

it('captures the final task frame once and stops polling after completion', async () => {
  vi.useFakeTimers()
  const snapshot = vi.fn().mockResolvedValue({ image: 'final', name: 'Notes', sourceId: '1' })
  vi.stubGlobal('hermesDesktop', { desktopPreview: { snapshot } })

  const hook = renderHook(({ busy }) => useOperationPreview({ app: 'Notes', windowTitle: '' }, true, busy), {
    initialProps: { busy: true }
  })

  await act(async () => {})
  hook.rerender({ busy: false })
  await act(async () => {})
  const calls = snapshot.mock.calls.length
  await act(() => vi.advanceTimersByTimeAsync(2000))
  expect(snapshot).toHaveBeenCalledTimes(calls)
  expect(hook.result.current.frame?.image).toBe('final')
  hook.unmount()
})
