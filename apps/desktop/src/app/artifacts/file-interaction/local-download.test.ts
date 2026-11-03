import { afterEach, expect, it, vi } from 'vitest'

import type { ArtifactRecord } from '../artifact-utils'

import { downloadArtifactFile } from './file-access'

const artifact: ArtifactRecord = {
  id: 'report',
  kind: 'file',
  value: '/output/report.pdf',
  href: 'file:///output/report.pdf',
  label: 'report.pdf',
  sessionId: 'writer-session',
  profile: 'writer',
  sessionTitle: 'Report',
  timestamp: 1
}

const owner = { connectionId: 'office', profile: 'writer' }

afterEach(() => vi.unstubAllGlobals())

it.each(['gateway', 'external'])(
  'saves original %s bytes into the selected local folder with the artifact filename',
  async source => {
    const bytes = new Uint8Array([0, 42, 255])
    const chunks: Uint8Array[] = []

    const writable = new WritableStream<Uint8Array>({
      write: chunk => {
        chunks.push(chunk)
      }
    })

    const createWritable = vi.fn().mockResolvedValue(writable)
    const getFileHandle = vi.fn().mockResolvedValue({ createWritable })
    const picker = vi.fn().mockResolvedValue({ getFileHandle })
    const getGatewayFileDownloadUrl = vi.fn().mockResolvedValue('/ticketed/report.pdf')
    const fetchFile = vi.fn().mockResolvedValue(new Response(bytes))
    vi.stubGlobal('showDirectoryPicker', picker)
    vi.stubGlobal('hermesDesktop', { getGatewayFileDownloadUrl })
    vi.stubGlobal('fetch', fetchFile)

    const file =
      source === 'external'
        ? { ...artifact, value: 'https://files.example/report.pdf', href: 'https://files.example/report.pdf' }
        : artifact

    const download = downloadArtifactFile(file, owner)
    expect(picker).toHaveBeenCalledExactlyOnceWith({ mode: 'readwrite' })
    expect(fetchFile).not.toHaveBeenCalled()
    await download
    expect(getFileHandle).toHaveBeenCalledExactlyOnceWith('report.pdf', { create: true })
    expect(new Uint8Array(chunks.flatMap(chunk => [...chunk]))).toEqual(bytes)
    expect(fetchFile).toHaveBeenCalledExactlyOnceWith(source === 'external' ? file.href : '/ticketed/report.pdf')

    if (source === 'gateway') {
      expect(getGatewayFileDownloadUrl).toHaveBeenCalledExactlyOnceWith({
        ...owner,
        path: artifact.value,
        sessionId: artifact.sessionId
      })
    } else {
      expect(getGatewayFileDownloadUrl).not.toHaveBeenCalled()
    }
  }
)

it('canceling the folder picker does not fetch or fall back to another download', async () => {
  vi.stubGlobal('showDirectoryPicker', vi.fn().mockRejectedValue(new DOMException('Canceled', 'AbortError')))
  const saveGatewayFile = vi.fn()
  const fetchFile = vi.fn()
  vi.stubGlobal('hermesDesktop', { saveGatewayFile, getGatewayFileDownloadUrl: vi.fn() })
  vi.stubGlobal('fetch', fetchFile)
  await downloadArtifactFile(artifact, owner)
  expect(fetchFile).not.toHaveBeenCalled()
  expect(saveGatewayFile).not.toHaveBeenCalled()
})
