import type { App, BrowserWindow, IpcMain, Shell } from 'electron'
import type { GatewayFileSaveResult } from './gateway-file-download'

export interface GatewayFileSavePayload {
  sessionId?: string
  connectionId?: unknown
  path?: unknown
  profile?: unknown
  suggestedName?: unknown
}

export interface NativeFileActions {
  app: App
  getWindow: () => BrowserWindow | null
  ipcMain: IpcMain
  saveFile: (payload: GatewayFileSavePayload, destination?: string) => Promise<GatewayFileSaveResult>
  shell: Shell
}
