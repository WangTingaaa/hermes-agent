import { expect, it } from 'vitest'

import type { ChatMessage } from '@/lib/chat-messages'

import { desktopOperation } from './operation'

function messages(
  events: Array<{
    args: { action?: string; app?: string; coordinate?: number[]; element?: number; command?: string }
    result?: unknown
    toolName?: string
  }>
): ChatMessage[] {
  return [
    {
      id: 'm',
      role: 'assistant',
      parts: events.map((event, index) => ({
        type: 'tool-call',
        toolName: event.toolName || 'computer_use',
        toolCallId: String(index),
        argsText: '',
        ...event
      }))
    }
  ]
}

it('follows the captured window and scales background click coordinates without moving the OS cursor', () => {
  const operation = desktopOperation(
    messages([
      {
        args: { action: 'capture', app: 'Notes' },
        result: { width: 800, height: 600, window_title: 'New note', bounds_scale: 2 }
      },
      { args: { action: 'click', coordinate: [800, 600] } }
    ])
  )

  expect(operation.target).toEqual({ app: 'Notes', windowTitle: 'New note' })
  expect(operation.pointer).toMatchObject({ x: 0.5, y: 0.5, action: 'click' })

  const switched = desktopOperation(
    messages([
      { args: { action: 'capture', app: 'Notes' }, result: { width: 800, height: 600 } },
      { args: { action: 'click', app: 'Safari', coordinate: [100, 100] } }
    ])
  )

  expect(switched.target.app).toBe('Safari')
  expect(switched.pointer).toBeUndefined()
})

it('resolves element targets from actual multimodal captures and follows explicit AppleScript applications', () => {
  const operation = desktopOperation(
    messages([
      {
        args: { action: 'capture', app: 'Notes' },
        result: {
          meta: { width: 800, height: 600 },
          text_summary:
            "capture mode=som 800x600 app=Notes window='New note'\n  #7 AXButton 'Save' @ (100, 200, 80, 40) [Notes]"
        }
      },
      { args: { action: 'click', element: 7 } }
    ])
  )

  expect(operation.pointer).toMatchObject({ x: 140 / 800, y: 220 / 600 })

  const scripted = desktopOperation(
    messages([
      { toolName: 'terminal', args: { command: 'osascript -e \'tell application "Notes" to make new note\'' } }
    ])
  )

  expect(scripted.target.app).toBe('Notes')
  expect(scripted.pointer).toBeUndefined()
  expect(desktopOperation(messages([{ args: { action: 'click', coordinate: [10, 20] } }])).pointer).toBeUndefined()
})

it('never reuses a window from a previous user turn for greetings or unrelated tools', () => {
  const history = messages([{ args: { action: 'capture', app: 'Notes' }, result: { width: 800, height: 600 } }])
  history.push({ id: 'hello', role: 'user', parts: [{ type: 'text', text: '你好' }] })
  history.push(...messages([{ toolName: 'terminal', args: { command: 'pwd' } }]))
  expect(desktopOperation(history).target).toEqual({ app: '', windowTitle: '' })
  expect(desktopOperation(history).pointer).toBeUndefined()
  history.push(
    ...messages([{ toolName: 'terminal', args: { command: 'open -a "Google Chrome" "https://example.com"' } }])
  )
  expect(desktopOperation(history).target.app).toBe('Google Chrome')
})

it('follows the most recent explicit application and displays actual browser screenshot receipts', () => {
  const events = messages([
    {
      toolName: 'terminal',
      args: {
        command: 'osascript -e \'tell application "Notes" to activate\'\nopen -a "Google Chrome" https://example.com'
      }
    }
  ])

  expect(desktopOperation(events).target.app).toBe('Google Chrome')
  events.push(
    ...messages([
      {
        toolName: 'browser_exec',
        args: {},
        result: {
          _multimodal: true,
          content: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,real-frame' } }]
        }
      }
    ])
  )
  const operation = desktopOperation(events)
  expect(operation.target.app).toBe('')
  expect(operation.frame?.image).toBe('data:image/png;base64,real-frame')
})
