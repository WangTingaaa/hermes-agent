import type { RefObject } from 'react'

import type { IconComponent } from '@/lib/icons'

import type { ChatBarState } from './types'

export interface ContextMenuItemProps {
  children: string
  disabled?: boolean
  icon: IconComponent
  onSelect?: () => void
}

export interface ContextMenuProps {
  onInsertText: (text: string) => void
  onGenerateFile?: () => Promise<void> | void
  onOpenUrlDialog: () => void
  onPasteClipboardImage?: (opts?: { silent?: boolean }) => Promise<boolean> | void
  onPickCloudFavorite?: () => Promise<void> | void
  onUploadCloudFavorite?: () => Promise<void> | void
  onPickFiles?: () => void
  onPickFolders?: () => void
  onPickImages?: () => void
  state: ChatBarState
}

export interface PromptSnippetsDialogProps {
  onInsertText: (text: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export interface FileGenerationOptions {
  draftRef: RefObject<string>
  editorRef: RefObject<HTMLDivElement | null>
  insertText: (text: string) => void
  scopeRef: RefObject<string | null>
}
