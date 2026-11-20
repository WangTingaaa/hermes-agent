import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import { $restartPreviewServer } from '@/app/contrib/panes'
import { PageLoader } from '@/components/page-loader'
import { useI18n } from '@/i18n'
import { loadHtmlPreview } from '@/lib/local-preview'
import { isWenjingEmbeddedDesktop } from '@/lib/platform'
import { $previewReloadRequest, $previewTabs, adoptPersistedBrowserTab } from '@/store/preview'
import { isBrowserWindow } from '@/store/windows'

import { PreviewPane } from './preview-pane'

interface PreviewTilePaneProps {
  /** The tab's own Close, for body states that offer one (a failed load). */
  onClose?: () => void
  /** The `$previewTabs` id this pane renders. */
  tabId: string
}

/**
 * One preview, as a layout-tree pane. The tab strip — its label, close verbs,
 * drag/stack/split and ⌘W — belongs to the ZONE (see `preview-tile.tsx`), so
 * this renders only the body and a preview tab behaves like every other tab.
 *
 * The console / DevTools toggles live in the pane's own browser bar beside the
 * address (`preview-browser-bar`); the restart handler arrives through the atom
 * bridge the old rail wrapper used, since the mirror renders this pane with no
 * props to thread.
 */
export function PreviewTilePane({ onClose, tabId }: PreviewTilePaneProps) {
  const previewReloadRequest = useStore($previewReloadRequest)
  const previewTabs = useStore($previewTabs)
  const restartPreviewServer = useStore($restartPreviewServer)

  // A popped-out Browser is a fresh renderer: no session ever pushes a scope
  // there, so its scoped view may start empty. Pull this window's tab in from
  // shared storage; the docked mirror never runs this (it is not a browser
  // window), so a closed tab stays closed there.
  useEffect(() => {
    if (isBrowserWindow() && tabId && !previewTabs.some(tab => tab.id === tabId)) {
      adoptPersistedBrowserTab(tabId)
    }
  }, [previewTabs, tabId])

  const tab = previewTabs.find(candidate => candidate.id === tabId)
  const target = tab?.target
  const sessionId = tab?.sessionId
  const { t } = useI18n()

  const restoreHtml = target?.kind === 'file' && target.previewKind === 'html' &&
    !target.dataUrl && !target.transient && target.renderMode !== 'source' && isWenjingEmbeddedDesktop()

  // Older tabs persist a file URL. Hydrate the document before mounting the pane,
  // just as a fresh click would, without selecting or reopening a background tab.
  useEffect(() => {
    if (!restoreHtml || !target) {
      return
    }

    let active = true
    void loadHtmlPreview(target, { sessionId }).then(loaded => {
      const current = $previewTabs.get()

      if (active && current.some(item => item.id === tabId && item.target === target && item.sessionId === sessionId)) {
        $previewTabs.set(current.map(item => item.id === tabId ? { ...item, target: loaded } : item))
      }
    })

    return () => { active = false }
  }, [restoreHtml, sessionId, tabId, target])

  if (restoreHtml) {
    return <PageLoader label={t.preview.loading} />
  }

  // The tab closed while this pane was still mounted (the mirror disposes it a
  // tick later).
  if (!target) {
    return null
  }

  return (
    <PreviewPane
      embedded
      onClose={onClose}
      onRestartServer={target.kind === 'url' ? (restartPreviewServer ?? undefined) : undefined}
      reloadRequest={previewReloadRequest}
      sessionId={tab?.sessionId}
      tabId={tabId}
      target={target}
    />
  )
}
