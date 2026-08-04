import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ChatBarState } from '@/app/chat/composer/types'
import { I18nProvider } from '@/i18n'

import { ContextMenu } from './context-menu'

vi.mock('./contrib', () => ({ useComposerAttachmentProviders: () => [] }))

const state: ChatBarState = {
  model: { canSwitch: false, model: '', provider: '' },
  tools: { enabled: true, label: 'Add context' },
  voice: { active: false, enabled: false }
}

afterEach(() => cleanup())

describe('composer Add context menu', () => {
  it('offers cloud reference and local-upload flows with the other attachment sources', async () => {
    const onPickCloudFavorite = vi.fn()
    const onUploadCloudFavorite = vi.fn()

    render(
      <I18nProvider configClient={null} initialLocale="en">
        <ContextMenu
          onInsertText={vi.fn()}
          onOpenUrlDialog={vi.fn()}
          onPickCloudFavorite={onPickCloudFavorite}
          onUploadCloudFavorite={onUploadCloudFavorite}
          state={state}
        />
      </I18nProvider>
    )

    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })
    fireEvent.click(await screen.findByText('引用收藏文件'))

    expect(onPickCloudFavorite).toHaveBeenCalledOnce()

    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })
    fireEvent.click(await screen.findByText('上传收藏文件'))

    expect(onUploadCloudFavorite).toHaveBeenCalledOnce()
  })

  it('hides the host-only option when the cloud bridge is unavailable', () => {
    render(
      <I18nProvider configClient={null} initialLocale="en">
        <ContextMenu onInsertText={vi.fn()} onOpenUrlDialog={vi.fn()} state={state} />
      </I18nProvider>
    )

    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })

    expect(screen.queryByText('引用收藏文件')).toBeNull()
    expect(screen.queryByText('上传收藏文件')).toBeNull()
  })
})
