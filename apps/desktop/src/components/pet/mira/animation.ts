import type { PetState } from '@/store/pet'
import type { MiraAppearance, MiraEmotion } from '@/store/pet-personalization/type'

import type { MiraPose } from './type'

export const MIRA_CELLS: Record<MiraEmotion, readonly [number, number]> = {
  smile: [0, 0],
  cute: [1, 0],
  angry: [0, 1],
  bored: [1, 1]
}

const ACTIVITY_EMOTIONS: Record<PetState, MiraEmotion> = {
  idle: 'smile',
  wave: 'smile',
  run: 'smile',
  jump: 'cute',
  failed: 'angry',
  review: 'bored',
  waiting: 'bored'
}

export function miraPose(
  state: PetState,
  emotion: MiraAppearance['emotion'],
  elapsed: number,
  reducedMotion: boolean
): MiraPose {
  const automatic = state === 'idle' && elapsed % 24000 > 16000 ? 'bored' : ACTIVITY_EMOTIONS[state]
  const selected = emotion === 'auto' ? automatic : emotion

  if (reducedMotion) {
    return { emotion: selected, rotation: 0, lift: 0, stretch: 1 }
  }

  const beat = elapsed / 1000

  const poses: Record<MiraEmotion, Omit<MiraPose, 'emotion'>> = {
    smile: { rotation: Math.sin(beat * 1.6) * 0.012, lift: 0, stretch: 1 + Math.sin(beat * 2) * 0.008 },
    cute: { rotation: Math.sin(beat * 4) * 0.035, lift: Math.abs(Math.sin(beat * 3)) * 0.035, stretch: 1 },
    angry: { rotation: Math.sin(beat * 9) * 0.018, lift: 0, stretch: 1 },
    bored: { rotation: Math.sin(beat * 0.8) * 0.025, lift: 0, stretch: 1 + Math.sin(beat) * 0.006 }
  }

  const pose = poses[selected]

  return {
    emotion: selected,
    ...pose,
    lift: state === 'run' && emotion === 'auto' ? Math.abs(Math.sin(beat * 7)) * 0.025 : pose.lift
  }
}
