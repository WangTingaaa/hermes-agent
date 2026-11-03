import { useStore } from '@nanostores/react'

import { Codicon } from '@/components/ui/codicon'
import { useI18n } from '@/i18n'
import { BRAND_AGENT_NAME } from '@/lib/branding'

import { MiraWorkspaceCapabilities } from './capabilities'
import { MiraCapabilityExplorer } from './capability-explorer'
import { useWorkspaceComposerHost } from './composer-host'
import { MiraWorkspaceDetails } from './details'
import { MiraIdeaVisual } from './idea-visual'
import { $showWorkspaceOverview } from './presentation'
import type { MiraWorkspaceProps } from './type'

export function MiraWorkspace({ body }: MiraWorkspaceProps) {
  const { t } = useI18n()
  const copy = t.composer.workspace
  const composerRef = useWorkspaceComposerHost()
  const showOverview = useStore($showWorkspaceOverview)

  function renderWelcome() {
    return (
      <header className="mira-workspace__welcome">
        <div className="mira-workspace__copy">
          <div aria-label={BRAND_AGENT_NAME} className="mira-workspace__eyebrow">
            <span aria-hidden="true" className="mira-workspace__welcome-icon">
              <Codicon name="lightbulb" />
            </span>
            {copy.eyebrow}
          </div>
          <h1>
            {copy.title}
            <em>{copy.accent}</em>
          </h1>
          <p>{body ?? copy.description}</p>
        </div>
        <div className="mira-workspace__welcome-art">
          <MiraIdeaVisual />
          <span className="mira-workspace__workspace-label">
            <Codicon name="folder-opened" />
            {copy.workspaceLabel}
          </span>
        </div>
      </header>
    )
  }

  function renderComposer() {
    return (
      <section aria-label={copy.composerHeading} className="mira-workspace__composer-card">
        <div className="mira-workspace__section-heading">
          <h2>{copy.composerHeading}</h2>
          <span>{copy.composerHint}</span>
        </div>
        <div className="mira-workspace__composer-host" ref={composerRef} />
      </section>
    )
  }

  return (
    <div className="mira-workspace" data-slot="aui_intro">
      {renderWelcome()}
      {renderComposer()}
      {showOverview && (
        <>
          <div className="mira-workspace__grid">
            <MiraCapabilityExplorer />
            <MiraWorkspaceDetails />
          </div>
          <MiraWorkspaceCapabilities />
          <p className="mira-workspace__footer">{copy.footer}</p>
        </>
      )}
    </div>
  )
}
