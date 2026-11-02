import type { ArtifactRecord } from '@/app/artifacts/artifact-utils'
import type { MiraTaskId } from '@/i18n/mira-workspace/type'

export interface MiraWorkspaceProps {
  body?: string
}

export interface MiraArtifactScope {
  profile: string
  connectionId: string | null
}

export interface MiraRecentArtifactsState {
  key: string
  artifacts: ArtifactRecord[]
  partial: boolean
}

export interface MiraCapabilityVisualProps {
  task: MiraTaskId
}
