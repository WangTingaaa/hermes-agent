import type { HermesReadFileTextResult } from '@/global'
import { hermesApi } from '@/hermes'
import { isReadFileErrorResult } from '@/lib/desktop-fs'
import { downloadBlob } from '@/lib/download'
import { localPreviewTarget } from '@/lib/local-preview'
import { downloadGatewayMediaFile, filePathFromMediaPath, isArtifactFilePath } from '@/lib/media'

import type { ArtifactRecord } from '../artifact-utils'

import type { ArtifactFileOwner, ArtifactFilePreview } from './type'

export async function loadArtifactFilePreview(
  artifact: ArtifactRecord,
  owner: ArtifactFileOwner
): Promise<ArtifactFilePreview> {
  const kind = artifact.kind === 'image' ? 'image' : localPreviewTarget(artifact.value)?.previewKind

  if (!isArtifactFilePath(artifact.value)) {
    return artifact.kind === 'image' ? { kind: 'image', src: artifact.href } : { kind: 'unsupported' }
  }

  const query = new URLSearchParams({ path: filePathFromMediaPath(artifact.value), session_id: artifact.sessionId })

  if (kind === 'image' || kind === 'pdf') {
    const result = await hermesApi<string | { dataUrl?: string }>({ ...owner, path: `/api/fs/read-data-url?${query}` })
    const src = typeof result === 'string' ? result : result.dataUrl

    if (!src || !src.startsWith('data:')) {
      throw new Error('File preview is unavailable')
    }

    return { kind, src }
  }

  const result = await hermesApi<HermesReadFileTextResult>({ ...owner, path: `/api/fs/read-text?${query}` })

  if (isReadFileErrorResult(result)) {
    throw new Error(result.message || result.error)
  }

  if (result.binary) {
    return { kind: 'unsupported' }
  }

  return { kind: 'text', text: result.text, truncated: result.truncated }
}

export async function downloadArtifactFile(artifact: ArtifactRecord, owner: ArtifactFileOwner) {
  if (window.hermesDesktop?.artifactFiles) {
    await window.hermesDesktop.artifactFiles.download({
      ...owner,
      sessionId: artifact.sessionId,
      path: artifact.value,
      suggestedName: artifact.label,
      ...(!isArtifactFilePath(artifact.value) ? { url: artifact.href } : {})
    })

    return
  }

  if (isArtifactFilePath(artifact.value)) {
    await downloadGatewayMediaFile(artifact.value, {
      owner,
      sessionId: artifact.sessionId,
      suggestedName: artifact.label
    })

    return
  }

  if (artifact.kind === 'image' && window.hermesDesktop?.saveImageFromUrl) {
    await window.hermesDesktop.saveImageFromUrl(artifact.href)

    return
  }

  const response = await fetch(artifact.href)

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  downloadBlob(await response.blob(), artifact.label)
}
