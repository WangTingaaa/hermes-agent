import { useStore } from '@nanostores/react'
import { useState } from 'react'

import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/i18n'
import { Loader2 } from '@/lib/icons'
import { $backendCompatibility, backendMeetsMinimumContract, backendOwnerKey } from '@/store/backend-compatibility'
import { $activeConnectionId } from '@/store/connections'
import { $activeGatewayProfile } from '@/store/profile'
import { $backendUpdateApply, applyBackendUpdate } from '@/store/updates'

export function BackendCompatibilityOverlay() {
  const { t } = useI18n()
  const compatibility = useStore($backendCompatibility)
  const backendApply = useStore($backendUpdateApply)
  const connectionId = useStore($activeConnectionId)
  const profile = useStore($activeGatewayProfile)
  const [hostUpdating, setHostUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const compatible = backendMeetsMinimumContract(compatibility, backendOwnerKey(connectionId, profile))
  const runtimeBridge = window.hermesDesktop?.runtime
  const updating = runtimeBridge ? hostUpdating : backendApply.applying || backendApply.stage === 'restart'
  const visibleError = runtimeBridge ? error : backendApply.error && backendApply.message

  if (compatible) {
    return null
  }

  const handleUpdate = async () => {
    if (!runtimeBridge) {
      await applyBackendUpdate()

      return
    }

    setHostUpdating(true)
    setError(null)

    try {
      await runtimeBridge.update()
      window.location.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setHostUpdating(false)
    }
  }

  return (
    <Dialog open>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <div className="flex flex-col items-center gap-4 py-3 text-center">
          <BrandMark className="size-16" />
          <div>
            <DialogTitle className="text-xl">{t.notifications.backendIncompatibleTitle}</DialogTitle>
            <DialogDescription className="mt-2">{t.notifications.backendIncompatibleMessage}</DialogDescription>
          </div>
          {visibleError && <p className="text-sm text-destructive">{visibleError}</p>}
          <Button disabled={updating} onClick={() => void handleUpdate()} size="lg">
            {updating && <Loader2 className="animate-spin" />}
            {t.notifications.updateHermes}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
