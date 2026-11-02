import { Slot as ContribSlot } from '@/contrib/react/slot'
import { cn } from '@/lib/utils'

import { COMPOSER_AREAS } from '../contrib'

import { ComposerFloatButton } from './float-button'
import type { ComposerLayoutProps } from './type'

/** Presentation seam shared by compact and multiline composer skins. */
export function ComposerLayout({ className, controls, input, menu, onFloatToggle, poppedOut }: ComposerLayoutProps) {
  return (
    <div className={cn('grid w-full', className)} data-slot="composer-layout">
      <div
        className="flex translate-y-[3px] items-start gap-(--composer-control-gap) self-start [grid-area:menu]"
        data-slot="composer-menu"
      >
        {menu}
        <ContribSlot area={COMPOSER_AREAS.leading} />
      </div>
      <div className="min-w-0 [grid-area:input]" data-slot="composer-entry">
        {input}
      </div>
      {/* Contributions and the send cluster pack together. An auto margin on
          the cluster would strand contributed actions at the row start. */}
      <div
        className="flex min-w-0 items-center justify-end gap-(--composer-control-gap) [grid-area:controls]"
        data-slot="composer-controls"
      >
        <ContribSlot area={COMPOSER_AREAS.actions} />
        <ComposerFloatButton onToggle={onFloatToggle} poppedOut={poppedOut} />
        {controls}
      </div>
    </div>
  )
}
