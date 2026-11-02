import { BrandMark } from '@/components/brand-mark'
import { Codicon } from '@/components/ui/codicon'

const SATELLITES = [
  ['code', 'code'],
  ['idea', 'lightbulb'],
  ['document', 'file-text']
] as const

/** Decorative only: the workbench's actual actions stay in the composer. */
export function MiraIdeaVisual() {
  return (
    <div aria-hidden="true" className="mira-idea">
      <div className="mira-idea__glow" />
      <svg className="mira-idea__orbit" fill="none" focusable="false" viewBox="0 0 280 160">
        <ellipse className="mira-idea__orbit-track" cx="140" cy="80" rx="112" ry="51" transform="rotate(-15 140 80)" />
        <ellipse
          className="mira-idea__orbit-track mira-idea__orbit-track--inner"
          cx="140"
          cy="80"
          rx="79"
          ry="64"
          transform="rotate(20 140 80)"
        />
        <g className="mira-idea__orbit-light">
          <circle cx="140" cy="18" r="3" />
          <circle cx="140" cy="142" r="2" />
        </g>
        <path className="mira-idea__spark" d="M52 104v10m-5-5h10M220 26v8m-4-4h8" />
      </svg>
      <div className="mira-idea__core">
        <BrandMark className="mira-idea__mark" />
      </div>
      {SATELLITES.map(([id, icon]) => (
        <span className={`mira-idea__satellite mira-idea__satellite--${id}`} key={id}>
          <Codicon name={icon} />
        </span>
      ))}
    </div>
  )
}
