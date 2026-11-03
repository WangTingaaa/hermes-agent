import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { useDesktopStream } from './use-desktop-stream'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function fixture() {
  const stop = vi.fn()
  const track = Object.assign(new EventTarget(), { stop })
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream
  const getDisplayMedia = vi.fn(async () => stream)
  vi.stubGlobal('navigator', { mediaDevices: { getDisplayMedia } })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const hook = renderHook(useDesktopStream)
  hook.result.current.video.current = document.createElement('video')

  return { ...hook, stop, stream, getDisplayMedia }
}

it('plays locally and stops all tracks when the view unmounts', async () => {
  const hook = fixture()
  await act(() => hook.result.current.start(''))
  expect(hook.result.current.active).toBe(true)
  expect(hook.result.current.video.current?.srcObject).toBe(hook.stream)
  expect(hook.getDisplayMedia).toHaveBeenCalledWith({ video: { frameRate: 15 }, audio: false })
  hook.unmount()
  expect(hook.stop).toHaveBeenCalledOnce()
})

it('disposes a capture that arrives after the user stops or switches sessions', async () => {
  const hook = fixture()

  let resolve: (stream: MediaStream) => void = () => {}
  hook.getDisplayMedia.mockImplementationOnce(
    () =>
      new Promise(done => {
        resolve = done
      })
  )
  let pending: Promise<void>
  act(() => {
    pending = hook.result.current.start('')
  })
  act(() => hook.result.current.stop())
  await act(async () => {
    resolve(hook.stream)
    await pending
  })
  expect(hook.stop).toHaveBeenCalledOnce()
  expect(hook.result.current.active).toBe(false)
  expect(hook.result.current.video.current?.srcObject).toBeNull()
})
