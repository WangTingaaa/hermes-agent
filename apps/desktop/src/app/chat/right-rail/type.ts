import type { PreviewTarget } from '@/store/preview'

export interface LocalFilePreviewProps {
  onClose?: () => void
  onSelectRendered?: () => void
  reloadKey: number
  target: PreviewTarget
}
