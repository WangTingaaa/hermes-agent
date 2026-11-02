import { lazy, Suspense, useEffect, useState } from 'react'

import { PageLoader } from '@/components/page-loader'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/i18n'
import { localPreviewTarget } from '@/lib/local-preview'

import { loadArtifactFilePreview } from './file-access'
import { ArtifactImagePreview } from './image-preview'
import type { ArtifactFilePreview, ArtifactPreviewDialogProps } from './type'

const PdfPreview = lazy(() =>
  import('@/app/chat/right-rail/preview-file').then(module => ({ default: module.LocalFilePreview }))
)

export function ArtifactPreviewDialog({ artifact, onClose, owner }: ArtifactPreviewDialogProps) {
  const { t } = useI18n()
  const [preview, setPreview] = useState<ArtifactFilePreview | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const { connectionId, profile } = owner

  useEffect(() => {
    let active = true
    setFailed(false)
    setPreview(null)
    void loadArtifactFilePreview(artifact, { connectionId, profile }).then(
      result => {
        if (active) {
          setPreview(result)
        }
      },
      () => {
        if (active) {
          setFailed(true)
        }
      }
    )

    return () => {
      active = false
    }
  }, [artifact, connectionId, profile, attempt])

  function renderPreview() {
    if (failed || preview?.kind === 'unsupported') {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
          <Codicon name="file-text" />
          <p>{failed ? t.preview.unavailable : t.preview.noInlineTitle}</p>
          {failed && (
            <Button onClick={() => setAttempt(value => value + 1)} size="sm" variant="secondary">
              {t.common.retry}
            </Button>
          )}
        </div>
      )
    }

    if (!preview) {
      return <PageLoader label={t.preview.loading} />
    }

    switch (preview.kind) {
      case 'image':
        return <ArtifactImagePreview label={artifact.label} onError={() => setFailed(true)} src={preview.src} />
      case 'pdf': {
        const target = localPreviewTarget(artifact.value)!

        return (
          <Suspense fallback={<PageLoader label={t.preview.loading} />}>
            <PdfPreview
              onClose={onClose}
              reloadKey={0}
              sessionId={artifact.sessionId}
              target={{ ...target, dataUrl: preview.src }}
            />
          </Suspense>
        )
      }

      case 'text':
        return (
          <div className="h-full overflow-auto p-4">
            {preview.truncated && <p className="mb-3 text-xs text-muted-foreground">{t.preview.truncated}</p>}
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{preview.text}</pre>
          </div>
        )
    }
  }

  return (
    <Dialog
      onOpenChange={open => {
        if (!open) {
          onClose()
        }
      }}
      open
    >
      <DialogContent bodyClassName="flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="max-w-full truncate pr-8" title={artifact.label}>
            {artifact.label}
          </DialogTitle>
          <DialogDescription className="max-w-full truncate" title={artifact.value}>
            {artifact.value}
          </DialogDescription>
        </DialogHeader>
        <div
          aria-label={t.preview.tab}
          className="h-[min(65vh,42rem)] min-h-0 overflow-hidden rounded-md bg-(--ui-bg-quinary)"
        >
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
