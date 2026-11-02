import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'

import { usePaneVisible } from '@/components/pane-shell/pane-visibility'
import { $sessions } from '@/store/session'

import { loadRecentWorkspaceArtifacts } from './recent-artifacts'
import type { MiraArtifactScope, MiraRecentArtifactsState } from './type'

export function useRecentWorkspaceArtifacts({ profile, connectionId }: MiraArtifactScope) {
  const visible = usePaneVisible()
  const sessions = useStore($sessions)

  const revision = sessions
    .filter(
      session => (session.profile || 'default') === profile && (session.connection_id ?? connectionId) === connectionId
    )
    .map(session => `${session.id}:${session.last_active}:${session.message_count}`)
    .join('|')

  const key = JSON.stringify([connectionId, profile, revision])
  const [state, setState] = useState<MiraRecentArtifactsState | null>(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!visible) {
      return undefined
    }

    const controller = new AbortController()
    void loadRecentWorkspaceArtifacts({ profile, connectionId }, controller.signal).then(
      result => {
        if (!controller.signal.aborted) {
          setState({ key, ...result })
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ key, artifacts: [], partial: true })
        }
      }
    )

    return () => controller.abort()
  }, [connectionId, profile, visible, key, refresh])

  return { result: state?.key === key ? state : null, retry: () => setRefresh(value => value + 1) }
}
