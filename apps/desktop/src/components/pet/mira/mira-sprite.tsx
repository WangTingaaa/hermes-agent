import { memo, useEffect, useRef } from 'react'

import { createRendererLoopPauseController } from '@/lib/renderer-loop-pause'
import { $petState } from '@/store/pet'

import { MIRA_CELLS, miraPose } from './animation'
import type { MiraSpriteProps } from './type'

function MiraSpriteImpl({ info, zoom = 1, stateOverride, pauseWhenUnfocused = false }: MiraSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const width = Math.round((info.frameW ?? 240) * (info.scale ?? 0.75) * zoom)
  const height = Math.round((info.frameH ?? 288) * (info.scale ?? 0.75) * zoom)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { willReadFrequently: true })

    if (!canvas || !context || !info.assetUrl) {
      return
    }

    const image = new Image()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer = 0
    let raf = 0
    let disposed = false
    let startedAt = performance.now()
    let state = stateOverride ?? $petState.get()
    let pause: ReturnType<typeof createRendererLoopPauseController>

    function cancel() {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(raf)
    }

    function draw() {
      cancel()

      if (disposed || pause.isPaused() || !image.complete || !image.naturalWidth) {
        return
      }

      // Resolve DPR at paint time so display moves and Electron zoom stay crisp.
      const ratio = Math.max(1, window.devicePixelRatio || 1)
      const w = Math.round(width * ratio)
      const h = Math.round(height * ratio)

      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
      }

      const pose = miraPose(state, info.mira?.emotion ?? 'auto', performance.now() - startedAt, motion.matches)
      const [col, row] = MIRA_CELLS[pose.emotion]
      const cellW = image.naturalWidth / 2
      const cellH = image.naturalHeight / 2
      const fit = Math.min(w / cellW, h / cellH) * 0.93
      const drawW = cellW * fit
      const drawH = cellH * fit

      context!.clearRect(0, 0, w, h)
      context!.save()
      context!.translate(w / 2, h * 0.97 - pose.lift * h)
      context!.rotate(pose.rotation)
      context!.scale(1, pose.stretch)
      context!.imageSmoothingEnabled = true
      context!.imageSmoothingQuality = 'high'
      context!.drawImage(image, col * cellW, row * cellH, cellW, cellH, -drawW / 2, -drawH, drawW, drawH)
      context!.restore()

      // Twenty-four paints per second suffice for gentle companion motion;
      // a reduced-motion pet needs only a slow expression-change wake-up.
      timer = window.setTimeout(
        () => {
          raf = window.requestAnimationFrame(draw)
        },
        motion.matches ? 1000 : 1000 / 24
      )
    }

    pause = createRendererLoopPauseController(draw, { pauseWhenUnfocused })

    const off = $petState.listen(next => {
      state = stateOverride ?? next
      startedAt = performance.now()
      draw()
    })

    image.addEventListener('load', draw)
    motion.addEventListener('change', draw)
    window.addEventListener('resize', draw)
    image.src = info.assetUrl
    draw()

    return () => {
      disposed = true
      cancel()
      off()
      pause.dispose()
      image.removeEventListener('load', draw)
      motion.removeEventListener('change', draw)
      window.removeEventListener('resize', draw)
    }
  }, [info.assetUrl, info.mira?.emotion, width, height, stateOverride, pauseWhenUnfocused])

  return <canvas aria-label={info.displayName ?? 'Mira'} ref={canvasRef} style={{ width, height }} />
}

export const MiraSprite = memo(MiraSpriteImpl)
