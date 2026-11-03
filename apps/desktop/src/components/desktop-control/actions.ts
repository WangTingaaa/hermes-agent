import type { ChatMessage } from '@/lib/chat-messages'
import { toolResultRecord } from '@/lib/tool-result-metadata'

import type { DesktopAction } from './type'

const TOOLS = new Set(['computer_use', 'browser_exec', 'terminal', 'vision_analyze'])

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}

// Only structured tool events qualify. Never infer actions from assistant prose,
// expose typed credentials, or retain raw terminal/browser programs in this log.
export function desktopActions(messages: readonly ChatMessage[]): DesktopAction[] {
  const actions: DesktopAction[] = []

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== 'tool-call' || !TOOLS.has(part.toolName) || !part.toolCallId) {continue}
      const args = record(part.args)
      const result = toolResultRecord(part)
      const error = result.error
      const failed = part.isError || result.ok === false || result.success === false || Boolean(error)
      const complete = part.completedAt !== undefined || part.result !== undefined
      const confirmed = result.verified === true || result.effect === 'confirmed'
      actions.push({
        id: part.toolCallId,
        name: typeof args.action === 'string' ? args.action : part.toolName,
        app: typeof args.app === 'string' ? args.app : '',
        status: failed ? 'failed' : !complete ? 'running' : confirmed ? 'success' : 'unconfirmed',
        startedAt: part.timestamp,
        duration:
          part.timestamp !== undefined && part.completedAt !== undefined
            ? Math.max(0, part.completedAt - part.timestamp)
            : undefined,
        error: failed ? 'Tool execution failed; inspect the original tool result in the conversation.' : undefined
      })
    }
  }

  return actions.slice(-80)
}
