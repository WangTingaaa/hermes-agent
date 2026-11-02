import { atom } from 'nanostores'
import { useLayoutEffect, useRef } from 'react'

import { useComposerSurfaceId } from '@/app/chat/composer/scope'
import { useStoreSelector } from '@/lib/use-session-slice'

const $workspaceComposerHosts = atom<Record<string, HTMLElement>>({})

/** The editor's stable portal moves into the workspace, then back to its
 *  conversation anchor. Its draft, attachments and queue never remount. */
export function useWorkspaceComposerHost() {
  const id = useComposerSurfaceId()
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const host = ref.current

    if (!id || !host || host.closest('[data-hud-shell]')) {
      return undefined
    }

    $workspaceComposerHosts.set({ ...$workspaceComposerHosts.get(), [id]: host })

    return () => {
      const next = { ...$workspaceComposerHosts.get() }

      if (next[id] === host) {
        delete next[id]
        $workspaceComposerHosts.set(next)
      }
    }
  }, [id])

  return ref
}

export function useWorkspaceComposerTarget(id: string) {
  return useStoreSelector($workspaceComposerHosts, hosts => hosts[id])
}
