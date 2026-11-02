import { useStore } from '@nanostores/react'

import { useWorkspaceComposerTarget } from '@/components/chat/mira-workspace/composer-host'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { $hudMode } from '@/store/hud'
import { isSecondaryWindow } from '@/store/windows'

import { useComposerSurfaceId } from '../scope'

import type { ComposerFloatButtonProps } from './type'

export function ComposerFloatButton({ onToggle, poppedOut }: ComposerFloatButtonProps) {
  const { t } = useI18n()

  const hud = useStore($hudMode)
  const surfaceId = useComposerSurfaceId()
  const workspaceHost = useWorkspaceComposerTarget(surfaceId ?? '')

  if (hud || isSecondaryWindow() || (workspaceHost && !poppedOut)) {
    return null
  }

  const label = poppedOut ? t.composer.workspace.dockComposer : t.composer.workspace.floatComposer

  return (
    <Tip label={label}>
      <Button aria-label={label} onClick={onToggle} size="icon-sm" variant="ghost">
        <Codicon name={poppedOut ? 'screen-normal' : 'open-preview'} />
      </Button>
    </Tip>
  )
}
