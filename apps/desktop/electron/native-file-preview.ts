import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { GatewayFileSavePayload, NativeFileActions } from './type'

export function registerNativeFileActions({ app, getWindow, ipcMain, saveFile, shell }: NativeFileActions) {
  const previews = new Set<string>()
  ipcMain.handle('hermes:saveGatewayFile', (_event, payload) => saveFile(payload))
  ipcMain.handle('hermes:previewGatewayFile', async (_event, payload: GatewayFileSavePayload) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mira-file-preview-'))
    previews.add(directory)
    try {
      const destination = path.join(directory, path.basename(String(payload.path || 'preview')))
      const result = await saveFile(payload, destination)
      if (!result.saved) throw new Error('File preview download failed')
      const window = getWindow()
      if (!window || window.isDestroyed()) throw new Error('Preview window is unavailable')
      if (process.platform === 'darwin') window.previewFile(destination)
      else {
        const error = await shell.openPath(destination)
        if (error) throw new Error(error)
      }
      return { opened: true }
    } catch (error) {
      previews.delete(directory)
      await fs.rm(directory, { recursive: true, force: true })
      throw error
    }
  })
  app.once('before-quit', () => {
    for (const directory of previews) void fs.rm(directory, { recursive: true, force: true })
  })
}
