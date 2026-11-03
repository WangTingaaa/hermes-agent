import { useCallback, useEffect, useRef, useState } from 'react'

import type { DesktopSource } from './type'

export function useDesktopStream() {
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const generation = useRef(0)
  const [sources, setSources] = useState<DesktopSource[]>([])
  const [active, setActive] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const stop = useCallback(() => {
    generation.current++
    stream.current?.getTracks().forEach(track => track.stop())
    stream.current = null

    if (video.current) {video.current.srcObject = null}
    setActive(false)
    setPending(false)
  }, [])

  useEffect(
    () => () => {
      generation.current++
      stream.current?.getTracks().forEach(track => track.stop())
    },
    []
  )

  const loadSources = async () => {
    try {
      setError('')
      setSources((await window.hermesDesktop?.desktopPreview?.sources()) ?? [])
    } catch (reason) {
      setError(String(reason))
    }
  }

  const start = async (sourceId: string) => {
    stop()
    const token = generation.current
    setError('')
    setPending(true)

    try {
      if (sourceId) {await window.hermesDesktop?.desktopPreview?.select(sourceId)}

      if (token !== generation.current) {return}

      if (!navigator.mediaDevices?.getDisplayMedia) {throw new Error('Screen capture is unavailable in this host.')}
      const captured = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false })

      if (token !== generation.current || !video.current) {
        captured.getTracks().forEach(track => track.stop())

        return
      }

      stream.current = captured
      video.current.srcObject = captured
      captured.getVideoTracks()[0]?.addEventListener(
        'ended',
        () => {
          if (stream.current === captured) {stop()}
        },
        { once: true }
      )
      await video.current.play()

      if (token !== generation.current) {return}
      setActive(true)
    } catch (reason) {
      if (token === generation.current) {
        stop()
        setError(reason instanceof Error ? reason.message : String(reason))
      }
    } finally {
      if (token === generation.current) {setPending(false)}
    }
  }

  return { video, active, pending, error, sources, loadSources, start, stop }
}
