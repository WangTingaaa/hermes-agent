import type { ReactNode } from 'react'

import type { openSession } from '@/app/open-session'

import type { ArtifactRecord } from '../artifact-utils'

export interface ArtifactFileInteractionProps {
  artifact: ArtifactRecord
  children: (preview: () => void) => ReactNode
  className?: string
  connectionId?: string | null
  variant?: 'card' | 'row'
}

export interface ArtifactFileOwner {
  connectionId: string
  profile: string
}

export interface ArtifactPreviewDialogProps {
  artifact: ArtifactRecord
  onClose: () => void
  owner: ArtifactFileOwner
}

export type ArtifactFilePreview =
  { kind: 'image' | 'pdf'; src: string } | { kind: 'text'; text: string; truncated?: boolean } | { kind: 'unsupported' }

export interface ArtifactImagePreviewProps {
  label: string
  onError: () => void
  src: string
}

export type ArtifactUploadNavigate = Parameters<typeof openSession>[1]

export interface ArtifactDownloadDirectory {
  getFileHandle: (
    name: string,
    options: { create: true }
  ) => Promise<{
    createWritable: () => Promise<WritableStream<Uint8Array>>
  }>
}

export interface ArtifactDownloadWindow extends Window {
  showDirectoryPicker?: (options: { mode: 'readwrite' }) => Promise<ArtifactDownloadDirectory>
}
