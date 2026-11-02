import { Tabs as TabsPrimitive } from 'radix-ui'
import { type MouseEvent, useState } from 'react'

import { requestComposerFocus, requestComposerInsert } from '@/app/chat/composer/focus'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/i18n'
import type { MiraTaskId } from '@/i18n/mira-workspace/type'

import { MiraCapabilityVisual } from './capability-visual'

const TASKS = [
  ['code', 'code'],
  ['files', 'file-text'],
  ['table', 'table'],
  ['research', 'search'],
  ['automate', 'sync'],
  ['create', 'edit']
] as const

export function MiraCapabilityExplorer() {
  const { t } = useI18n()
  const copy = t.composer.workspace
  const [selected, setSelected] = useState<MiraTaskId>('code')
  const task = copy.tasks[selected]

  function handleStartTask(event: MouseEvent<HTMLButtonElement>) {
    const target =
      event.currentTarget.closest('[data-composer-target]')?.getAttribute('data-composer-target') || 'active'

    requestComposerInsert(task.prompt, { target })
    requestComposerFocus(target)
  }

  function renderNavigation() {
    return (
      <TabsList aria-label={copy.tasksHeading} className="mira-explorer__navigation">
        {TASKS.map(([id, icon]) => (
          <TabsTrigger className="mira-explorer__tab" key={id} value={id}>
            <Codicon name={icon} />
            <span>{copy.tasks[id].label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    )
  }

  function renderFeature() {
    return (
      <TabsPrimitive.Content className="mira-explorer__feature" key={selected} value={selected}>
        <div className="mira-explorer__copy">
          <span aria-hidden="true" className="mira-explorer__number">
            0{TASKS.findIndex(([id]) => id === selected) + 1}
            <span> / 06</span>
          </span>
          <h3>{task.label}</h3>
          <p>{task.detail}</p>
          <Button onClick={handleStartTask} size="sm" type="button" variant="default">
            {copy.tryTask}
            <Codicon name="arrow-right" />
          </Button>
        </div>
        <MiraCapabilityVisual task={selected} />
      </TabsPrimitive.Content>
    )
  }

  return (
    <section aria-label={copy.tasksHeading} className="mira-explorer">
      <header className="mira-explorer__header">
        <h2>{copy.tasksHeading}</h2>
        <p>{copy.tasksHint}</p>
      </header>
      <Tabs className="mira-explorer__body" onValueChange={value => setSelected(value as MiraTaskId)} value={selected}>
        {renderNavigation()}
        {renderFeature()}
      </Tabs>
    </section>
  )
}
