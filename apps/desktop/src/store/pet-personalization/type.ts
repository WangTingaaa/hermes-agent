export type MiraOutfit = 'classic' | 'starlight' | 'courier'
export type MiraEmotion = 'smile' | 'cute' | 'angry' | 'bored'

export interface MiraAppearance {
  outfit: MiraOutfit
  emotion: MiraEmotion | 'auto'
}

export interface PetPersonalization extends MiraAppearance {
  name: string
  mode: 'mira' | 'gateway' | 'off'
  scale: number
}
