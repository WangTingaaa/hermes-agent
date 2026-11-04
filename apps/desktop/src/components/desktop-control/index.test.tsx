import { act, fireEvent, render, screen } from '@testing-library/react'
import { atom } from 'nanostores'
import { expect, it, vi } from 'vitest'

import type { ChatMessage } from '@/lib/chat-messages'

vi.mock('@/app/chat/composer/scope', () => ({ useComposerScope: () => ({}) }))
vi.mock('@/components/pane-shell/pane-visibility', () => ({ usePaneVisible: () => true }))
vi.mock('@/store/gateway', () => ({ dialedGatewayModeFor: () => 'local' }))
vi.mock('@/store/profile', async () => ({ $activeGatewayProfile: (await import('nanostores')).atom('default') }))
vi.mock('@/store/session', async () => ({ $gatewayState: (await import('nanostores')).atom('open') }))
vi.mock('@/i18n', async () => {
  const { desktopControlCopy } = await import('@/i18n/desktop-control')

  return { useI18n: () => ({ locale: 'zh', t: { desktopControl: desktopControlCopy.zh, common: { close: '关闭' } } }) }
})
vi.mock('./use-operation-preview', () => ({
  useOperationPreview: () => ({
    frame: { image: 'data:image/png;base64,frame', name: 'New note', sourceId: 'window:42:0' },
    error: '',
    retry: vi.fn()
  })
}))

import { DesktopControl } from './index'

it('opens the current operation from the thumbnail and keeps a dismissible completion receipt when the task finishes', () => {
  const messagesStore = atom<ChatMessage[]>([
    {
      id: 'm',
      role: 'assistant',
      parts: [
        {
          type: 'tool-call',
          toolName: 'computer_use',
          toolCallId: 'capture',
          args: { action: 'capture', app: 'Notes' },
          result: { width: 800, height: 600 }
        },
        {
          type: 'tool-call',
          toolName: 'computer_use',
          toolCallId: 'click',
          args: { action: 'click', coordinate: [400, 300] }
        }
      ]
    }
  ])

  const props = { messagesStore, sessionId: 'a', busy: true, onStop: vi.fn() }
  const view = render(<DesktopControl {...props} />)
  fireEvent.click(screen.getByRole('button', { name: '展开 Mira 操作画面' }))
  expect(screen.getByRole('dialog')).toBeTruthy()
  expect(screen.getByRole('img', { name: 'New note' }).getAttribute('src')).toContain('data:image/png')
  expect(screen.queryByRole('combobox')).toBeNull()
  act(() =>
    messagesStore.set([
      ...messagesStore.get(),
      { id: 'done', role: 'assistant', parts: [{ type: 'text', text: '已新建备忘录。' }] }
    ])
  )
  view.rerender(<DesktopControl {...props} busy={false} />)
  expect(screen.getByText('已新建备忘录。')).toBeTruthy()
  expect(screen.getByRole('dialog')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '关闭' }))
  expect(screen.getByRole('button', { name: '查看任务结果' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '查看任务结果' }))
  expect(screen.getByRole('dialog')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '关闭' }))
  fireEvent.click(screen.getByRole('button', { name: '关闭任务浮窗' }))
  expect(screen.queryByRole('button', { name: '查看任务结果' })).toBeNull()
})

it('keeps the preview hidden during ordinary chat even if older turns operated a window', () => {
  const messagesStore = atom<ChatMessage[]>([
    {
      id: 'old',
      role: 'assistant',
      parts: [{ type: 'tool-call', toolName: 'computer_use', args: { action: 'capture', app: 'Notes' } }]
    },
    { id: 'hello', role: 'user', parts: [{ type: 'text', text: '你好' }] },
    { id: 'reply', role: 'assistant', parts: [{ type: 'text', text: '你好，有什么可以帮你？' }] }
  ])

  render(<DesktopControl busy messagesStore={messagesStore} onStop={vi.fn()} sessionId="greeting" />)
  expect(screen.queryByRole('button', { name: '展开 Mira 操作画面' })).toBeNull()
})

it('labels interrupted work honestly and offers the next operation after a dismissal', () => {
  const messagesStore = atom<ChatMessage[]>([
    { id: 'first', role: 'user', parts: [{ type: 'text', text: '打开备忘录' }] },
    {
      id: 'stopped',
      role: 'assistant',
      interrupted: true,
      parts: [
        {
          type: 'tool-call',
          toolName: 'computer_use',
          toolCallId: 'first-capture',
          args: { action: 'capture', app: 'Notes' }
        }
      ]
    }
  ])

  const props = { messagesStore, sessionId: 'a', busy: false, onStop: vi.fn() }
  const view = render(<DesktopControl {...props} />)
  expect(screen.getByText('任务已结束')).toBeTruthy()
  expect(screen.queryByText('任务已完成')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '关闭任务浮窗' }))
  view.rerender(<DesktopControl {...props} />)
  expect(screen.queryByRole('button', { name: '查看任务结果' })).toBeNull()
  act(() =>
    messagesStore.set([
      ...messagesStore.get(),
      { id: 'second', role: 'user', parts: [{ type: 'text', text: '再次打开' }] },
      {
        id: 'next',
        role: 'assistant',
        parts: [
          {
            type: 'tool-call',
            toolName: 'computer_use',
            toolCallId: 'next-capture',
            args: { action: 'capture', app: 'Notes' }
          }
        ]
      }
    ])
  )
  view.rerender(<DesktopControl {...props} busy />)
  expect(screen.getByRole('button', { name: '展开 Mira 操作画面' })).toBeTruthy()
})
