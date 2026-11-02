import type { ReactNode } from 'react'

import type { MiraTaskId } from '@/i18n/mira-workspace/type'

import type { MiraCapabilityVisualProps } from './type'

const SCENES = {
  code: (
    <g>
      <rect className="mira-scene__paper" height="112" rx="10" width="170" x="35" y="38" />
      <path className="mira-scene__line" d="M35 62h170" />
      <circle className="mira-scene__fill" cx="49" cy="50" r="2" />
      <circle className="mira-scene__muted-fill" cx="57" cy="50" r="2" />
      <path className="mira-scene__accent" d="m79 84-14 14 14 14m69-28 14 14-14 14m-30-38-10 48" />
      <path className="mira-scene__line" d="M58 134h52m9 0h28" />
    </g>
  ),
  files: (
    <g>
      <rect className="mira-scene__back" height="122" rx="9" transform="rotate(-10 120 90)" width="100" x="68" y="22" />
      <rect className="mira-scene__paper" height="122" rx="9" width="100" x="79" y="31" />
      <path className="mira-scene__accent" d="M96 53h40" />
      <path className="mira-scene__line" d="M96 70h62m-62 14h62m-62 14h38m-38 14h52" />
      <circle className="mira-scene__badge" cx="164" cy="131" r="21" />
      <path className="mira-scene__accent" d="m155 131 6 6 12-13" />
    </g>
  ),
  table: (
    <g>
      <rect className="mira-scene__paper" height="118" rx="10" width="160" x="40" y="30" />
      <path className="mira-scene__accent" d="M56 48h48" />
      <path className="mira-scene__line" d="M40 62h160M40 90h160M40 118h160M80 62v86m40-86v86m40-86v86" />
      <rect className="mira-scene__soft-fill" height="27" width="39" x="81" y="63" />
      <rect className="mira-scene__soft-fill" height="27" width="39" x="121" y="91" />
      <path className="mira-scene__accent" d="m166 130 7 6 15-15" />
    </g>
  ),
  research: (
    <g>
      <circle className="mira-scene__paper" cx="109" cy="81" r="48" />
      <ellipse className="mira-scene__line" cx="109" cy="81" rx="23" ry="48" />
      <path className="mira-scene__line" d="M61 81h96M68 57h82M68 105h82" />
      <circle className="mira-scene__badge" cx="151" cy="115" r="27" />
      <circle className="mira-scene__accent" cx="148" cy="112" r="12" />
      <path className="mira-scene__accent" d="m157 122 18 18" />
      <path className="mira-scene__line" d="M38 145h53m8 0h20M165 35h31m-20 10h20" />
    </g>
  ),
  automate: (
    <g>
      <path className="mira-scene__accent" d="M65 62h42q13 0 13 13v40q0 13 13 13h42M120 89h48" />
      <rect className="mira-scene__paper" height="44" rx="12" width="48" x="27" y="40" />
      <path className="mira-scene__accent" d="m48 52-7 10 7 10m6-20 7 10-7 10" />
      <rect className="mira-scene__badge" height="44" rx="12" width="48" x="161" y="67" />
      <path className="mira-scene__accent" d="m177 89 6 6 11-13" />
      <rect className="mira-scene__paper" height="38" rx="10" width="42" x="158" y="118" />
      <path className="mira-scene__line" d="M171 132h16m-16 9h11" />
      <circle className="mira-scene__badge" cx="120" cy="89" r="5" />
    </g>
  ),
  create: (
    <g>
      <rect className="mira-scene__back" height="112" rx="9" transform="rotate(10 120 90)" width="152" x="47" y="38" />
      <rect className="mira-scene__paper" height="112" rx="9" width="152" x="39" y="28" />
      <rect className="mira-scene__soft-fill" height="42" rx="4" width="54" x="54" y="45" />
      <path className="mira-scene__accent" d="m62 76 10-13 9 8 8-15 11 20" />
      <path className="mira-scene__line" d="M122 49h48m-48 13h36M55 106h115m-115 14h78" />
      <path className="mira-scene__badge" d="m160 137 30-38 11 9-30 38-17 8Z" />
      <path className="mira-scene__accent" d="m160 137 11 9m13-39 11 9" />
    </g>
  )
} satisfies Record<MiraTaskId, ReactNode>

export function MiraCapabilityVisual({ task }: MiraCapabilityVisualProps) {
  return (
    <div aria-hidden="true" className="mira-scene">
      <svg fill="none" focusable="false" viewBox="0 0 240 180">
        <circle className="mira-scene__halo" cx="120" cy="90" r="77" />
        <circle className="mira-scene__orbit" cx="120" cy="90" r="85" />
        {SCENES[task]}
        <path className="mira-scene__spark" d="M26 105v10m-5-5h10M207 42v8m-4-4h8" />
      </svg>
    </div>
  )
}
