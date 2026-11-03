import type { PetInfo, PetState } from '@/store/pet'
import type { MiraEmotion } from '@/store/pet-personalization/type'

export interface MiraSpriteProps {
  info: PetInfo
  zoom?: number
  stateOverride?: PetState
  pauseWhenUnfocused?: boolean
}

export interface MiraPose {
  emotion: MiraEmotion
  rotation: number
  lift: number
  stretch: number
}
