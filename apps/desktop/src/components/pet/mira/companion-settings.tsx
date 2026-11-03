import { useStore } from '@nanostores/react'

import { ListRow, ToggleRow } from '@/app/settings/primitives'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useI18n } from '@/i18n'
import { miraCopyForLocale } from '@/i18n/mira-pet'
import { $displayPetInfo } from '@/store/pet'
import { PET_SCALE_MAX, PET_SCALE_MIN } from '@/store/pet-gallery'
import { $petPersonalization, openMiraWardrobe, savePetPersonalization } from '@/store/pet-personalization'

import { MiraSprite } from './mira-sprite'

export function MiraCompanionSettings() {
  const { locale, t } = useI18n()
  const copy = miraCopyForLocale(locale)
  const personal = useStore($petPersonalization)
  const info = useStore($displayPetInfo)
  const enabled = personal.mode === 'mira'

  function renderControls() {
    return (
      <div className="min-w-0 flex-1">
        <ToggleRow
          checked={enabled}
          description={copy.intro}
          label={copy.enabled}
          onChange={on => savePetPersonalization({ mode: on ? 'mira' : 'off' })}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={openMiraWardrobe} type="button" variant="secondary">
            {copy.customize}
          </Button>
          {!enabled && (
            <Button onClick={() => savePetPersonalization({ mode: 'mira' })} type="button" variant="ghost">
              {copy.useMira}
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-(--ui-text-tertiary)">{copy.gestureHint}</p>
        <p className="mt-1 text-xs text-(--ui-text-tertiary)">{copy.legacy}</p>
      </div>
    )
  }

  function renderScale() {
    return (
      <ListRow
        action={
          <div className="flex items-center gap-3">
            <Slider
              aria-label={t.settings.appearance.pet.scaleTitle}
              max={PET_SCALE_MAX}
              min={PET_SCALE_MIN}
              onChange={event => savePetPersonalization({ scale: Number(event.target.value) })}
              step={0.05}
              value={personal.scale}
            />
            <span className="w-9 text-right text-xs tabular-nums">{Math.round(personal.scale * 100)}%</span>
          </div>
        }
        description={t.settings.appearance.pet.scaleDesc}
        title={t.settings.appearance.pet.scaleTitle}
      />
    )
  }

  return (
    <section className="my-5">
      <div className="flex items-center gap-6">
        {enabled && (
          <div className="hidden shrink-0 sm:block">
            <MiraSprite info={{ ...info, scale: 0.5 }} stateOverride="idle" />
          </div>
        )}
        {renderControls()}
      </div>
      {enabled && renderScale()}
    </section>
  )
}
