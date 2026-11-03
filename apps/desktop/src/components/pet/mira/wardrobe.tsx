import './wardrobe.css'

import { useStore } from '@nanostores/react'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { miraCopyForLocale } from '@/i18n/mira-pet'
import { Check } from '@/lib/icons'
import { cn } from '@/lib/utils'
import {
  $miraWardrobeOpen,
  $petPersonalization,
  MIRA_DEFAULTS,
  MIRA_EMOTIONS,
  MIRA_OUTFITS,
  miraAtlasUrl,
  savePetPersonalization
} from '@/store/pet-personalization'
import type { MiraEmotion } from '@/store/pet-personalization/type'

import { MiraSprite } from './mira-sprite'

function MiraWardrobeDialog() {
  const { locale } = useI18n()
  const copy = miraCopyForLocale(locale)
  const [draft, setDraft] = useState(() => ({ ...$petPersonalization.get() }))
  const id = useId()
  const validName = draft.name.trim().length > 0 && draft.name.trim().length <= 24
  const handleClose = () => $miraWardrobeOpen.set(false)

  function handleSave(event: React.FormEvent) {
    event.preventDefault()

    if (!validName) {
      return
    }

    savePetPersonalization({ ...draft, mode: 'mira' })
    handleClose()
  }

  function renderPreview() {
    return (
      <div className="mira-wardrobe__preview">
        <div aria-hidden className="mira-wardrobe__halo" />
        <MiraSprite
          info={{
            enabled: true,
            displayName: draft.name.trim() || 'Mira',
            assetUrl: miraAtlasUrl(draft.outfit),
            mira: draft,
            frameW: 240,
            frameH: 288,
            scale: 1
          }}
          stateOverride="idle"
        />
        <Tip label={draft.name.trim() || 'Mira'}>
          <span className="mira-wardrobe__name" tabIndex={0}>
            {draft.name.trim() || 'Mira'}
          </span>
        </Tip>
        <span className="mira-wardrobe__caption">
          {draft.emotion === 'auto' ? copy.auto : copy.emotion[draft.emotion]}
        </span>
      </div>
    )
  }

  function renderName() {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor={id}>
          {copy.name}
        </label>
        <Input
          aria-describedby={`${id}-hint`}
          aria-invalid={!validName}
          autoComplete="off"
          id={id}
          maxLength={24}
          onChange={event => setDraft({ ...draft, name: event.target.value })}
          value={draft.name}
        />
        <p className={cn('mira-wardrobe__caption', !validName && 'text-destructive')} id={`${id}-hint`}>
          {copy.nameHint}
        </p>
      </div>
    )
  }

  function renderOutfits() {
    return (
      <fieldset className="min-w-0 space-y-3">
        <legend className="text-xs font-medium">{copy.outfits}</legend>
        <div className="mira-wardrobe__outfits">
          {MIRA_OUTFITS.map(outfit => (
            <Tip key={outfit} label={copy.outfit[outfit]}>
              <button
                aria-pressed={draft.outfit === outfit}
                className="mira-wardrobe__outfit"
                onClick={() => setDraft({ ...draft, outfit })}
                type="button"
              >
                <span
                  aria-hidden
                  className="mira-wardrobe__outfit-art"
                  style={{ backgroundImage: `url("${miraAtlasUrl(outfit)}")` }}
                />
                <span className="truncate">{copy.outfit[outfit]}</span>
                {draft.outfit === outfit && <Check aria-hidden className="mira-wardrobe__check size-3.5" />}
              </button>
            </Tip>
          ))}
        </div>
      </fieldset>
    )
  }

  function renderEmotions() {
    const emotions: Array<MiraEmotion | 'auto'> = ['auto', ...MIRA_EMOTIONS]

    return (
      <fieldset className="min-w-0 space-y-3">
        <legend className="text-xs font-medium">{copy.emotions}</legend>
        <div className="mira-wardrobe__emotions">
          {emotions.map(emotion => (
            <Button
              aria-pressed={draft.emotion === emotion}
              key={emotion}
              onClick={() => setDraft({ ...draft, emotion })}
              size="sm"
              type="button"
              variant={draft.emotion === emotion ? 'secondary' : 'ghost'}
            >
              {emotion === 'auto' ? copy.auto : copy.emotion[emotion]}
            </Button>
          ))}
        </div>
        <p className="mira-wardrobe__caption">{copy.autoHint}</p>
      </fieldset>
    )
  }

  function renderFooter() {
    return (
      <DialogFooter className="mira-wardrobe__footer">
        <Button onClick={() => setDraft({ ...MIRA_DEFAULTS })} type="button" variant="ghost">
          {copy.reset}
        </Button>
        <span className="flex-1" />
        <Button onClick={handleClose} type="button" variant="ghost">
          {copy.cancel}
        </Button>
        <Button disabled={!validName} type="submit">
          {copy.done}
        </Button>
      </DialogFooter>
    )
  }

  return (
    <Dialog
      onOpenChange={open => {
        if (!open) {
          handleClose()
        }
      }}
      open
    >
      <DialogContent bodyClassName="mira-wardrobe__body" className="mira-wardrobe">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.intro}</DialogDescription>
          </DialogHeader>
          <div className="mira-wardrobe__layout">
            {renderPreview()}
            <div className="mira-wardrobe__controls">
              {renderName()}
              {renderOutfits()}
              {renderEmotions()}
            </div>
          </div>
          <p className="mira-wardrobe__caption mira-wardrobe__hint">{copy.gestureHint}</p>
          {renderFooter()}
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MiraWardrobeHost() {
  const open = useStore($miraWardrobeOpen)

  return open ? <MiraWardrobeDialog /> : null
}
