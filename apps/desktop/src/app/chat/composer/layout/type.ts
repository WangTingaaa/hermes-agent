import type { ReactNode } from 'react'

export interface ComposerLayoutProps {
  className: string
  controls: ReactNode
  input: ReactNode
  menu: ReactNode
  onFloatToggle: () => void
  poppedOut: boolean
}

export interface ComposerFloatButtonProps {
  onToggle: () => void
  poppedOut: boolean
}
