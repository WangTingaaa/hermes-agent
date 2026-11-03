import { afterEach, describe, expect, it, vi } from 'vitest'

import { $displayPetInfo, hasPetArt, setPetInfo } from '@/store/pet'
import { rankedGalleryPets, setPetScale } from '@/store/pet-gallery'
import { popInPet, popOutPet } from '@/store/pet-overlay'

import { $petPersonalization, MIRA_DEFAULTS, PET_PERSONALIZATION_KEY, savePetPersonalization } from './index'

afterEach(() => {
  popInPet()
  $petPersonalization.set({ ...MIRA_DEFAULTS })
  setPetInfo({ enabled: false })
  window.localStorage.removeItem(PET_PERSONALIZATION_KEY)
  delete (window as { hermesDesktop?: unknown }).hermesDesktop
})

describe('bundled Mira', () => {
  it('is available offline by default, survives gateway updates and honors explicit hiding', () => {
    $petPersonalization.set({ ...MIRA_DEFAULTS })
    setPetInfo({ enabled: false })
    expect($displayPetInfo.get().displayName).toBe('Mira')
    expect(hasPetArt($displayPetInfo.get())).toBe(true)
    setPetInfo({ enabled: true, displayName: 'Old pet', spritesheetBase64: 'old' })
    expect($displayPetInfo.get().displayName).toBe('Mira')
    savePetPersonalization({ mode: 'off' })
    expect($displayPetInfo.get().enabled).toBe(false)
    savePetPersonalization({ mode: 'gateway' })
    expect($displayPetInfo.get().displayName).toBe('Old pet')
    expect(
      rankedGalleryPets({
        enabled: false,
        active: '',
        pets: [
          { slug: 'old-mira', displayName: 'Mira', installed: true },
          { slug: 'boba', displayName: 'Boba', installed: true }
        ]
      }).map(pet => pet.slug)
    ).toEqual(['boba'])
  })

  it('scales locally and mirrors saved appearance and name to the desktop overlay', async () => {
    const request = vi.fn()

    const pushState = vi.fn()

    ;(window as { hermesDesktop?: unknown }).hermesDesktop = {
      petOverlay: { open: vi.fn(async () => ({ ok: true })), close: vi.fn(), pushState }
    }
    savePetPersonalization({ ...MIRA_DEFAULTS, name: '米拉', outfit: 'starlight', emotion: 'cute' })
    setPetScale(request, 0.9)
    expect(request).not.toHaveBeenCalled()
    expect($petPersonalization.get().scale).toBe(0.9)
    popOutPet({ x: 20, y: 20, width: 216, height: 260 })
    await Promise.resolve()
    expect(pushState.mock.lastCall?.[0].info).toMatchObject({
      displayName: '米拉',
      scale: 0.9,
      mira: { outfit: 'starlight', emotion: 'cute' }
    })
    savePetPersonalization({ outfit: 'courier' })
    expect(pushState.mock.lastCall?.[0].info.mira.outfit).toBe('courier')
  })
})
