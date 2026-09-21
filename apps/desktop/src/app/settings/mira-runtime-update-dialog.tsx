import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Loader } from '@/components/ui/loader'
import { Progress } from '@/components/ui/progress'
import type { MiraRuntimeState } from '@/global'
import { useI18n } from '@/i18n'

interface MiraRuntimeUpdateDialogProps {
  notes: string[]
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
  open: boolean
  state: MiraRuntimeState | null
}

export function MiraRuntimeUpdateDialog({ notes, onOpenChange, onUpdate, open, state }: MiraRuntimeUpdateDialogProps) {
  const { t } = useI18n()
  const a = t.settings.about
  const u = t.updates
  const applying = state?.status === 'installing'
  const progress = Math.max(0, Math.min(100, Math.round(state?.progress || 0)))

  const handleOpenChange = (next: boolean) => {
    if (!applying) {
      onOpenChange(next)
    }
  }

  const renderContent = () => {
    if (applying) {
      return (
        <div className="grid gap-5 px-6 pb-6 pt-7">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader
              className="size-16"
              label={a.runtimeUpdating(state?.bundledVersion, progress)}
              type="lemniscate-bloom"
            />
            <DialogTitle className="text-center text-xl">
              {a.runtimeUpdating(state?.bundledVersion, progress)}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">{a.installing}</DialogDescription>
          </div>
          <Progress aria-label={a.installing} size="lg" value={progress / 100} />
          <p className="text-center text-xs text-muted-foreground">{u.applyingClose}</p>
        </div>
      )
    }

    if (state?.error) {
      return (
        <div className="grid gap-5 px-6 pb-6 pt-7">
          <div className="text-center">
            <DialogTitle className="text-xl">{u.errorTitle}</DialogTitle>
            <DialogDescription className="mt-2 text-sm">{state.error}</DialogDescription>
          </div>
          <div className="grid gap-2">
            <Button onClick={onUpdate} size="lg">
              {u.tryAgain}
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="text">
              {u.done}
            </Button>
          </div>
        </div>
      )
    }

    if (!state?.updateAvailable) {
      return (
        <div className="grid gap-5 px-6 pb-6 pt-7 text-center">
          <BrandMark className="mx-auto size-16" />
          <DialogTitle className="text-xl">{a.onLatest}</DialogTitle>
          <Button onClick={() => onOpenChange(false)} size="lg" variant="secondary">
            {u.done}
          </Button>
        </div>
      )
    }

    return (
      <div className="grid gap-5 px-6 pb-6 pt-7 pr-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-16" />
          <DialogTitle className="text-center text-xl">
            {a.runtimeUpdateReady(state.installedVersion, state.bundledVersion)}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">{a.runtimeChanges}</DialogDescription>
        </div>
        {notes.length > 0 ? (
          <ul className="grid gap-1.5 text-xs text-foreground">
            {notes.map(note => (
              <li className="flex items-start gap-2" key={note}>
                <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-primary" />
                <span className="leading-snug">{note}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xs text-muted-foreground">{a.runtimeNoNotes}</p>
        )}
        <div className="grid gap-2">
          <Button className="font-semibold" onClick={onUpdate} size="lg">
            {a.updateNow}
          </Button>
          <Button className="font-medium" onClick={() => onOpenChange(false)} variant="text">
            {u.maybeLater}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent bodyClassName="overflow-hidden p-0 gap-0" className="max-w-sm" showCloseButton={!applying}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
