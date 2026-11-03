import { Monitor, MousePointer2 } from 'lucide-react'

import type { PreviewSurfaceProps } from './type'

export function PreviewSurface({ frame, pointer, label, empty }: PreviewSurfaceProps) {
  return (
    <div className="mira-control__preview">
      {frame ? (
        <div className="mira-control__image">
          <img alt={label} draggable={false} src={frame.image} />
          {pointer && (
            <span className="mira-control__pointer" style={{ left: `${pointer.x * 100}%`, top: `${pointer.y * 100}%` }}>
              <span className="mira-control__ripple" key={pointer.id} />
              <MousePointer2 fill="var(--ui-accent)" size={22} />
              <span className="mira-control__pointer-label">Mira</span>
            </span>
          )}
        </div>
      ) : (
        <div className="mira-control__empty">
          <Monitor size={24} strokeWidth={1.25} />
          <span>{empty}</span>
        </div>
      )}
    </div>
  )
}
