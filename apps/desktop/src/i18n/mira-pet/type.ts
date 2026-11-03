import type { MiraEmotion, MiraOutfit } from '@/store/pet-personalization/type'

export interface MiraPetCopy {
  title: string
  intro: string
  customize: string
  customizeName: string
  enabled: string
  name: string
  nameHint: string
  outfits: string
  emotions: string
  auto: string
  autoHint: string
  gestureHint: string
  reset: string
  cancel: string
  done: string
  legacy: string
  useMira: string
  outfit: Record<MiraOutfit, string>
  emotion: Record<MiraEmotion, string>
}
