import { readdir } from 'node:fs/promises'
import path from 'node:path'

import { desktopCapturer, ipcMain, type Session, systemPreferences, type WebContents, webContents } from 'electron'

import { isMediaCapturePermission } from './media-capture-permission'

const bundleExecutables = new Map<string, Promise<string[]>>()

async function applicationAliases(appPath: string | undefined): Promise<string[]> {
  if (!appPath?.endsWith('.app')) {
    return []
  }

  let executables = bundleExecutables.get(appPath)

  if (!executables) {
    executables = readdir(path.join(appPath, 'Contents', 'MacOS')).catch(() => [])
    bundleExecutables.set(appPath, executables)
  }

  return executables
}

// The selection is a one-use, short-lived local permission, never an arbitrary
// capture id supplied by a guest frame. Media frames stay inside Chromium.
export function installDesktopPreview(target: Session, trusted: (contents: WebContents) => boolean) {
  const choices = new Map<number, { ids: Set<string>; expires: number; selected?: string }>()

  const assertSender = (event: Electron.IpcMainInvokeEvent) => {
    if (!trusted(event.sender) || event.senderFrame !== event.sender.mainFrame) {
      throw new Error('Untrusted capture caller')
    }
  }

  ipcMain.removeHandler('hermes:desktop-preview:snapshot')
  ipcMain.handle('hermes:desktop-preview:snapshot', async (event, target: unknown) => {
    assertSender(event)

    if (!target || typeof target !== 'object') {
      throw new Error('Invalid preview target')
    }

    const { app, windowTitle } = target as Record<string, unknown>

    if (typeof app !== 'string' || typeof windowTitle !== 'string') {
      throw new Error('Invalid preview target')
    }

    if (!app && !windowTitle) {
      return null
    }

    if (
      process.platform === 'darwin' &&
      ['denied', 'restricted'].includes(systemPreferences.getMediaAccessStatus('screen'))
    ) {
      throw new Error('SCREEN_CAPTURE_PERMISSION: Allow screen recording for the host application and restart it')
    }

    // Follow an identified operation window. Never silently fall back to the whole screen.
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 1280, height: 800 }
    })

    const title = windowTitle.toLocaleLowerCase()
    const name = app.toLocaleLowerCase()
    const { enumerateWindowsFrontToBack, enumerationFailed } = await import('./window-below')
    const windows = await enumerateWindowsFrontToBack(process.pid, true)

    const candidates = enumerationFailed(windows) ? [] : windows

    const matches = await Promise.all(
      candidates.map(async window => {
        const aliases = [
          window.app,
          window.appId,
          window.appPath && path.basename(window.appPath, '.app'),
          ...(await applicationAliases(window.appPath))
        ]

        return aliases.some(alias => alias?.toLocaleLowerCase() === name)
      })
    )

    const owned = candidates.filter((_window, index) => matches[index])

    const operationWindow =
      owned.find(window => title && window.title.toLocaleLowerCase() === title) ?? (!title ? owned[0] : undefined)

    const source =
      sources.find(item => operationWindow && item.id.split(':')[1] === String(operationWindow.id)) ??
      sources.find(item => title && item.name.toLocaleLowerCase() === title) ??
      sources.find(item => name && item.name.toLocaleLowerCase() === name)

    if (!source || source.thumbnail.isEmpty()) {
      return null
    }

    return { image: source.thumbnail.toDataURL(), name: source.name, sourceId: source.id }
  })
  ipcMain.removeHandler('hermes:desktop-preview:sources')
  ipcMain.handle('hermes:desktop-preview:sources', async event => {
    assertSender(event)

    for (const [id, choice] of choices) {
      if (choice.expires < Date.now()) {
        choices.delete(id)
      }
    }

    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 0, height: 0 }
    })

    choices.set(event.sender.id, { ids: new Set(sources.map(source => source.id)), expires: Date.now() + 60_000 })

    return sources.map(({ id, name }) => ({ id, name }))
  })
  ipcMain.removeHandler('hermes:desktop-preview:select')
  ipcMain.handle('hermes:desktop-preview:select', (event, id: unknown) => {
    assertSender(event)
    const choice = choices.get(event.sender.id)

    if (typeof id !== 'string' || !choice || choice.expires < Date.now() || !choice.ids.has(id)) {
      throw new Error('Refresh the source list and select an available screen or window')
    }

    choice.selected = id
  })
  target.setDisplayMediaRequestHandler(async (request, callback) => {
    const contents = request.frame ? webContents.fromFrame(request.frame) : undefined
    const choice = contents && choices.get(contents.id)

    if (contents) {
      choices.delete(contents.id)
    }

    if (
      !contents ||
      !trusted(contents) ||
      request.frame !== contents.mainFrame ||
      !request.userGesture ||
      !choice?.selected ||
      choice.expires < Date.now()
    ) {
      callback({})

      return
    }

    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 0, height: 0 }
      })

      const source = sources.find(item => item.id === choice.selected)
      callback(source ? { video: source } : {})
    } catch {
      // OS permission refusal or a closed window must never select another screen.
      callback({})
    }
  })

  return (contents: WebContents | null) => {
    const choice = contents && choices.get(contents.id)

    return Boolean(contents && trusted(contents) && choice?.selected && choice.expires >= Date.now())
  }
}

export function installDesktopMediaPermissions(
  target: Session,
  trusted: (contents: WebContents) => boolean,
  clipboardAllowed: (contents: WebContents | null) => boolean
) {
  const captureAllowed = installDesktopPreview(target, trusted)
  target.setPermissionRequestHandler((contents, permission, callback, details) => {
    if (permission === 'display-capture') {
      callback(captureAllowed(contents))

      return
    }

    if ((permission as string) === 'clipboard-sanitized-write') {
      callback(clipboardAllowed(contents))

      return
    }

    callback(isMediaCapturePermission(permission, details))
  })
  target.setPermissionCheckHandler((contents, permission) => {
    if (permission === 'display-capture') {
      return captureAllowed(contents)
    }

    if ((permission as string) === 'clipboard-sanitized-write') {
      return clipboardAllowed(contents)
    }

    return isMediaCapturePermission(permission, undefined)
  })
}
