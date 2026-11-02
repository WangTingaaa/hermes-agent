export type MiraTaskId = 'code' | 'files' | 'table' | 'research' | 'automate' | 'create'

export interface MiraTaskCopy {
  label: string
  detail: string
  prompt: string
}

export interface MiraWorkspaceCopy {
  eyebrow: string
  title: string
  accent: string
  description: string
  workspaceLabel: string
  floatComposer: string
  dockComposer: string
  composerHeading: string
  composerHint: string
  tryTask: string
  tasksHeading: string
  tasksHint: string
  tasks: Record<MiraTaskId, MiraTaskCopy>
  capabilitiesHeading: string
  viewAll: string
  capabilities: Record<'terminal' | 'browser' | 'files' | 'skills', Pick<MiraTaskCopy, 'label' | 'detail'>>
  recentHeading: string
  allArtifacts: string
  recentEmpty: string
  tipLabel: string
  tipTitle: string
  tipBody: string
  footer: string
}
