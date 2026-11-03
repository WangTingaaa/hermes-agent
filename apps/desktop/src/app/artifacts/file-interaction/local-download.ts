import { isArtifactFilePath } from '@/lib/media'

import type { ArtifactRecord } from '../artifact-utils'

import type { ArtifactDownloadWindow, ArtifactFileOwner } from './type'

/** Pick before any network await so the browser retains the user's activation. */
export async function downloadArtifactToLocalFolder(
  artifact: ArtifactRecord,
  owner: ArtifactFileOwner
): Promise<boolean> {
  const picker = (window as ArtifactDownloadWindow).showDirectoryPicker
  const gatewayFile = isArtifactFilePath(artifact.value)
  const downloadUrl = window.hermesDesktop?.getGatewayFileDownloadUrl

  if (!picker || (gatewayFile && !downloadUrl)) {
    return false
  }

  let directory

  try {
    directory = await picker.call(window, { mode: 'readwrite' })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true
    }

    throw error
  }

  const url = gatewayFile
    ? await downloadUrl!({
        ...owner,
        path: artifact.value,
        sessionId: artifact.sessionId
      })
    : artifact.href

  const response = await fetch(url)

  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${response.status}`)
  }

  const filename = artifact.label.replace(/\\/g, '/').split('/').pop() || 'download'
  const file = await directory.getFileHandle(filename, { create: true })
  const writable = await file.createWritable()
  await response.body.pipeTo(writable)

  return true
}
