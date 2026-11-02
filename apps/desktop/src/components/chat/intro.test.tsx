import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'

import { requestComposerFocus, requestComposerInsert } from '@/app/chat/composer/focus'
import { ARTIFACTS_ROUTE, CAPABILITIES_ROUTE } from '@/app/routes'
import { I18nProvider, useI18n } from '@/i18n'
import type { I18nContextValue } from '@/i18n'

import { Intro } from './intro'
import stock from './intro-copy.jsonl?raw'

vi.mock('@/app/chat/composer/focus', () => ({
  requestComposerFocus: vi.fn(),
  requestComposerInsert: vi.fn()
}))

const CJK_LOCALES = new Set(['zh', 'zh-hant', 'ja'])

let i18n: I18nContextValue

function Controls() {
  i18n = useI18n()

  return null
}

function Fixture({ personality, seed = 0 }: { personality?: string; seed?: number }) {
  return (
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="en">
        <Controls />
        <Intro personality={personality} seed={seed} />
      </I18nProvider>
    </MemoryRouter>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('translates every shipped stock body at the same personality and rotation position', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)

  const entries = stock
    .trim()
    .split('\n')
    .map(line => JSON.parse(line) as { personality: string; body: string })

  const { container, rerender } = render(<Fixture />)

  for (const locale of ['zh', 'zh-hant', 'ja', 'fr', 'de', 'es'] as const) {
    await act(() => i18n.setLocale(locale))
    const indices = new Map<string, number>()

    for (const personality of new Set(entries.map(entry => entry.personality))) {
      expect(i18n.t.intro.stock[personality]).toHaveLength(
        entries.filter(entry => entry.personality === personality).length
      )
    }

    for (const entry of entries) {
      const seed = indices.get(entry.personality) ?? 0
      indices.set(entry.personality, seed + 1)
      rerender(<Fixture personality={entry.personality} seed={seed} />)
      const body = container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent
      expect(body).toBeTruthy()
      expect(body).not.toBe(entry.body)

      if (CJK_LOCALES.has(locale)) {
        expect(body).toMatch(/[\u3040-\u30ff\u3400-\u9fff]/)
      }
    }
  }

  await act(() => i18n.setLocale('en'))
  rerender(<Fixture personality={entries[0].personality} seed={0} />)
  expect(container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent).toBe(entries[0].body)
})
it('localizes the custom-personality fallback without translating its user-supplied name', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const { container } = render(<Fixture personality="My Custom Voice" seed={4} />)
  const english = container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent
  await act(() => i18n.setLocale('zh'))
  expect(container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent).not.toBe(english)
  expect(container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent).toContain('My Custom Voice')
  await act(() => i18n.setLocale('ja'))
  expect(container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent).toContain('My Custom Voice')

  for (const locale of ['fr', 'de', 'es'] as const) {
    await act(() => i18n.setLocale(locale))
    const body = container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent
    expect(body).not.toBe(english)
    expect(body).toContain('My Custom Voice')
  }
})

it('updates the welcome heading and description with the interface language', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const { container, getByRole } = render(<Fixture personality="none" seed={3} />)

  for (const locale of ['zh', 'zh-hant', 'ja', 'de', 'fr', 'es', 'ar', 'ru', 'en'] as const) {
    await act(() => i18n.setLocale(locale))
    expect(container.querySelector('h1')!.textContent).toBe(
      i18n.t.composer.workspace.title + i18n.t.composer.workspace.accent
    )
    expect(container.querySelector('[data-slot="aui_intro"] h1 + p')!.textContent).toBe(
      i18n.t.composer.workspace.description
    )
    expect(container.querySelector('[aria-label="Mira Agent"]')).not.toBeNull()

    for (const task of Object.values(i18n.t.composer.workspace.tasks)) {
      fireEvent.mouseDown(getByRole('tab', { name: task.label }), { button: 0, ctrlKey: false })
      expect(getByRole('tabpanel').textContent).toContain(task.detail)
    }
  }
})

it('prefills the clicked pane with a localized task without submitting a message', async () => {
  const onSubmit = vi.fn(event => event.preventDefault())

  const { getByRole } = render(
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="zh">
        <Controls />
        <form data-composer-target="tile:research" onSubmit={onSubmit}>
          <Intro />
        </form>
      </I18nProvider>
    </MemoryRouter>
  )

  for (const locale of ['zh', 'en', 'ar'] as const) {
    await act(() => i18n.setLocale(locale))

    for (const task of Object.values(i18n.t.composer.workspace.tasks)) {
      fireEvent.mouseDown(getByRole('tab', { name: task.label }), { button: 0, ctrlKey: false })
      fireEvent.click(getByRole('button', { name: i18n.t.composer.workspace.tryTask }))
      expect(requestComposerInsert).toHaveBeenLastCalledWith(task.prompt, { target: 'tile:research' })
      expect(requestComposerFocus).toHaveBeenLastCalledWith('tile:research')
    }
  }

  expect(onSubmit).not.toHaveBeenCalled()
})

function RouteProbe() {
  const location = useLocation()

  return <output data-testid="route">{location.pathname}</output>
}

it('opens the existing capabilities and artifacts pages from the workbench', () => {
  const { getByRole, getByTestId } = render(
    <MemoryRouter>
      <I18nProvider configClient={null} initialLocale="en">
        <Controls />
        <Intro />
        <RouteProbe />
      </I18nProvider>
    </MemoryRouter>
  )

  fireEvent.click(getByRole('button', { name: i18n.t.composer.workspace.viewAll }))
  expect(getByTestId('route').textContent).toBe(CAPABILITIES_ROUTE)
  fireEvent.click(getByRole('button', { name: i18n.t.composer.workspace.allArtifacts }))
  expect(getByTestId('route').textContent).toBe(ARTIFACTS_ROUTE)
})
