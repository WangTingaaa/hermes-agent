import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PreviewAttachment } from '@/components/chat/preview-attachment'
import { DEFAULT_LOCALE, TRANSLATIONS } from '@/i18n'
import type * as PreviewStore from '@/store/preview'

// #101683 regression coverage: the delivered-file card must branch on the
// target's LOCAL filesystem state — an existing directory opens natively with
// no Download and no broken preview, an existing local file reveals instead of
// re-downloading, a remote-backend file keeps the gateway-backed actions, and a
// missing path reports instead of fabricating a preview tab.

const { isDesktopFsRemoteMode, notifyError, openPreview } = vi.hoisted(() => ({
  isDesktopFsRemoteMode: vi.fn(() => false),
  notifyError: vi.fn(),
  openPreview: vi.fn()
}))

vi.mock('@/lib/desktop-fs', () => ({
  isDesktopFsRemoteMode,
  readDesktopDir: vi.fn(),
  readDesktopFileDataUrl: vi.fn(),
  readDesktopFileText: vi.fn()
}))

vi.mock('@/store/notifications', () => ({ notifyError }))

vi.mock('@/store/preview', async importOriginal => ({
  ...(await importOriginal<typeof PreviewStore>()),
  $previewTabSources: atom<string[]>([]),
  closePreviewForSource: vi.fn(),
  openPreview
}))

const t = TRANSLATIONS[DEFAULT_LOCALE]
const previousDesktop = window.hermesDesktop

function fileTarget(path: string, previewKind = 'text') {
  return {
    kind: 'file' as const,
    label: path.split('/').filter(Boolean).pop() || path,
    path,
    previewKind,
    source: `file://${path}`,
    url: `file://${path}`
  }
}

function mountDesktopStub(normalizePreviewTarget: (target: string, baseDir?: string) => unknown) {
  const openDir = vi.fn(async () => ({ ok: true }))
  const revealPath = vi.fn(async () => true)

  window.hermesDesktop = {
    normalizePreviewTarget: vi.fn(normalizePreviewTarget),
    openDir,
    revealPath
  } as never

  return { openDir, revealPath }
}

async function buttons() {
  return (await screen.findAllByRole('button')).map(button => button.textContent)
}

describe('PreviewAttachment local target classification (#101683)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDesktopFsRemoteMode.mockReturnValue(false)
  })

  afterEach(() => {
    cleanup()
    window.hermesDesktop = previousDesktop
  })

  it('opens a Windows file:///C:/... directory link natively with no Download or preview action', async () => {
    const { openDir, revealPath } = mountDesktopStub(() => fileTarget('C:/Users/E/reports/historical', 'directory'))

    render(<PreviewAttachment target="file:///C:/Users/E/reports/historical" />)

    const open = await screen.findByRole('button', { name: t.fileMenu.revealFileManager })
    expect(await buttons()).toEqual([t.fileMenu.revealFileManager])

    await act(async () => {
      fireEvent.click(open)
    })

    expect(openDir).toHaveBeenCalledWith('C:/Users/E/reports/historical')
    expect(revealPath).not.toHaveBeenCalled()
    expect(openPreview).not.toHaveBeenCalled()
  })

  it('opens a POSIX directory link through the native folder action', async () => {
    const { openDir } = mountDesktopStub(() => fileTarget('/work/reports/historical', 'directory'))

    render(<PreviewAttachment target="/work/reports/historical" />)

    const open = await screen.findByRole('button', { name: t.fileMenu.revealFileManager })

    await act(async () => {
      fireEvent.click(open)
    })

    expect(openDir).toHaveBeenCalledWith('/work/reports/historical')
    expect(openPreview).not.toHaveBeenCalled()
  })

  it('reveals an existing local file in the file manager instead of offering Download', async () => {
    const { openDir, revealPath } = mountDesktopStub(() => fileTarget('/work/report.md'))

    render(<PreviewAttachment target="/work/report.md" />)

    await screen.findByRole('button', { name: t.fileMenu.revealFileManager })
    expect(await buttons()).toEqual([t.fileMenu.revealFileManager, t.preview.openPreview])

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: t.fileMenu.revealFileManager }))
    })

    expect(revealPath).toHaveBeenCalledWith('/work/report.md')
    expect(openDir).not.toHaveBeenCalled()
  })

  it('keeps Download and the preview action for a remote-backend file', async () => {
    isDesktopFsRemoteMode.mockReturnValue(true)
    const { openDir, revealPath } = mountDesktopStub(() => fileTarget('/srv/report.md'))

    render(<PreviewAttachment target="/srv/report.md" />)

    expect(await buttons()).toEqual([t.fileMenu.download, t.preview.openPreview])

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: t.preview.openPreview }))
    })

    // The remote path is not on this machine: no native folder action fires.
    expect(openDir).not.toHaveBeenCalled()
    expect(revealPath).not.toHaveBeenCalled()
  })

  it('reports a missing path instead of opening a broken preview tab', async () => {
    mountDesktopStub(() => fileTarget('/work/gone.md', 'missing'))

    render(<PreviewAttachment target="/work/gone.md" />)

    const preview = await screen.findByRole('button', { name: t.preview.unavailable })

    await act(async () => {
      fireEvent.click(preview)
    })

    expect(notifyError).toHaveBeenCalled()
    expect(openPreview).not.toHaveBeenCalled()
  })
})
