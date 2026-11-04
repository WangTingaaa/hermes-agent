import { useEffect, useState } from 'react'

import type { DesktopFrameState, DesktopTarget } from './type'

export function useOperationPreview(target: DesktopTarget, enabled: boolean, live = true) {
  const [captured, setCaptured] = useState<DesktopFrameState>({ key: '', frame: null })
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const { app, windowTitle } = target
  const key = JSON.stringify([app, windowTitle])
  useEffect(() => {
    setError('')

    if (!enabled || (!app && !windowTitle)) {
      return
    }

    const api = window.hermesDesktop?.desktopPreview

    if (!api?.snapshot) {
      setError('unavailable')

      return
    }

    let disposed = false
    let timer: ReturnType<typeof setTimeout>

    const refresh = async () => {
      try {
        const next = await api.snapshot({ app, windowTitle })

        if (disposed) {
          return
        }

        if (next) {
          setCaptured({ key, frame: next })
        }

        setError(next ? '' : 'window-unavailable')

        // Capture the final state once, then retain it without background polling.
        if (live) {
          timer = setTimeout(() => void refresh(), 500)
        }
      } catch (cause) {
        if (!disposed) {
          const message = cause instanceof Error ? cause.message : String(cause)

          const kind =
            [
              { when: message.includes('No handler registered'), value: 'unavailable' },
              { when: message.includes('SCREEN_CAPTURE_PERMISSION'), value: 'permission' }
            ].find(rule => rule.when)?.value ?? 'capture-failed'

          console.warn('[desktop-preview]', message)
          setError(kind)
        }
      }
    }

    void refresh()

    return () => {
      disposed = true
      clearTimeout(timer)
    }
  }, [app, windowTitle, key, enabled, live, attempt])

  return {
    frame: enabled && captured.key === key ? captured.frame : null,
    error,
    retry: () => setAttempt(value => value + 1)
  }
}
