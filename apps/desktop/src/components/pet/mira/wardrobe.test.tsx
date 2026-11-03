import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n/context'
import { $displayPetInfo, setPetInfo } from '@/store/pet'
import {
  $miraWardrobeOpen,
  $petPersonalization,
  MIRA_DEFAULTS,
  openMiraWardrobe,
  PET_PERSONALIZATION_KEY,
  savePetPersonalization
} from '@/store/pet-personalization'

import { MiraWardrobeHost } from './wardrobe'

// Canvas painting is verified in the browser; these tests exercise the real
// dialog, persistence and the shared state used by both pet windows.
vi.mock('./mira-sprite', () => ({ MiraSprite: () => <canvas /> }))

function openWardrobe() {
  render(
    <I18nProvider configClient={null} initialLocale="zh">
      <MiraWardrobeHost />
    </I18nProvider>
  )
  act(openMiraWardrobe)
}

describe('Mira wardrobe', () => {
  beforeEach(() => {
    savePetPersonalization(MIRA_DEFAULTS)
    setPetInfo({ enabled: false })
  })

  afterEach(() => {
    cleanup()
    $miraWardrobeOpen.set(false)
    $petPersonalization.set({ ...MIRA_DEFAULTS })
    window.localStorage.removeItem(PET_PERSONALIZATION_KEY)
  })

  it('saves the name, outfit and expression together and restores them on reopen', () => {
    openWardrobe()
    fireEvent.change(screen.getByLabelText('名字'), { target: { value: '小米拉' } })
    fireEvent.click(screen.getByRole('button', { name: '轻旅信使' }))
    fireEvent.click(screen.getByRole('button', { name: '生气' }))
    expect($displayPetInfo.get().displayName).toBe('Mira')
    fireEvent.click(screen.getByRole('button', { name: '完成' }))

    expect($displayPetInfo.get()).toMatchObject({
      enabled: true,
      displayName: '小米拉',
      mira: { outfit: 'courier', emotion: 'angry' }
    })
    expect(JSON.parse(window.localStorage.getItem(PET_PERSONALIZATION_KEY)!)).toMatchObject({
      name: '小米拉',
      outfit: 'courier',
      emotion: 'angry'
    })
    act(openMiraWardrobe)
    expect((screen.getByLabelText('名字') as HTMLInputElement).value).toBe('小米拉')
    expect(screen.getByRole('button', { name: '轻旅信使' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('discards a cancelled draft and prevents saving a blank name', () => {
    openWardrobe()
    fireEvent.change(screen.getByLabelText('名字'), { target: { value: '   ' } })
    expect((screen.getByRole('button', { name: '完成' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '星夜睡衣' }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect($petPersonalization.get()).toEqual(MIRA_DEFAULTS)
    act(openMiraWardrobe)
    fireEvent.click(screen.getByRole('button', { name: '卖萌' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect($miraWardrobeOpen.get()).toBe(false)
    expect($petPersonalization.get()).toEqual(MIRA_DEFAULTS)
  })
})
