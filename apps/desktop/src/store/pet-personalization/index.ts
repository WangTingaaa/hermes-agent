import { atom } from 'nanostores'

import { readJson, writeJson } from '@/lib/storage'

import type { MiraEmotion, PetPersonalization } from './type'

// The companion's wardrobe belongs to this device, across profiles and gateways.
// Gateway pets retain their own authoritative per-profile configuration.
export const PET_PERSONALIZATION_KEY = 'hermes.desktop.pet-personalization.global.v1'
export const MIRA_OUTFITS = ['classic', 'starlight', 'courier'] as const
export const MIRA_EMOTIONS = ['smile', 'cute', 'angry', 'bored'] as const
export const MIRA_DEFAULTS: PetPersonalization = {
  name: 'Mira',
  mode: 'off',
  outfit: 'classic',
  emotion: 'auto',
  scale: 0.75
}

export function normalizePetPersonalization(value: unknown): PetPersonalization {
  const saved = value && typeof value === 'object' ? (value as Partial<PetPersonalization>) : {}

  return {
    name: typeof saved.name === 'string' && saved.name.trim() ? saved.name.trim().slice(0, 24) : 'Mira',
    mode: saved.mode === 'gateway' || saved.mode === 'mira' ? saved.mode : MIRA_DEFAULTS.mode,
    outfit: MIRA_OUTFITS.includes(saved.outfit!) ? saved.outfit! : 'classic',
    emotion: MIRA_EMOTIONS.includes(saved.emotion as MiraEmotion) ? saved.emotion! : 'auto',
    scale:
      typeof saved.scale === 'number' && Number.isFinite(saved.scale)
        ? Math.max(0.1, Math.min(3, saved.scale))
        : MIRA_DEFAULTS.scale
  }
}

export const $petPersonalization = atom(normalizePetPersonalization(readJson(PET_PERSONALIZATION_KEY)))
export const $miraWardrobeOpen = atom(false)
export const $miraReaction = atom<MiraEmotion | null>(null)
let reactionTimer: ReturnType<typeof setTimeout> | undefined

export function savePetPersonalization(next: Partial<PetPersonalization>): void {
  const value = normalizePetPersonalization({ ...$petPersonalization.get(), ...next })
  clearTimeout(reactionTimer)
  $miraReaction.set(null)
  $petPersonalization.set(value)
  writeJson(PET_PERSONALIZATION_KEY, value)
}

export function reactWithMira(emotion: MiraEmotion = 'cute'): void {
  clearTimeout(reactionTimer)
  $miraReaction.set(emotion)
  reactionTimer = setTimeout(() => $miraReaction.set(null), 2400)
}

export const openMiraWardrobe = () => $miraWardrobeOpen.set(true)

export function miraAtlasUrl(outfit: PetPersonalization['outfit']): string {
  return `${import.meta.env.BASE_URL}pets/mira/${outfit}.webp`
}
