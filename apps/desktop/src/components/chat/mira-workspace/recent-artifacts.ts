import { type ArtifactRecord, loadArtifactsForSessions } from '@/app/artifacts/artifact-utils'
import { getSessionMessages, hermesApi } from '@/hermes'
import type { PaginatedSessions } from '@/types/hermes'

import type { MiraArtifactScope } from './type'

export function recentWorkspaceArtifacts(artifacts: ArtifactRecord[]) {
  const latest = new Map<string, ArtifactRecord>()

  for (const artifact of [...artifacts].sort((a, b) => b.timestamp - a.timestamp)) {
    if (artifact.kind !== 'link' && !latest.has(artifact.value)) {
      latest.set(artifact.value, artifact)
    }
  }

  return [...latest.values()].slice(0, 5)
}

/** Read the same generated-file records as All artifacts, pinned to the home
 * that requested them even if the active connection changes during indexing. */
export async function loadRecentWorkspaceArtifacts(scope: MiraArtifactScope, signal: AbortSignal) {
  const result = await hermesApi<PaginatedSessions>({
    connectionId: scope.connectionId ?? 'local',
    profile: scope.profile,
    path: `/api/profiles/sessions?limit=30&offset=0&min_messages=1&archived=include&order=recent&profile=${encodeURIComponent(scope.profile)}`
  })

  signal.throwIfAborted()
  const sessions = result.sessions.filter(session => (session.profile || 'default') === scope.profile)

  const { artifacts, failures } = await loadArtifactsForSessions(sessions, (session, page) => {
    signal.throwIfAborted()

    return getSessionMessages(
      session.id,
      scope,
      { ...page, includeCompacted: true, order: 'oldest' },
      { passive: true }
    )
  })

  signal.throwIfAborted()

  return { artifacts: recentWorkspaceArtifacts(artifacts), partial: failures.length > 0 }
}
