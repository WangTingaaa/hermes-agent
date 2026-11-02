import { expect, it, vi } from 'vitest'

import type { ArtifactRecord } from '@/app/artifacts/artifact-utils'
import { getSessionMessages, hermesApi } from '@/hermes'
import { makeSessionInfo } from '@/test/session-info'

import { loadRecentWorkspaceArtifacts, recentWorkspaceArtifacts } from './recent-artifacts'

vi.mock('@/hermes', () => ({ hermesApi: vi.fn(), getSessionMessages: vi.fn() }))

function artifact(value: string, timestamp: number, kind: ArtifactRecord['kind'] = 'file'): ArtifactRecord {
  return {
    id: `${value}-${timestamp}`,
    value,
    timestamp,
    kind,
    href: value,
    label: value,
    sessionId: 's',
    sessionTitle: 'Task'
  }
}

it('shows the five newest distinct generated files, excluding links and keeping the latest duplicate', () => {
  const records = [
    artifact('report.pdf', 1),
    artifact('sheet.xlsx', 2),
    artifact('slide.pptx', 3),
    artifact('notes.md', 4),
    artifact('chart.png', 5, 'image'),
    artifact('report.pdf', 6),
    artifact('new.docx', 7),
    artifact('https://example.com', 99, 'link')
  ]

  expect(recentWorkspaceArtifacts(records).map(record => record.value)).toEqual([
    'new.docx',
    'report.pdf',
    'chart.png',
    'notes.md',
    'slide.pptx'
  ])
  expect(records[0].timestamp).toBe(1)
})

it('loads files from unopened history and pins every read to the requested profile and connection', async () => {
  vi.mocked(hermesApi).mockResolvedValue({
    sessions: [
      makeSessionInfo({ id: 'saved', profile: 'writer' }),
      makeSessionInfo({ id: 'private', profile: 'personal' })
    ]
  })
  vi.mocked(getSessionMessages).mockResolvedValue({
    session_id: 'saved',
    messages: [{ role: 'assistant', content: 'MEDIA:/output/report.pdf', timestamp: 2000 }]
  })
  const scope = { profile: 'writer', connectionId: 'office' }
  const result = await loadRecentWorkspaceArtifacts(scope, new AbortController().signal)
  expect(result.artifacts.map(record => record.label)).toEqual(['report.pdf'])
  expect(result.partial).toBe(false)
  expect(hermesApi).toHaveBeenCalledWith(expect.objectContaining({ connectionId: 'office', profile: 'writer' }))
  expect(getSessionMessages).toHaveBeenCalledExactlyOnceWith(
    'saved',
    scope,
    { limit: 100, offset: 0, order: 'oldest', includeCompacted: true },
    { passive: true }
  )
})
