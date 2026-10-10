import { fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FILE_GENERATION_TAG, stripFileGenerationTags, taggedFilePrompt } from './file-generation-tag'
import { composerPlainText, renderComposerContents, RICH_INPUT_SLOT } from './rich-editor'

function editorWithPrompt() {
  const editor = document.createElement('div')
  editor.dataset.slot = RICH_INPUT_SLOT
  editor.contentEditable = 'true'
  renderComposerContents(editor, taggedFilePrompt('制作演示文稿\n包含预算表'))

  return editor
}

describe('file generation tag', () => {
  it('restores a removable tag alongside editable prompt text and sends only the prompt', () => {
    const editor = editorWithPrompt()
    expect(editor.querySelector('[data-file-generation-tag]')).not.toBeNull()
    expect(editor.textContent).toContain('制作演示文稿')
    const serialized = composerPlainText(editor)
    expect(serialized).toBe(taggedFilePrompt('制作演示文稿\n包含预算表'))
    expect(stripFileGenerationTags(serialized)).toBe('制作演示文稿\n包含预算表')
    renderComposerContents(editor, serialized)
    expect(editor.querySelectorAll('[data-file-generation-tag]')).toHaveLength(1)
  })

  it('removes the tag without changing prompt text and publishes the edited draft', () => {
    const editor = editorWithPrompt()
    let edits = 0
    editor.addEventListener('input', () => {
      edits += 1
    })
    fireEvent.click(editor.querySelector('button')!)
    expect(editor.querySelector('[data-file-generation-tag]')).toBeNull()
    expect(composerPlainText(editor).trim()).toBe('制作演示文稿\n包含预算表')
    expect(edits).toBe(1)
    expect(stripFileGenerationTags(composerPlainText(editor))).not.toContain(FILE_GENERATION_TAG)
  })

  it('preserves ordinary submitted messages byte for byte', () => {
    expect(stripFileGenerationTags('  普通消息\n')).toBe('  普通消息\n')
  })
})
