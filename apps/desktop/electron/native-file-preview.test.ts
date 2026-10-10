import fs from 'node:fs/promises'
import { EventEmitter } from 'node:events'

import { expect, test, vi } from 'vitest'

import { registerNativeFileActions } from './native-file-preview'
import type { NativeFileActions } from './type'

test('native preview downloads the owning file to a private temporary path before opening it', async () => {
  const handlers = new Map<string, Function>()
  const opened = vi.fn()
  let destination = ''
  const save = vi.fn(async (payload, target) => {
    expect(payload).toEqual({ path: '/gateway/slide.pptx', connectionId: 'writer', profile: 'author' })
    destination = target
    await fs.writeFile(target, 'pptx-bytes')
    return { saved: true, path: target }
  })
  const app = new EventEmitter()
  registerNativeFileActions({
    app,
    ipcMain: { handle: (name, fn) => handlers.set(name, fn) },
    saveFile: save,
    getWindow: () => ({ isDestroyed: () => false, previewFile: opened }),
    shell: {
      openPath: async (target: string) => {
        opened(target)
        return ''
      }
    }
  } as unknown as NativeFileActions)
  const result = await handlers.get('hermes:previewGatewayFile')?.(
    {},
    { path: '/gateway/slide.pptx', connectionId: 'writer', profile: 'author' }
  )
  expect(result).toEqual({ opened: true })
  expect(opened).toHaveBeenCalledWith(destination)
  expect(await fs.readFile(destination, 'utf8')).toBe('pptx-bytes')
  await fs.rm(destination.slice(0, destination.lastIndexOf('/')), { recursive: true, force: true })
})
