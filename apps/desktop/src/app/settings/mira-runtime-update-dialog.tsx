import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Loader } from '@/components/ui/loader'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'

import type { MiraRuntimeUpdateDialogProps } from './type'

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

  const renderApplying = () => (
    <div className="grid gap-5 px-6 pb-6 pt-7">
      <div className="flex shrink-0 flex-col items-center gap-3 text-center">
        <Loader
          className="size-16"
          label={a.runtimeUpdating(state?.bundledVersion, progress)}
          type="lemniscate-bloom"
        />
        <DialogTitle className="text-center text-xl">{a.runtimeUpdating(state?.bundledVersion, progress)}</DialogTitle>
        <DialogDescription className="text-center text-sm">{a.installing}</DialogDescription>
      </div>
      <Progress aria-label={a.installing} size="lg" value={progress / 100} />
      <p className="text-center text-xs text-muted-foreground">{u.applyingClose}</p>
    </div>
  )

  const renderError = () => (
    <div className="grid gap-5 px-6 pb-6 pt-7">
      <div className="text-center">
        <DialogTitle className="text-xl">{u.errorTitle}</DialogTitle>
        <DialogDescription className="mt-2 text-sm">{state?.error}</DialogDescription>
      </div>
      <div className="grid shrink-0 gap-2">
        <Button onClick={onUpdate} size="lg">
          {u.tryAgain}
        </Button>
        <Button onClick={() => onOpenChange(false)} variant="text">
          {u.done}
        </Button>
      </div>
    </div>
  )

  const renderLatest = () => (
    <div className="grid gap-5 px-6 pb-6 pt-7 text-center">
      <BrandMark className="mx-auto size-16" />
      <DialogTitle className="text-xl">{a.onLatest}</DialogTitle>
      <Button onClick={() => onOpenChange(false)} size="lg" variant="secondary">
        {u.done}
      </Button>
    </div>
  )

  const renderUpdate = () => (
    <div className="flex min-h-0 flex-col gap-5 px-6 pb-6 pt-7">
      <div className="flex shrink-0 flex-col items-center gap-3 text-center">
        <BrandMark className="size-16" />
        <DialogTitle className="text-center text-xl">
          {a.runtimeUpdateReady(state?.installedVersion, state?.bundledVersion)}
        </DialogTitle>
        <DialogDescription className="text-center text-sm">{a.runtimeChanges}</DialogDescription>
      </div>
      {notes.length > 0 ? (
        <div
          aria-label={a.runtimeChanges}
          className="grid min-h-0 min-w-0 max-h-[50dvh] grid-cols-[minmax(0,1fr)] gap-1.5 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 text-xs text-foreground [scrollbar-gutter:stable]"
          role="region"
          tabIndex={0}
        >
          <ul className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5">
            {notes.map(note => (
              <li className="flex min-w-0 items-start gap-2" key={note}>
                <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug [overflow-wrap:anywhere]">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">{a.runtimeNoNotes}</p>
      )}
      <div className="grid shrink-0 gap-2">
        <Button className="font-semibold" onClick={onUpdate} size="lg">
          {a.updateNow}
        </Button>
        <Button className="font-medium" onClick={() => onOpenChange(false)} variant="text">
          {u.maybeLater}
        </Button>
      </div>
    </div>
  )

  const renderContent = () => {
    if (applying) {return renderApplying()}

    if (state?.error) {return renderError()}

    if (!state?.updateAvailable) {return renderLatest()}

    return renderUpdate()
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        bodyClassName="flex min-h-0 flex-col overflow-y-auto p-0 gap-0"
        className="w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100dvh-2rem)]"
        showCloseButton={!applying}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
