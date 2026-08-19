import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetBackendSkinSync, ingestBackendSkin } from './backend-sync'
import { skinPref, ThemeProvider, useTheme } from './context'
import { midnightTheme } from './presets'

// The live-authoring loop: Hermes writes/edits one skin file and every surface
// repaints. An in-place edit keeps the NAME — only the palette moves.
const bloomberg = (foreground: string) => ({
  name: 'bloomberg',
  colors: { background: '#000000', ui_text: foreground, ui_accent: '#ff8000' }
})

const cssVar = (name: string) => window.document.documentElement.style.getPropertyValue(name)

describe('ThemeProvider ← backend skin sync', () => {
  beforeEach(() => {
    window.localStorage.clear()
    __resetBackendSkinSync()
  })

  afterEach(cleanup)

  it('applies an activated backend skin', () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    act(() => ingestBackendSkin(bloomberg('#ff9f0a'), { apply: true }))

    expect(cssVar('--theme-foreground')).toBe('#ff9f0a')
    expect(cssVar('--theme-background-seed')).toBe('#000000')
  })

  it('repaints an in-place edit of the ACTIVE skin (same name, new palette)', () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    act(() => ingestBackendSkin(bloomberg('#ff9f0a'), { apply: true }))
    expect(cssVar('--theme-foreground')).toBe('#ff9f0a')

    // Recolor the same skin file. The same-name apply guard correctly no-ops
    // (protects manual desktop picks), so the repaint must come from the
    // registry update reaching the active theme derivation.
    act(() => ingestBackendSkin(bloomberg('#ff2d95'), { apply: true }))
    expect(cssVar('--theme-foreground')).toBe('#ff2d95')
  })

  it('does not repaint an edit to an INACTIVE skin', () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    act(() => ingestBackendSkin(bloomberg('#ff9f0a'), { apply: true }))

    // A different skin registered without apply (e.g. seeded on reconnect)
    // must not touch the painted theme.
    act(() =>
      ingestBackendSkin({ name: 'forest', colors: { background: '#001100', ui_text: '#66ff66' } }, { apply: false })
    )
    expect(cssVar('--theme-foreground')).toBe('#ff9f0a')
  })
})

describe('ThemeProvider ← Wenjing host appearance', () => {
  const requestChange = vi.fn()
  let emitAppearance: ((appearance: WenjingHostAppearance) => void) | undefined

  beforeEach(() => {
    window.localStorage.clear()
    requestChange.mockReset()
    emitAppearance = undefined
    window.hermesDesktop = {
      hostAppearance: {
        get: vi.fn(async () => ({
          version: 1,
          revision: 1,
          skin: 'mesoInsights',
          mode: 'dark',
          resolvedMode: 'dark',
          primaryColor: '#f5222d'
        })),
        requestChange,
        onChanged: (callback: (appearance: WenjingHostAppearance) => void) => {
          emitAppearance = callback

          return () => {
            emitAppearance = undefined
          }
        }
      }
    } as unknown as Window['hermesDesktop']
  })

  afterEach(() => {
    cleanup()
    delete (window as unknown as { hermesDesktop?: Window['hermesDesktop'] }).hermesDesktop
  })

  it('paints the host mode and primary color while 文镜 is active', async () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    await act(async () => undefined)

    expect(window.document.documentElement.classList.contains('dark')).toBe(true)
    expect(cssVar('--theme-primary')).toBe('#f5222d')

    act(() =>
      emitAppearance?.({
        version: 1,
        revision: 2,
        skin: 'mesoInsights',
        mode: 'light',
        resolvedMode: 'light',
        primaryColor: '#722ed1'
      })
    )

    expect(window.document.documentElement.classList.contains('dark')).toBe(false)
    expect(cssVar('--theme-primary')).toBe('#722ed1')
  })

  it('forwards a 文镜 mode change as a host intent', async () => {
    const Toggle = () => {
      const { setMode } = useTheme()

      return <button onClick={() => setMode('light')}>light</button>
    }

    render(
      <ThemeProvider>
        <Toggle />
      </ThemeProvider>
    )
    await act(async () => undefined)

    fireEvent.click(screen.getByRole('button', { name: 'light' }))
    expect(requestChange).toHaveBeenCalledWith({
      version: 1,
      skin: 'mesoInsights',
      mode: 'light'
    })
  })
})

describe('ThemeProvider highlight preview', () => {
  beforeEach(() => {
    window.localStorage.clear()
    __resetBackendSkinSync()
  })

  afterEach(cleanup)

  // Read the live context so the tests drive the real provider, not a mock.
  let ctx: ReturnType<typeof useTheme>

  function Probe() {
    ctx = useTheme()

    return null
  }

  const renderProbe = () =>
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )

  it('paints the previewed theme without persisting it', () => {
    renderProbe()

    const committed = ctx.themeName

    act(() => ctx.previewTheme('midnight', 'dark'))

    expect(cssVar('--theme-foreground')).toBe(midnightTheme.colors.foreground)
    // The commit surface does not change. The context name and the stored
    // preference keep their values.
    expect(ctx.themeName).toBe(committed)
    expect(skinPref.resolve('default')).toBe(committed)
  })

  it('clearThemePreview repaints the committed appearance', () => {
    renderProbe()

    act(() => ctx.previewTheme('midnight', 'dark'))
    expect(cssVar('--theme-foreground')).toBe(midnightTheme.colors.foreground)

    act(() => ctx.clearThemePreview())
    expect(cssVar('--theme-foreground')).not.toBe(midnightTheme.colors.foreground)
  })

  it('a commit replaces the preview and persists', () => {
    renderProbe()

    act(() => ctx.previewTheme('midnight', 'dark'))
    act(() => ctx.setTheme('mono'))

    expect(ctx.themeName).toBe('mono')
    expect(skinPref.resolve('default')).toBe('mono')
    expect(cssVar('--theme-foreground')).not.toBe(midnightTheme.colors.foreground)
  })

  it('ignores a preview of an unknown theme', () => {
    renderProbe()

    const painted = cssVar('--theme-foreground')

    act(() => ctx.previewTheme('does-not-exist', 'dark'))
    expect(cssVar('--theme-foreground')).toBe(painted)
  })
})
