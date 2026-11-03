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
    const onPickCloudFile = vi.fn()
    const onUploadCloudFile = vi.fn()

    render(
      <I18nProvider configClient={null} initialLocale="en">
        <ContextMenu
          onInsertText={vi.fn()}
          onOpenUrlDialog={vi.fn()}
          onPickCloudFile={onPickCloudFile}
          onUploadCloudFile={onUploadCloudFile}
          state={state}
        />
      </I18nProvider>
    )

    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })
    fireEvent.click(await screen.findByText('Reference cloud file'))

    expect(onPickCloudFile).toHaveBeenCalledOnce()

    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })
    fireEvent.click(await screen.findByText('Upload cloud file'))

    expect(onUploadCloudFile).toHaveBeenCalledOnce()
  })

  it('opens host file generation from the row below prompt snippets', async () => {
    const onGenerateFile = vi.fn()
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <ContextMenu onGenerateFile={onGenerateFile} onInsertText={vi.fn()} onOpenUrlDialog={vi.fn()} state={state} />
      </I18nProvider>
    )
    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })
    const generateFile = await screen.findByText('生成文件')
    expect(screen.getByText('提示词片段…').closest('[role="menuitem"]')?.nextElementSibling).toBe(
      generateFile.closest('[role="menuitem"]')
    )
    fireEvent.click(generateFile)
    expect(onGenerateFile).toHaveBeenCalledOnce()
  })

  it('uses the requested Chinese cloud file labels', async () => {
    render(
      <I18nProvider configClient={null} initialLocale="zh">
        <ContextMenu
          onInsertText={vi.fn()}
          onOpenUrlDialog={vi.fn()}
          onPickCloudFile={vi.fn()}
          onUploadCloudFile={vi.fn()}
          state={state}
        />
      </I18nProvider>
    )
    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })
    expect(await screen.findByText('上传云端文件')).toBeTruthy()
    expect(screen.getByText('引用云端文件')).toBeTruthy()
  })

  it('hides the host-only option when the cloud bridge is unavailable', () => {
    render(
      <I18nProvider configClient={null} initialLocale="en">
        <ContextMenu onInsertText={vi.fn()} onOpenUrlDialog={vi.fn()} state={state} />
      </I18nProvider>
    )

    fireEvent.pointerDown(screen.getByLabelText('Add context'), { button: 0, ctrlKey: false })

    expect(screen.queryByText('Reference cloud file')).toBeNull()
    expect(screen.queryByText('Upload cloud file')).toBeNull()
    expect(screen.queryByText('Generate file…')).toBeNull()
  })
})
