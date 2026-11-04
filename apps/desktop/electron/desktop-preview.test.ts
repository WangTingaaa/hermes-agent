import type { Session } from 'electron'
import { beforeEach, expect, it, vi } from 'vitest'

const fake = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => unknown>(),
  sources: vi.fn(),
  fromFrame: vi.fn()
}))

vi.mock('electron', () => ({
  desktopCapturer: { getSources: fake.sources },
  ipcMain: {
    removeHandler: vi.fn(),
    handle: (name: string, fn: (...args: unknown[]) => unknown) => fake.handlers.set(name, fn)
  },
  webContents: { fromFrame: fake.fromFrame },
  systemPreferences: { getMediaAccessStatus: () => 'granted' }
}))
vi.mock('./window-below', () => ({
  enumerateWindowsFrontToBack: async () => [
    { id: 42, app: '备忘录', appId: 'com.apple.Notes', appPath: '/System/Applications/Notes.app', title: 'New note' }
  ],
  enumerationFailed: () => false
}))
import { installDesktopPreview } from './desktop-preview'

beforeEach(() => {
  fake.handlers.clear()
  vi.resetAllMocks()
})

it('requires a trusted top frame, a selected source and a fresh one-use user gesture', async () => {
  const frame = {}
  const sender = { id: 1, mainFrame: frame }
  const handler = vi.fn()
  fake.sources.mockResolvedValue([{ id: 'window:42:0', name: 'App' }])
  fake.fromFrame.mockReturnValue(sender)

  const allowed = installDesktopPreview(
    { setDisplayMediaRequestHandler: handler } as unknown as Session,
    contents => contents === sender
  )

  const list = fake.handlers.get('hermes:desktop-preview:sources')!
  const select = fake.handlers.get('hermes:desktop-preview:select')!
  await expect(list({ sender, senderFrame: {} })).rejects.toThrow('Untrusted')
  await list({ sender, senderFrame: frame })
  expect(() => select({ sender, senderFrame: frame }, 'window:999:0')).toThrow()
  select({ sender, senderFrame: frame }, 'window:42:0')
  expect(allowed(sender as never)).toBe(true)
  const deliver = handler.mock.calls[0][0]
  const callback = vi.fn()
  await deliver({ frame, userGesture: true }, callback)
  expect(callback).toHaveBeenLastCalledWith({ video: { id: 'window:42:0', name: 'App' } })
  expect(allowed(sender as never)).toBe(false)
  await deliver({ frame, userGesture: true }, callback)
  expect(callback).toHaveBeenLastCalledWith({})
})

it('refuses a disappeared window instead of switching to a different screen', async () => {
  const frame = {}
  const sender = { id: 1, mainFrame: frame }
  const handler = vi.fn()
  fake.fromFrame.mockReturnValue(sender)
  fake.sources
    .mockResolvedValueOnce([{ id: 'window:42:0', name: 'App' }])
    .mockResolvedValueOnce([{ id: 'screen:0:0', name: 'Screen' }])
  installDesktopPreview(
    { setDisplayMediaRequestHandler: handler } as unknown as Session,
    contents => contents === sender
  )
  await fake.handlers.get('hermes:desktop-preview:sources')!({ sender, senderFrame: frame })
  fake.handlers.get('hermes:desktop-preview:select')!({ sender, senderFrame: frame }, 'window:42:0')
  const callback = vi.fn()
  await handler.mock.calls[0][0]({ frame, userGesture: true }, callback)
  expect(callback).toHaveBeenCalledWith({})
})

it('automatically captures the operation app and never falls back to another screen', async () => {
  const sender = { id: 1, mainFrame: {} }
  const image = { isEmpty: () => false, toDataURL: () => 'data:image/png;base64,frame' }
  fake.sources.mockResolvedValue([{ id: 'window:42:0', name: 'New note', thumbnail: image }])
  installDesktopPreview(
    { setDisplayMediaRequestHandler: vi.fn() } as unknown as Session,
    contents => contents === sender
  )
  const snapshot = fake.handlers.get('hermes:desktop-preview:snapshot')!
  const event = { sender, senderFrame: sender.mainFrame }
  await expect(snapshot(event, { app: 'Notes', windowTitle: '' })).resolves.toMatchObject({
    name: 'New note',
    image: 'data:image/png;base64,frame'
  })
  await expect(snapshot(event, { app: 'Safari', windowTitle: '' })).resolves.toBeNull()
  await expect(snapshot({ sender, senderFrame: {} }, { app: 'Notes', windowTitle: '' })).rejects.toThrow('Untrusted')
})
