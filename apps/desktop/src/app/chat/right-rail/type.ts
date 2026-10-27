import type { PreviewTarget } from '@/store/preview'

export interface LocalFilePreviewProps {
  onClose?: () => void
  onSelectRendered?: () => void
  sessionId?: string
  reloadKey: number
  target: PreviewTarget
}
