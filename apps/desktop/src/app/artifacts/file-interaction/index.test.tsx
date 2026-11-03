import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'

import { hermesApi } from '@/hermes'
import { I18nProvider } from '@/i18n'

import type { ArtifactRecord } from '../artifact-utils'

import { uploadArtifactToCloud } from './upload-to-cloud'

import { ArtifactFileInteraction } from './index'

vi.mock('./upload-to-cloud', () => ({ uploadArtifactToCloud: vi.fn().mockResolvedValue(undefined) }))
const host = vi.hoisted(() => ({ isWenjingHost: false }))
vi.mock('@/themes/context', () => ({ useTheme: () => host }))

vi.mock('@/hermes', async () => ({ ...(await vi.importActual('@/hermes')), hermesApi: vi.fn() }))

const artifact: ArtifactRecord = {
  id: 'picture',
  kind: 'image',
  value: '/output/chart.png',
  href: 'file:///output/chart.png',
  label: 'chart.png',
  sessionId: 'writer-session',
  profile: 'writer',
  sessionTitle: 'Report',
  timestamp: 1000
}

afterEach(() => {
  host.isWenjingHost = false
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

function Fixture() {
  return (
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="en">
        <ArtifactFileInteraction artifact={artifact} connectionId="office">
          {preview => <button onClick={preview}>chart.png</button>}
        </ArtifactFileInteraction>
      </I18nProvider>
    </MemoryRouter>
  )
}

it('opens an owner-pinned floating image preview on click without triggering a download', async () => {
  const saveGatewayFile = vi.fn()
  vi.stubGlobal('hermesDesktop', { saveGatewayFile })
  vi.mocked(hermesApi).mockResolvedValue({ dataUrl: 'data:image/png;base64,aGVsbG8=' })
  render(<Fixture />)
  fireEvent.click(screen.getByRole('button', { name: 'chart.png' }))
  expect(await screen.findByRole('dialog')).toBeTruthy()
  expect((await screen.findByRole('img', { name: 'chart.png' })).getAttribute('src')).toBe(
    'data:image/png;base64,aGVsbG8='
  )
  expect(hermesApi).toHaveBeenCalledWith({
    connectionId: 'office',
    profile: 'writer',
    path: '/api/fs/read-data-url?path=%2Foutput%2Fchart.png&session_id=writer-session'
  })
  expect(saveGatewayFile).not.toHaveBeenCalled()
})

it('opens the same preview/download menu on right-click and downloads only when selected', async () => {
  const saveGatewayFile = vi.fn().mockResolvedValue({ saved: true })
  vi.stubGlobal('hermesDesktop', { saveGatewayFile })
  render(<Fixture />)
  fireEvent.contextMenu(screen.getByRole('button', { name: 'chart.png' }))
  expect(await screen.findByRole('menuitem', { name: 'Preview' })).toBeTruthy()
  expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual(['Preview', 'Download'])
  expect(saveGatewayFile).not.toHaveBeenCalled()
  await act(async () => fireEvent.click(screen.getByRole('menuitem', { name: 'Download' })))
  expect(saveGatewayFile).toHaveBeenCalledExactlyOnceWith({
    connectionId: 'office',
    profile: 'writer',
    sessionId: 'writer-session',
    path: '/output/chart.png',
    suggestedName: 'chart.png'
  })
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('starts a new cloud-upload conversation only when the upload menu item is selected', async () => {
  host.isWenjingHost = true
  render(<Fixture />)
  fireEvent.contextMenu(screen.getByRole('button', { name: 'chart.png' }))
  expect(uploadArtifactToCloud).not.toHaveBeenCalled()
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Upload to cloud' }))
  expect(uploadArtifactToCloud).toHaveBeenCalledExactlyOnceWith(
    artifact,
    { connectionId: 'office', profile: 'writer' },
    expect.objectContaining({ uploadToCloud: 'Upload to cloud' }),
    expect.any(Function)
  )
})

it('offers preview, upload, download in order and delegates embedded downloads to the host folder flow', async () => {
  host.isWenjingHost = true
  const download = vi.fn().mockResolvedValue({ saved: false, canceled: true })
  const saveGatewayFile = vi.fn()
  vi.stubGlobal('hermesDesktop', { artifactFiles: { download }, saveGatewayFile })
  render(<Fixture />)
  fireEvent.contextMenu(screen.getByRole('button', { name: 'chart.png' }))
  const items = await screen.findAllByRole('menuitem')
  expect(items.map(item => item.textContent)).toEqual(['Preview', 'Upload to cloud', 'Download'])
  fireEvent.click(items[2])
  expect(download).toHaveBeenCalledExactlyOnceWith({
    connectionId: 'office',
    profile: 'writer',
    sessionId: 'writer-session',
    path: '/output/chart.png',
    suggestedName: 'chart.png'
  })
  expect(saveGatewayFile).not.toHaveBeenCalled()
})

it('uses the local save dialog outside Wenjing even if a host download bridge is present', async () => {
  const download = vi.fn()
  const saveGatewayFile = vi.fn().mockResolvedValue({ saved: true })
  vi.stubGlobal('hermesDesktop', { artifactFiles: { download }, saveGatewayFile })
  render(<Fixture />)
  fireEvent.contextMenu(screen.getByRole('button', { name: 'chart.png' }))
  const item = await screen.findByRole('menuitem', { name: 'Download' })
  await act(async () => fireEvent.click(item))
  expect(saveGatewayFile).toHaveBeenCalledWith(expect.objectContaining({ path: artifact.value }))
  expect(download).not.toHaveBeenCalled()
})
