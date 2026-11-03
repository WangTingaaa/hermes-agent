import { useStore } from '@nanostores/react'

import { Button } from '@/components/ui/button'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { miraCopyForLocale } from '@/i18n/mira-pet'
import { Check } from '@/lib/icons'
import {
  $petPersonalization,
  miraAtlasUrl,
  openMiraWardrobe,
  savePetPersonalization
} from '@/store/pet-personalization'

export function MiraPaletteEntry() {
  const { locale } = useI18n()
  const copy = miraCopyForLocale(locale)
  const personal = useStore($petPersonalization)

  return (
    <div className="mb-2 flex min-w-0 items-center gap-2 px-2 py-1.5">
      <span
        aria-hidden
        className="h-12 w-10 shrink-0 bg-size-[200%_200%] bg-top-left bg-no-repeat"
        style={{ backgroundImage: `url("${miraAtlasUrl(personal.outfit)}")` }}
      />
      <Tip label={personal.name}>
        <button
          className="min-w-0 flex-1 truncate text-left text-xs font-medium"
          onClick={() => savePetPersonalization({ mode: 'mira' })}
          type="button"
        >
          {personal.name}
        </button>
      </Tip>
      {personal.mode === 'mira' && <Check aria-hidden className="size-3.5" />}
      <Button onClick={openMiraWardrobe} size="xs" type="button" variant="ghost">
        {copy.customize}
      </Button>
    </div>
  )
}
