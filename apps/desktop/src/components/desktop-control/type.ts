import type { ReadableAtom } from 'nanostores'

import type { ChatMessage } from '@/lib/chat-messages'

export interface DesktopSource {
  id: string
  name: string
}
export interface DesktopPreviewApi {
  sources(): Promise<DesktopSource[]>
  select(sourceId: string): Promise<void>
  snapshot(target: DesktopTarget): Promise<DesktopFrame | null>
}
export interface DesktopControlProps {
  hidden?: boolean
  messagesStore: ReadableAtom<ChatMessage[]>
  sessionId: string | null
  busy: boolean
  onStop(): unknown
}
export interface DesktopAction {
  id: string
  name: string
  app: string
  status: 'running' | 'success' | 'failed' | 'unconfirmed'
  startedAt?: number
  duration?: number
  error?: string
}

export interface DesktopTarget {
  app: string
  windowTitle: string
}
export interface DesktopFrame {
  image: string
  name: string
  sourceId: string
}
export interface DesktopPointer {
  x: number
  y: number
  action: string
  id: string
}
export interface DesktopOperation {
  target: DesktopTarget
  frame?: DesktopFrame
  pointer?: DesktopPointer
}
export interface PreviewSurfaceProps {
  frame: DesktopFrame | null
  pointer?: DesktopPointer
  label: string
  empty: string
}

export interface DesktopFrameState {
  key: string
  frame: DesktopFrame | null
}

export interface DesktopCompletionCopy {
  failed: string
  ended: string
  completed: string
}

export interface DesktopOperationState extends DesktopOperation {
  capture: Record<string, unknown>
}

export type DesktopToolCall = Extract<ChatMessage['parts'][number], { type: 'tool-call' }>
