import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { ActionsContextMenu, ActionsMenu, type MenuKit } from '@/components/ui/actions-menu'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Download, Eye, iconSize, MoreHorizontal, Upload } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { $activeConnectionId } from '@/store/connections'
import { notifyError } from '@/store/notifications'

import { downloadArtifactFile } from './file-access'
import { ArtifactPreviewDialog } from './preview-dialog'
import type { ArtifactFileInteractionProps, ArtifactFileOwner } from './type'
import { uploadArtifactToCloud } from './upload-to-cloud'

export function ArtifactFileInteraction({
  artifact,
  children,
  className,
  connectionId,
  variant = 'row'
}: ArtifactFileInteractionProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const uploadInFlight = useRef(false)
  const [previewOwner, setPreviewOwner] = useState<ArtifactFileOwner | null>(null)
  const [saving, setSaving] = useState(false)

  function ownerNow(): ArtifactFileOwner {
    return {
      connectionId: connectionId ?? $activeConnectionId.get() ?? 'local',
      profile: artifact.profile || 'default'
    }
  }

  function handlePreview() {
    setPreviewOwner(ownerNow())
  }

  async function handleDownload() {
    setSaving(true)

    try {
      await downloadArtifactFile(artifact, ownerNow())
    } catch (error) {
      notifyError(error, t.fileMenu.downloadFailed)
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadToCloud() {
    if (uploadInFlight.current) {
      return
    }

    uploadInFlight.current = true
    setUploading(true)

    try {
      await uploadArtifactToCloud(artifact, ownerNow(), t.artifacts.fileActions, navigate)
    } catch (error) {
      notifyError(error, t.artifacts.fileActions.uploadFailed)
    } finally {
      uploadInFlight.current = false
      setUploading(false)
    }
  }

  function renderMenu(kit: MenuKit) {
    return (
      <>
        <kit.Item onSelect={handlePreview}>
          <Eye className={iconSize.md} />
          {t.preview.tab}
        </kit.Item>
        <kit.Item disabled={uploading} onSelect={() => void handleUploadToCloud()}>
          <Upload className={iconSize.md} />
          {t.artifacts.fileActions.uploadToCloud}
        </kit.Item>
        <kit.Item disabled={saving} onSelect={() => void handleDownload()}>
          <Download className={iconSize.md} />
          {t.fileMenu.download}
        </kit.Item>
      </>
    )
  }

  return (
    <>
      <ActionsContextMenu items={renderMenu}>
        <div className={cn('artifact-file-interaction group/file relative min-w-0', className)} data-variant={variant}>
          {children(handlePreview)}
          <div className="artifact-file-interaction__menu">
            <ActionsMenu items={renderMenu}>
              <Button aria-label={t.profiles.actions} size="icon-sm" variant="secondary">
                <MoreHorizontal className={iconSize.md} />
              </Button>
            </ActionsMenu>
          </div>
        </div>
      </ActionsContextMenu>
      {previewOwner && (
        <ArtifactPreviewDialog artifact={artifact} onClose={() => setPreviewOwner(null)} owner={previewOwner} />
      )}
    </>
  )
}
