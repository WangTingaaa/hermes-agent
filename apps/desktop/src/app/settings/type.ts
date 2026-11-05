import type { MiraRuntimeState } from '@/global'

export interface MiraRuntimeUpdateDialogProps {
  notes: string[]
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
  open: boolean
  state: MiraRuntimeState | null
}
