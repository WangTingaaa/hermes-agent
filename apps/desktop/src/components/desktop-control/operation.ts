import type { ChatMessage } from '@/lib/chat-messages'
import { toolResultRecord } from '@/lib/tool-result-metadata'

import type { DesktopFrame, DesktopOperation, DesktopOperationState, DesktopPointer, DesktopToolCall } from './type'

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
  const dimensions = summary.match(/capture mode=\S+ (\d+)x(\d+)/)

  capture.width ??= dimensions && Number(dimensions[1])
  capture.height ??= dimensions && Number(dimensions[2])

  if (Array.isArray(capture.elements)) {
    return capture
  }

  capture.elements = summary.split('\n').flatMap(line => {
    const match = line.match(/^\s+#(\d+).*@ (?:\[|\()([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)[\])]/)

    return match ? [{ index: Number(match[1]), bounds: match.slice(2).map(Number) }] : []
  })

  return capture
}

function elementCoordinates(index: unknown, capture: Record<string, unknown>): number[] | undefined {
  if (typeof index !== 'number' || !Array.isArray(capture.elements)) {
    return
  }

  const bounds = capture.elements.map(record).find(item => item.index === index)?.bounds

  if (
    !Array.isArray(bounds) ||
    bounds.length !== 4 ||
    !bounds.every(Number.isFinite) ||
    bounds[2] <= 0 ||
    bounds[3] <= 0
  ) {
    return
  }

  return [bounds[0] + bounds[2] / 2, bounds[1] + bounds[3] / 2]
}

function capturePointer(
  args: Record<string, unknown>,
  capture: Record<string, unknown>,
  id: string
): DesktopPointer | undefined {
  const point = args.action === 'drag' ? args.to_coordinate : args.coordinate
  const elementIndex = args.action === 'drag' ? args.to_element : args.element
  const coords = Array.isArray(point) ? point : elementCoordinates(elementIndex, capture)
  const width = Number(capture.width) * Number(capture.bounds_scale || 1)
  const height = Number(capture.height) * Number(capture.bounds_scale || 1)

  if (!coords || coords.length !== 2 || !coords.every(Number.isFinite)) {
    return
  }

  if (![width, height].every(value => Number.isFinite(value) && value > 0)) {
    return
  }

  const [x, y] = [coords[0] / width, coords[1] / height]

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return
  }

  return { x, y, action: string(args.action), id }
}

function applyScriptedOperation(state: DesktopOperationState, part: DesktopToolCall) {
  const app = scriptedApp(string(record(part.args).command))

  if (app && app !== state.target.app) {
    state.target = { app, windowTitle: '' }
    state.capture = {}
    state.pointer = undefined
    state.frame = undefined
  }
}

function applyBrowserOperation(state: DesktopOperationState, part: DesktopToolCall) {
  const previous = state.target.app ? undefined : state.frame
  state.target = { app: '', windowTitle: '' }
  state.capture = {}
  state.pointer = undefined
  state.frame = toolFrame(toolResultRecord(part), part.toolCallId || '') || previous
}

function applyComputerOperation(state: DesktopOperationState, part: DesktopToolCall) {
  const args = record(part.args)
  const result = toolResultRecord(part)
  const summary = string(result.text_summary) || string(result.summary)
  const title = string(result.window_title) || summary.match(/ window='([^'\n]+)'/)?.[1] || ''

  const app =
    string(args.app) || string(result.app) || summary.match(/ app=(.+?)(?: window=|\n|$)/)?.[1] || state.target.app

  const changed = app !== state.target.app || Boolean(title && title !== state.target.windowTitle)

  if (changed) {
    state.capture = {}
    state.pointer = undefined
    state.frame = undefined
  }

  state.frame = toolFrame(result, part.toolCallId || '') || state.frame
  state.target = { app, windowTitle: title || (changed ? '' : state.target.windowTitle) }

  if (args.action === 'capture') {
    state.capture = captureMetadata(result, summary)

    return
  }

  if (part.isError || result.ok === false || result.error) {
    state.pointer = undefined

    return
  }

  state.pointer = capturePointer(args, state.capture, part.toolCallId || '') || state.pointer
}

const operationHandlers: Record<string, (state: DesktopOperationState, part: DesktopToolCall) => void> = {
  terminal: applyScriptedOperation,
  browser_exec: applyBrowserOperation,
  computer_use: applyComputerOperation
}

// Background input need not move the OS cursor. Resolve a virtual pointer only
// against the captured window it belongs to, never against an arbitrary screen.
export function desktopOperation(messages: readonly ChatMessage[]): DesktopOperation {
  const state: DesktopOperationState = { target: { app: '', windowTitle: '' }, capture: {} }

  for (const message of currentDesktopTurn(messages)) {
    for (const part of message.parts) {
      if (part.type === 'tool-call') {
        operationHandlers[part.toolName]?.(state, part)
      }
    }
  }

  return { target: state.target, pointer: state.pointer, frame: state.frame }
}
