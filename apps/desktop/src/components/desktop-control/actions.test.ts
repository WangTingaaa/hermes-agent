import { expect, it } from 'vitest'

import type { ChatMessage } from '@/lib/chat-messages'

import { desktopActions } from './actions'

it('uses actual tool receipts, masks input and distinguishes transport from confirmed effect', () => {
  const messages: ChatMessage[] = [
    {
      id: 'm',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'I clicked and completed everything.' },
        {
          type: 'tool-call',
          toolCallId: 'a',
          toolName: 'computer_use',
          args: { action: 'type', text: 'secret-password' },
          argsText: '',
          timestamp: 1,
          completedAt: 2,
          result: { ok: true }
        },
        {
          type: 'tool-call',
          toolCallId: 'b',
          toolName: 'computer_use',
          args: { action: 'click' },
          argsText: '',
          timestamp: 2,
          completedAt: 3,
          result: { verified: true }
        },
        {
          type: 'tool-call',
          toolCallId: 'c',
          toolName: 'computer_use',
          args: { action: 'click' },
          argsText: '',
          result: { ok: false }
        }
      ]
    }
  ]

  const actions = desktopActions(messages)
  expect(actions.map(action => action.status)).toEqual(['unconfirmed', 'success', 'failed'])
  expect(actions[0].duration).toBe(1)
  expect(JSON.stringify(actions)).not.toContain('secret-password')
  expect(JSON.stringify(actions)).not.toContain('completed everything')
})
