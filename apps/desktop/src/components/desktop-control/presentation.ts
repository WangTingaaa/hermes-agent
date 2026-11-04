import type { ChatMessage } from '@/lib/chat-messages'

import { currentDesktopTurn } from './operation'
import type { DesktopCompletionCopy, DesktopTarget } from './type'

export function desktopCompletion(messages: readonly ChatMessage[], copy: DesktopCompletionCopy) {
  const turn = currentDesktopTurn(messages)
  const reply = turn.findLast(message => message.role === 'assistant')
  const failed = Boolean(reply?.error)
  const interrupted = Boolean(reply?.interrupted)
  const state = failed ? copy.failed : interrupted ? copy.ended : copy.completed

  const result = turn
    .findLast(
      message =>
        message.role === 'assistant' &&
        !message.interim &&
        message.parts.some(part => part.type === 'text' && part.text.trim())
    )
    ?.parts.flatMap(part => (part.type === 'text' ? [part.text] : []))
    .join('\n')

  return { failed, interrupted, state, result }
}

export function previewEmpty(local: boolean, error: string, target: DesktopTarget, zh: boolean) {
  if (!local) {
    return zh ? '当前连接不支持本地画面' : 'Local preview unavailable for this connection'
  }

  if (error) {
    return zh ? '无法预览 · 点击查看' : 'Preview unavailable · Open for details'
  }

  if (target.app) {
    return zh ? '等待操作窗口就绪' : 'Waiting for the operation window'
  }

  return zh ? '等待 Mira 操作窗口' : 'Waiting for Mira’s operation window'
}
