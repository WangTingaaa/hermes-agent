import { describe, expect, it } from 'vitest'

import { miraPose } from './animation'

describe('Mira reactions', () => {
  it('reacts to tasks, daydreams after idling, and supports explicit emotion selection', () => {
    expect(miraPose('idle', 'auto', 0, false).emotion).toBe('smile')
    expect(miraPose('idle', 'auto', 18000, false).emotion).toBe('bored')
    expect(miraPose('failed', 'auto', 0, false).emotion).toBe('angry')
    expect(miraPose('jump', 'auto', 0, false).emotion).toBe('cute')
    expect(miraPose('review', 'auto', 0, false).emotion).toBe('bored')
    expect(miraPose('idle', 'angry', 0, false).emotion).toBe('angry')
  })

  it('keeps expressions but removes all physical motion with reduced motion enabled', () => {
    expect(miraPose('jump', 'auto', 800, true)).toEqual({ emotion: 'cute', rotation: 0, lift: 0, stretch: 1 })
  })
})
