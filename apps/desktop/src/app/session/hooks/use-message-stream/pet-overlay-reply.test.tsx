import { act, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { type PetOverlayStatePayload, popInPet, popOutPet } from '@/store/pet-overlay'

import { renderMessageStream } from './test-harness'

afterEach(() => {
  popInPet()
  cleanup()
  vi.unstubAllGlobals()
})

it('sends the settled text of the foreground turn to the open pet and leaves other turns private', async () => {
  const pushState = vi.fn<(state: PetOverlayStatePayload) => void>()
  vi.stubGlobal('hermesDesktop', { petOverlay: { open: async () => ({}), close: vi.fn(), pushState } })
  const stream = renderMessageStream('active')
  await act(async () => popOutPet({ x: 0, y: 0, height: 80, width: 80 }))

  act(() => {
    stream.handleEvent({ session_id: 'other', type: 'message.complete', payload: { text: 'Other thread' } })
    stream.handleEvent({ session_id: 'active', type: 'message.start', payload: {} })
    stream.handleEvent({ session_id: 'active', type: 'message.delta', payload: { text: 'Partial' } })
  })
  expect(pushState.mock.calls.flatMap(([state]) => state.reply || [])).toEqual([])

  act(() =>
    stream.handleEvent({
      session_id: 'active',
      type: 'message.complete',
      payload: { status: 'complete', text: 'Final answer' }
    })
  )
  expect(pushState.mock.calls.flatMap(([state]) => state.reply || [])).toEqual(['Final answer'])
})
