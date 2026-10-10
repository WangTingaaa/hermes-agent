import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { downloadGatewayFileWithFeedback } from '@/lib/media'
import { notifyError } from '@/store/notifications'

import type { OfficePreviewProps } from './type'

export function OfficePreview({ owner, path, title }: OfficePreviewProps) {
  const { t } = useI18n()
  const [opening, setOpening] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const preview = window.hermesDesktop?.previewGatewayFile

  async function handlePreview() {
    if (!preview || opening) return
    setOpening(true)
    try {
      await preview({ ...owner, path })
    } catch (error) {
      notifyError(error, t.preview.unavailable)
    } finally {
      setOpening(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadGatewayFileWithFeedback(path, { owner })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <p className="max-w-full truncate text-sm font-medium" title={title}>
        {title}
      </p>
      <div className="flex gap-2">
        {preview && (
          <Button disabled={opening} onClick={() => void handlePreview()}>
            {opening ? t.preview.loading : t.preview.openPreview}
          </Button>
        )}
        <Button disabled={downloading} onClick={() => void handleDownload()} variant="outline">
          {t.fileMenu.download}
        </Button>
      </div>
    </div>
  )
}
