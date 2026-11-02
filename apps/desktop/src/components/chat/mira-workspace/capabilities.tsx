import { useNavigate } from 'react-router'

import { CAPABILITIES_ROUTE } from '@/app/routes'
import { Codicon } from '@/components/ui/codicon'
import { RowButton } from '@/components/ui/row-button'
import { useI18n } from '@/i18n'

const CAPABILITIES = [
  ['terminal', 'terminal'],
  ['browser', 'globe'],
  ['files', 'files'],
  ['skills', 'tools']
] as const

export function MiraWorkspaceCapabilities() {
  const { t } = useI18n()
  const copy = t.composer.workspace
  const navigate = useNavigate()

  return (
    <section aria-label={copy.capabilitiesHeading} className="mira-workspace__capability-strip">
      <div className="mira-workspace__section-heading">
        <h2>{copy.capabilitiesHeading}</h2>
        <RowButton className="mira-workspace__text-link" onClick={() => navigate(CAPABILITIES_ROUTE)}>
          {copy.viewAll}
          <Codicon name="arrow-up-right" />
        </RowButton>
      </div>
      <div className="mira-workspace__capabilities">
        {CAPABILITIES.map(([id, icon]) => (
          <div className="mira-workspace__capability" key={id}>
            <span className="mira-workspace__task-icon">
              <Codicon name={icon} />
            </span>
            <span>
              <strong>{copy.capabilities[id].label}</strong>
              <small>{copy.capabilities[id].detail}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
