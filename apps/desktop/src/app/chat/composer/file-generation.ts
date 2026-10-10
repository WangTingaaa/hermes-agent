import { useEffect, useRef } from 'react'

import { useI18n } from '@/i18n'
import { stashSessionDraft, takeSessionDraft } from '@/store/composer'
import { notify } from '@/store/notifications'

import { liveComposerDraft } from './composer-utils'
import { stripFileGenerationTags, taggedFilePrompt } from './file-generation-tag'
import type { FileGenerationOptions } from './type'

export function useFileGeneration({ draftRef, editorRef, insertText, scopeRef }: FileGenerationOptions) {
  const { t } = useI18n()
  const mountedRef = useRef(true)

  // eslint-disable-next-line no-restricted-syntax -- component lifecycle flag, not a mirrored atom
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])
  const bridge = window.hermesDesktop?.fileGeneration

  if (!bridge) {
    return undefined
  }

  return async () => {
    const scope = scopeRef.current

    try {
      const prompt = await bridge.open({
        initialMarkdown: stripFileGenerationTags(liveComposerDraft(editorRef.current, draftRef.current))
      })

      if (!prompt) {
        return
      }

      // The host dialog may outlive a session switch. Keep its result with the draft that opened it.
      if (!mountedRef.current || scopeRef.current !== scope) {
        const draft = takeSessionDraft(scope)
        stashSessionDraft(scope, [draft.text, taggedFilePrompt(prompt)].filter(Boolean).join('\n\n'), draft.attachments)

        return
      }

      insertText(taggedFilePrompt(prompt))
    } catch (error) {
      notify({
        kind: 'error',
        title: t.composer.generateFile,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
}
