import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n'

import { Dialog, DialogContent, DialogTitle } from './dialog'

afterEach(cleanup)

describe('DialogContent close button', () => {
  it('closes the dialog when clicked', () => {
    const onOpenChange = vi.fn()
    render(
      <I18nProvider configClient={null} initialLocale="en">
        <Dialog onOpenChange={onOpenChange} open>
          <DialogContent>
            <DialogTitle>Test dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      </I18nProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
