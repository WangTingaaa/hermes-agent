import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { OfficePreview } from './index'

vi.mock('@/lib/media', () => ({ downloadGatewayFileWithFeedback: vi.fn() }))
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: {
      preview: { loading: 'Loading', unavailable: 'Unavailable', openPreview: 'Preview' },
      fileMenu: { download: 'Download' }
    }
  })
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test('office preview exposes native preview and preserves the owner across the bridge', async () => {
  const preview = vi.fn().mockResolvedValue({ opened: true })
  vi.stubGlobal('hermesDesktop', { previewGatewayFile: preview })
  render(
    <OfficePreview owner={{ connectionId: 'local', profile: 'writer' }} path="/work/slides.pptx" title="slides.pptx" />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
  await waitFor(() =>
    expect(preview).toHaveBeenCalledWith({ path: '/work/slides.pptx', connectionId: 'local', profile: 'writer' })
  )
  expect(screen.getByRole('button', { name: 'Download' })).toBeTruthy()
})
