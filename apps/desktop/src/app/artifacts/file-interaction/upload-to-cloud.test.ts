import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { openSession } from '@/app/open-session'
import {
  createGatewaySession,
  desktopSessionCreateParams
} from '@/app/session/hooks/use-session-actions/session-create-request'
import { upsertOptimisticSession } from '@/app/session/hooks/use-session-actions/utils'
import { artifactFileActionCopy } from '@/i18n/artifact-files'
import { sessionTileDelegate } from '@/store/session-states'

import type { ArtifactRecord } from '../artifact-utils'

import { uploadArtifactToCloud } from './upload-to-cloud'

vi.mock('@/app/open-session', () => ({ openSession: vi.fn() }))
vi.mock('@/app/session/hooks/use-session-actions/session-create-request', () => ({
  createGatewaySession: vi.fn(),
  desktopSessionCreateParams: vi.fn()
}))
vi.mock('@/app/session/hooks/use-session-actions/utils', () => ({ upsertOptimisticSession: vi.fn() }))
vi.mock('@/store/session-states', async () => ({
  ...(await vi.importActual('@/store/session-states')),
  sessionTileDelegate: vi.fn()
}))

const artifact: ArtifactRecord = {
  id: 'report',
  kind: 'file',
  value: '/output/report.pdf',
  href: 'file:///output/report.pdf',
  label: 'report.pdf',
  sessionId: 'original',
  profile: 'writer',
  sessionTitle: 'Report',
  timestamp: 1000
}

const owner = { connectionId: 'office', profile: 'writer' }
const created = { session_id: 'created-runtime', stored_session_id: 'new-upload' }
const resumeTile = vi.fn()
const submitToSession = vi.fn()

afterEach(() => vi.unstubAllGlobals())

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(sessionTileDelegate).mockReturnValue({ resumeTile, submitToSession } as unknown as NonNullable<
    ReturnType<typeof sessionTileDelegate>
  >)
  vi.mocked(desktopSessionCreateParams).mockResolvedValue({ source: 'desktop', profile: 'writer' })
  vi.mocked(createGatewaySession).mockResolvedValue(created)
  resumeTile.mockResolvedValue('live-upload')
  submitToSession.mockResolvedValue({ runtimeSessionId: 'live-upload', storedSessionId: 'new-upload' })
})

it('creates and opens a distinct owner-scoped conversation, then submits the exact file to the Wenjing MCP task', async () => {
  const navigate = vi.fn()
  await uploadArtifactToCloud(artifact, owner, artifactFileActionCopy.zh, navigate)
  expect(desktopSessionCreateParams).toHaveBeenCalledExactlyOnceWith('', owner, 'writer', false, false)
  expect(createGatewaySession).toHaveBeenCalledExactlyOnceWith(
    owner,
    { source: 'desktop', profile: 'writer' },
    expect.any(Function)
  )
  expect(upsertOptimisticSession).toHaveBeenCalledWith(
    created,
    'new-upload',
    null,
    expect.any(String),
    null,
    undefined,
    owner
  )
  expect(resumeTile).toHaveBeenCalledExactlyOnceWith('new-upload')
  expect(openSession).toHaveBeenCalledExactlyOnceWith('new-upload', navigate, 'tab')
  expect(submitToSession).toHaveBeenCalledExactlyOnceWith(
    'live-upload',
    artifactFileActionCopy.zh.uploadPrompt('report.pdf', '/output/report.pdf', 'original')
  )
  expect(submitToSession.mock.calls[0][1]).toContain('import_file')
  expect(submitToSession.mock.calls[0][1]).toContain('meso-insights')
})

it('does not retry an upload when the accepting session cannot be verified', async () => {
  submitToSession.mockResolvedValue({ runtimeSessionId: 'other', storedSessionId: 'wrong-chat' })
  await expect(uploadArtifactToCloud(artifact, owner, artifactFileActionCopy.en, vi.fn())).rejects.toThrow(
    'acceptance could not be verified'
  )
  expect(createGatewaySession).toHaveBeenCalledTimes(1)
  expect(submitToSession).toHaveBeenCalledTimes(1)
})

it('waits for the host cloud destination and includes its filesystem folder ID in the new task', async () => {
  let select!: (folder: { folderId: number } | null) => void

  const pickCloudFolder = vi.fn(
    () =>
      new Promise<{ folderId: number } | null>(resolve => {
        select = resolve
      })
  )

  vi.stubGlobal('hermesDesktop', { artifactFiles: { pickCloudFolder } })
  const task = uploadArtifactToCloud(artifact, owner, artifactFileActionCopy.zh, vi.fn())
  expect(createGatewaySession).not.toHaveBeenCalled()
  select({ folderId: 321 })
  await task
  expect(submitToSession.mock.calls[0][1]).toContain('"destination_cloud_folder_id": 321')
  expect(createGatewaySession).toHaveBeenCalledTimes(1)
})

it('creates no chat and submits nothing when the host folder picker is canceled', async () => {
  vi.stubGlobal('hermesDesktop', { artifactFiles: { pickCloudFolder: vi.fn().mockResolvedValue(null) } })
  await uploadArtifactToCloud(artifact, owner, artifactFileActionCopy.zh, vi.fn())
  expect(createGatewaySession).not.toHaveBeenCalled()
  expect(submitToSession).not.toHaveBeenCalled()
})
