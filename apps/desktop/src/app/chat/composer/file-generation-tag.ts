import { directiveIconElement } from '@/components/assistant-ui/directive-text'
import { translateNow } from '@/i18n'

// Draft-only metadata: keep the tag through restore/undo and remove it before submission.
export const FILE_GENERATION_TAG = '@mira-file-generation:`1`'

export function taggedFilePrompt(prompt: string) {
  return `${FILE_GENERATION_TAG} ${prompt}`
}

export function stripFileGenerationTags(text: string) {
  return text.includes(FILE_GENERATION_TAG) ? text.replaceAll(FILE_GENERATION_TAG, '').trim() : text
}

export function fileGenerationTagSpans(text: string) {
  return Array.from(text.matchAll(/@mira-file-generation:`1`/g)).map(match => ({
    start: match.index,
    end: match.index + match[0].length,
    node: fileGenerationTagElement
  }))
}

function fileGenerationTagElement() {
  const label = translateNow('composer.generateFile').replace(/…$/, '')
  const chip = document.createElement('span')
  chip.contentEditable = 'false'
  chip.className = 'ref'
  chip.dataset.ref = 'file'
  chip.dataset.refText = FILE_GENERATION_TAG
  chip.dataset.fileGenerationTag = ''
  chip.title = label

  const name = document.createElement('span')
  name.className = 'max-w-40 truncate'
  name.textContent = label

  const remove = document.createElement('button')
  remove.type = 'button'
  remove.className =
    'ml-1 inline-flex size-4 items-center justify-center rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-2'
  remove.textContent = '×'
  remove.setAttribute('aria-label', translateNow('composer.removeAttachment', label))
  remove.title = remove.getAttribute('aria-label') || label
  remove.onmousedown = event => event.preventDefault()
  remove.onkeydown = event => event.stopPropagation()

  remove.onclick = event => {
    event.stopPropagation()
    const editor = chip.closest<HTMLElement>('[data-slot="composer-rich-input"]')
    chip.remove()
    editor?.dispatchEvent(new Event('input', { bubbles: true }))
    editor?.focus()
  }

  chip.append(directiveIconElement('file'), name, remove)

  return chip
}
