import { useStore } from '@nanostores/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import type { ArtifactRecord } from '@/app/artifacts/artifact-utils'
import { ArtifactFileInteraction } from '@/app/artifacts/file-interaction'
import { useComposerScope } from '@/app/chat/composer/scope'
import { ARTIFACTS_ROUTE } from '@/app/routes'
import { Codicon } from '@/components/ui/codicon'
import { RowButton } from '@/components/ui/row-button'
import { useI18n } from '@/i18n'
import { $activeConnectionId } from '@/store/connections'
import { $activeGatewayProfile } from '@/store/profile'

import { useRecentWorkspaceArtifacts } from './use-recent-artifacts'

export function MiraWorkspaceDetails() {
  const { t, locale } = useI18n()
  const copy = t.composer.workspace
  const navigate = useNavigate()
  const scope = useComposerScope()
  const activeProfile = useStore($activeGatewayProfile)
  const activeConnection = useStore($activeConnectionId)
  const profile = scope.profile ?? activeProfile
  const connectionId = scope.connectionId ?? activeConnection

  const { result, retry } = useRecentWorkspaceArtifacts({ profile, connectionId })
  const artifacts = result?.artifacts ?? []

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    [locale]
  )

  function renderArtifact(artifact: ArtifactRecord) {
    return (
      <ArtifactFileInteraction artifact={artifact} connectionId={connectionId} key={artifact.id}>
        {preview => (
          <RowButton className="mira-workspace__artifact" onClick={preview}>
            <Codicon name={artifact.kind === 'image' ? 'file-media' : 'file-text'} />
            <span>
              <strong>{artifact.label}</strong>
              <small>{dateFormat.format(artifact.timestamp)}</small>
            </span>
          </RowButton>
        )}
      </ArtifactFileInteraction>
    )
  }

  function renderArtifacts() {
    return (
      <section aria-label={copy.recentHeading} className="mira-workspace__recent">
        <div className="mira-workspace__section-heading">
          <h2>{copy.recentHeading}</h2>
          <RowButton className="mira-workspace__text-link" onClick={() => navigate(ARTIFACTS_ROUTE)}>
            {copy.allArtifacts}
            <Codicon name="arrow-up-right" />
          </RowButton>
        </div>
        <div className="mira-workspace__recent-body">
          {artifacts.length ? (
            <div className="mira-workspace__artifacts">{artifacts.map(renderArtifact)}</div>
          ) : (
            <p aria-live="polite" className="mira-workspace__empty">
              {!result ? t.artifacts.indexing : result.partial ? t.artifacts.failedLoad : copy.recentEmpty}
            </p>
          )}
          {result?.partial && (
            <RowButton className="mira-workspace__text-link" onClick={retry}>
              {t.common.retry}
            </RowButton>
          )}
        </div>
      </section>
    )
  }

  function renderTip() {
    return (
      <section className="mira-workspace__tip">
        <span>
          <Codicon name="lightbulb" />
          {copy.tipLabel}
        </span>
        <h2>{copy.tipTitle}</h2>
        <p>{copy.tipBody}</p>
      </section>
    )
  }

  return (
    <aside className="mira-workspace__details">
      {renderArtifacts()}
      {renderTip()}
    </aside>
  )
}
