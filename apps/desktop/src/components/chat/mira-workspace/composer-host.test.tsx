import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it } from 'vitest'

import { FloatingComposerSurface } from '@/app/chat/composer/floating-surface'
import { ComposerSurfaceProvider } from '@/app/chat/composer/scope'
import { PaneGroupContext, PaneVisibleContext } from '@/components/pane-shell/pane-visibility'
import { $composerPopout, $composerPopoutGesturesEnabled, setComposerPoppedOut } from '@/store/composer-popout'

import { useWorkspaceComposerHost } from './composer-host'

function HomeSlot() {
  const ref = useWorkspaceComposerHost()

  return <div data-testid="home-slot" ref={ref} />
}

function Fixture() {
  const [home, setHome] = useState(true)

  return (
    <PaneGroupContext value="workspace-test">
      <PaneVisibleContext value={true}>
        <ComposerSurfaceProvider value="workspace-test">
          <div data-chat-surface="" data-testid="chat">
            <button onClick={() => setHome(false)}>Show conversation</button>
            {home && <HomeSlot />}
            <FloatingComposerSurface>
              <input aria-label="Draft" defaultValue="unsent draft" />
            </FloatingComposerSurface>
          </div>
        </ComposerSurfaceProvider>
      </PaneVisibleContext>
    </PaneGroupContext>
  )
}

afterEach(() => {
  cleanup()
  $composerPopout.set({ poppedOut: false, position: { bottom: 24, right: 24 } })
  $composerPopoutGesturesEnabled.set(false)
})

it('preserves one editor and its draft through workspace, floating and conversation positions', () => {
  $composerPopoutGesturesEnabled.set(true)
  render(<Fixture />)
  const editor = screen.getByLabelText('Draft') as HTMLInputElement
  const host = editor.closest('[data-composer-owner]')!
  fireEvent.change(editor, { target: { value: 'Keep this unsent text' } })
  expect(screen.getByTestId('home-slot').contains(editor)).toBe(true)
  act(() => setComposerPoppedOut(true))
  expect(host.parentElement).toBe(globalThis.document.body)
  act(() => setComposerPoppedOut(false))
  expect(screen.getByTestId('home-slot').contains(editor)).toBe(true)
  fireEvent.click(screen.getByText('Show conversation'))
  expect(screen.queryByTestId('home-slot')).toBeNull()
  expect(screen.getByTestId('chat').contains(editor)).toBe(true)
  expect(screen.getByLabelText('Draft')).toBe(editor)
  expect(editor.value).toBe('Keep this unsent text')
})
