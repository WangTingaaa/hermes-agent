import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { useZoomPan } from '@/components/ui/use-zoom-pan'
import { useI18n } from '@/i18n'

import type { ArtifactImagePreviewProps } from './type'

export function ArtifactImagePreview({ label, onError, src }: ArtifactImagePreviewProps) {
  const { t } = useI18n()

  const { panning, ref, reset, scale, stageProps, style, zoomIn, zoomOut } = useZoomPan<HTMLImageElement>({
    enabled: true
  })

  function renderControls() {
    return (
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-popover p-1 shadow-md">
        <Button
          aria-label={t.desktop.zoomOut}
          disabled={scale <= 0.25}
          onClick={() => zoomOut()}
          size="icon-sm"
          variant="ghost"
        >
          <Codicon name="zoom-out" />
        </Button>
        <Button aria-label={t.desktop.resetZoom} onClick={() => reset()} size="sm" variant="ghost">
          {Math.round(scale * 100)}%
        </Button>
        <Button
          aria-label={t.desktop.zoomIn}
          disabled={scale >= 8}
          onClick={() => zoomIn()}
          size="icon-sm"
          variant="ghost"
        >
          <Codicon name="zoom-in" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden p-3 pb-12">
      <img
        alt={label}
        className="max-h-full max-w-full select-none object-contain"
        onError={onError}
        ref={ref}
        src={src}
        style={{ ...style, cursor: scale > 1 ? (panning ? 'grabbing' : 'grab') : 'zoom-in', touchAction: 'none' }}
        {...stageProps}
      />
      {renderControls()}
    </div>
  )
}
