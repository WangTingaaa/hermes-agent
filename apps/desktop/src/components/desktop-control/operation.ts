import type { ChatMessage } from '@/lib/chat-messages'
import { toolResultRecord } from '@/lib/tool-result-metadata'

import type { DesktopFrame, DesktopOperation, DesktopPointer } from './type'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const string = (value: unknown) => (typeof value === 'string' ? value : '')

export function currentDesktopTurn(messages: readonly ChatMessage[]): readonly ChatMessage[] {
  const start = messages.findLastIndex(message => message.role === 'user')

  return messages.slice(Math.max(0, start))
}

function scriptedApp(command: string): string | undefined {
  const scripts = [...command.matchAll(/\btell\s+(?:application|process)\s+["']([^"'\n]+)["']/gi)].map(match => ({
    index: match.index,
    app: match[1]
  }))

  // Only a literal application passed to macOS open qualifies, not prose or a URL.
  const opened = [
    ...command.matchAll(/(?:^|[\n;&|])\s*open\s+(?:-[gjFnRW]\s+)*-(?:a|b)\s+(?:"([^"\n]+)"|'([^'\n]+)'|([^\s;&|]+))/g)
  ].map(match => ({ index: match.index, app: match[1] || match[2] || match[3] }))

  return [...scripts, ...opened]
    .filter(target => target.app !== 'System Events')
    .sort((a, b) => a.index - b.index)
    .at(-1)?.app
}

function toolFrame(result: Record<string, unknown>, id: string): DesktopFrame | undefined {
  if (!Array.isArray(result.content)) {
    return
  }

  for (const content of result.content) {
    const image = record(record(content).image_url)
    const url = string(image.url)

    if (/^data:image\/(?:png|jpeg|webp);base64,/.test(url)) {
      return { image: url, name: string(result.window_title) || 'Mira Desktop', sourceId: id }
    }
  }
}

function captureMetadata(result: Record<string, unknown>, summary: string): Record<string, unknown> {
  const capture = { ...result, ...record(result.meta) }

  if (Array.isArray(capture.elements)) {
    return capture
  }

  capture.elements = summary.split('\n').flatMap(line => {
    const match = line.match(/^\s+#(\d+).*@ (?:\[|\()([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)[\])]/)

    return match ? [{ index: Number(match[1]), bounds: match.slice(2).map(Number) }] : []
  })

  return capture
}

function capturePointer(
  args: Record<string, unknown>,
  capture: Record<string, unknown>,
  id: string
): DesktopPointer | undefined {
  const point = args.action === 'drag' ? args.to_coordinate : args.coordinate
  let coords = Array.isArray(point) ? point : undefined

  if (!coords && typeof args.element === 'number' && Array.isArray(capture.elements)) {
    const element = capture.elements.map(record).find(item => item.index === args.element)
    const bounds = element?.bounds

    if (Array.isArray(bounds) && bounds.length === 4 && bounds.every(Number.isFinite)) {
      coords = [bounds[0] + bounds[2] / 2, bounds[1] + bounds[3] / 2]
    }
  }

  const width = Number(capture.width) * Number(capture.bounds_scale || 1)
  const height = Number(capture.height) * Number(capture.bounds_scale || 1)

  if (
    !coords ||
    !coords.every(Number.isFinite) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return
  }

  const [x, y] = [coords[0] / width, coords[1] / height]

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return
  }

  return { x, y, action: string(args.action), id }
}

// Background input need not move the OS cursor. Resolve a virtual pointer only
// against the captured window it belongs to, never against an arbitrary screen.
export function desktopOperation(messages: readonly ChatMessage[]): DesktopOperation {
  let target = { app: '', windowTitle: '' }
  let capture: Record<string, unknown> = {}
  let pointer: DesktopPointer | undefined
  let frame: DesktopFrame | undefined

  for (const message of currentDesktopTurn(messages)) {
    for (const part of message.parts) {
      if (part.type !== 'tool-call') {
        continue
      }

      const args = record(part.args)

      if (part.toolName === 'terminal') {
        const app = scriptedApp(string(args.command))

        if (app) {
          target = { app, windowTitle: '' }
          capture = {}
          pointer = undefined
          frame = undefined
        }

        continue
      }

      if (part.toolName === 'browser_exec') {
        const previous = target.app ? undefined : frame
        target = { app: '', windowTitle: '' }
        capture = {}
        pointer = undefined
        frame = toolFrame(toolResultRecord(part), part.toolCallId || '') || previous

        continue
      }

      if (part.toolName !== 'computer_use') {
        continue
      }

      const result = toolResultRecord(part)
      const summary = string(result.text_summary) || string(result.summary)
      const title = string(result.window_title) || summary.match(/ window='([^'\n]+)'/)?.[1] || ''

      const app =
        string(args.app) || string(result.app) || summary.match(/ app=(.+?)(?: window=|\n|$)/)?.[1] || target.app

      const changed = app !== target.app || Boolean(title && title !== target.windowTitle)

      if (changed) {
        capture = {}
        pointer = undefined
        frame = undefined
      }

      frame = toolFrame(result, part.toolCallId || '') || frame
      target = { app, windowTitle: title || (changed ? '' : target.windowTitle) }

      if (args.action === 'capture') {
        capture = captureMetadata(result, summary)
        pointer = undefined

        continue
      }

      if (part.isError || result.ok === false || result.error) {
        pointer = undefined

        continue
      }

      pointer = capturePointer(args, capture, part.toolCallId || '')
    }
  }

  return { target, pointer, frame }
}
