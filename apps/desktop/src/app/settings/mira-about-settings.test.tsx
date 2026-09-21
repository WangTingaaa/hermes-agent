import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MiraRuntimeState } from '@/global'
import { I18nProvider } from '@/i18n/context'
import { en } from '@/i18n/en'
import { ja } from '@/i18n/ja'
import { zh } from '@/i18n/zh'
import { zhHant } from '@/i18n/zh-hant'

const getStatus = vi.fn()
const checkUpdates = vi.fn()
const openUpdatesWindow = vi.fn()
const startActiveUpdate = vi.fn()

vi.mock('@/hermes', () => ({
  getStatus: () => getStatus()
}))

vi.mock('@/store/updates', () => ({
  $updateApply: atom({ applying: false, stage: 'idle' }),
  $updateChecking: atom(false),
  $updateStatus: atom(null),
  checkUpdates: () => checkUpdates(),
  openUpdatesWindow: () => openUpdatesWindow(),
  startActiveUpdate: () => startActiveUpdate()
}))

const currentState: MiraRuntimeState = {
  status: 'ready',
  installedVersion: '0.20.0',
  bundledVersion: '0.21.0',
  updateAvailable: false,
  checkedAt: 1
}

function setRuntimeBridge(overrides: Partial<NonNullable<Window['hermesDesktop']>['runtime']> = {}) {
  const check = vi.fn().mockResolvedValue(currentState)
  const update = vi.fn().mockResolvedValue(undefined)
  let stateListener: ((state: MiraRuntimeState) => void) | null = null

  const runtime = {
    check,
    getState: vi.fn().mockResolvedValue(currentState),
    onState: vi.fn((listener: (state: MiraRuntimeState) => void) => {
      stateListener = listener

      return () => {
        stateListener = null
      }
    }),
    update,
    ...overrides
  }

  ;(window as unknown as { hermesDesktop: unknown }).hermesDesktop = {
    getVersion: vi.fn().mockResolvedValue({ backend: '0.20.0', desktop: '0.3.13' }),
    runtime
  }

  return {
    check: runtime.check,
    update: runtime.update,
    pushState: (state: MiraRuntimeState) => stateListener?.(state)
  }
}

async function renderAbout() {
  const { MiraAboutSettings } = await import('./mira-about-settings')
  await act(async () => {
    render(
      <I18nProvider configClient={{ getConfig: async () => ({}), saveConfig: async () => ({ ok: true }) }}>
        <MiraAboutSettings />
      </I18nProvider>
    )
  })
}

describe('MiraAboutSettings host runtime update', () => {
  beforeEach(() => {
    getStatus.mockResolvedValue({ version: '0.20.0' })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    delete (window as unknown as { hermesDesktop?: unknown }).hermesDesktop
  })

  it('offers the update after a manual check and opens release notes only when requested', async () => {
    const nextState = { ...currentState, updateAvailable: true, checkedAt: Date.now() }
    const { check, update } = setRuntimeBridge({ check: vi.fn().mockResolvedValue(nextState) })
    await renderAbout()

    expect(screen.queryByText('提升长对话压缩与图片 Token 计算的准确性')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '立即检查' }))

    await waitFor(() => expect(check).toHaveBeenCalledOnce())
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(await screen.findByRole('button', { name: '立即更新' }))

    expect(await screen.findByText('提升长对话压缩与图片 Token 计算的准确性')).toBeTruthy()
    expect(update).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '稍后再说' }))
    await waitFor(() => {
      expect(screen.queryByText('提升长对话压缩与图片 Token 计算的准确性')).toBeNull()
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('does not open the release-notes dialog when the runtime is current', async () => {
    const { check } = setRuntimeBridge()
    await renderAbout()

    fireEvent.click(screen.getByRole('button', { name: '立即检查' }))

    await waitFor(() => expect(check).toHaveBeenCalledOnce())
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('提升长对话压缩与图片 Token 计算的准确性')).toBeNull()
  })

  it('starts the host update from the dialog and keeps progress in that dialog', async () => {
    const available = { ...currentState, updateAvailable: true }
    const { pushState, update } = setRuntimeBridge({ getState: vi.fn().mockResolvedValue(available) })
    await renderAbout()

    fireEvent.click(await screen.findByRole('button', { name: '立即更新' }))
    fireEvent.click(screen.getAllByRole('button', { name: '立即更新' }).at(-1)!)
    expect(update).toHaveBeenCalledOnce()

    act(() => {
      pushState({ ...available, status: 'installing', progress: 42, message: 'Installing dependencies' })
    })
    expect(
      await screen.findByRole('heading', {
        name: '正在更新至 Mira Agent 0.21.0（42%）'
      })
    ).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('42')
  })

  it('keeps release-note versions and entry counts aligned across locales', () => {
    const localeNotes = [en, ja, zh, zhHant].map(locale => locale.settings.about.runtimeReleaseNotes)
    const expectedVersions = Object.keys(localeNotes[0])

    expect(expectedVersions).toContain('0.21.0')

    for (const notes of localeNotes.slice(1)) {
      expect(Object.keys(notes)).toEqual(expectedVersions)
    }

    for (const version of expectedVersions) {
      const expectedEntryCount = localeNotes[0][version].length

      for (const notes of localeNotes.slice(1)) {
        expect(notes[version]).toHaveLength(expectedEntryCount)
      }
    }
  })
})
