async (event) => {
  let { x, y } = event
  if (event.kind === 'focus') {
    if ([document.body, document.documentElement].includes(document.activeElement)) return
    const rect = document.activeElement?.getBoundingClientRect()
    if (!rect?.width || !rect?.height) return
    x = rect.left + Math.min(rect.width / 2, 24)
    y = rect.top + rect.height / 2
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) return

  const key = Symbol.for('hermes.browser.cursor')
  let state = window[key]

  if (!state || !state.host.isConnected) {
    const host = document.createElement('hermes-agent-cursor')
    host.setAttribute('aria-hidden', 'true')
    host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;'
    const root = host.attachShadow({ mode: 'closed' })
    root.innerHTML = `<style>
      :host, * { pointer-events: none !important; }
      .pointer { position: fixed; left: 0; top: 0; width: 30px; height: 36px;
        opacity: 0; transition: opacity 120ms; will-change: transform; }
      .halo { position: absolute; left: -15px; top: -13px; width: 52px; height: 52px;
        border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--mira-cursor-color) 55%, transparent), color-mix(in srgb, var(--mira-cursor-color) 18%, transparent) 45%, transparent 72%); }
      svg { position: relative; width: 25px; height: 31px;
        filter: drop-shadow(0 0 3px var(--mira-cursor-color)) drop-shadow(0 1px 1px #16334255); }
      .label { position: absolute; top: 25px; left: 16px; white-space: nowrap;
        padding: 4px 8px; border-radius: 8px; background: color-mix(in srgb, var(--mira-cursor-color) 12%, white);
        border: 1px solid color-mix(in srgb, var(--mira-cursor-color) 55%, transparent);
        color: #073c43; font: 600 12px/1.4 system-ui, sans-serif; box-shadow: 0 2px 7px #16334226; }
      .ring { position: fixed; width: 32px; height: 32px; border: 2px solid var(--mira-cursor-color);
        border-radius: 50%; box-sizing: border-box; opacity: 0; }
    </style><div class="ring"></div><div class="pointer"><div class="halo"></div>
      <svg viewBox="0 0 25 31"><path d="M2 2L21 13L12 15L8 25Z" fill="var(--mira-cursor-color)" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg><span class="label"></span>
    </div>`
    document.documentElement.append(host)
    state = { host, pointer: root.querySelector('.pointer'), ring: root.querySelector('.ring'), label: root.querySelector('.label'), x: null, y: null, timer: null }
    window[key] = state
  }

  clearTimeout(state.timer)
  state.host.style.setProperty('--mira-cursor-color', event.color)
  const actions = { click: '正在点击', focus: '正在输入', move: '正在操作', scroll: '正在滚动' }
  state.label.textContent = `${event.label} ${actions[event.kind] || actions.move}`
  state.label.style.left = x > innerWidth - 160 ? '-125px' : '16px'
  state.label.style.top = y > innerHeight - 70 ? '-28px' : '25px'
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const moved = state.x !== null && Math.hypot(x - state.x, y - state.y) > 2
  const duration = moved && !reducedMotion && event.kind !== 'focus' ? 220 : 0
  state.pointer.style.opacity = '1'
  state.pointer.style.transition = `transform ${duration}ms ease-out, opacity 120ms`
  state.pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`
  state.x = x
  state.y = y
  if (duration) await new Promise(resolve => setTimeout(resolve, duration))

  if (event.kind === 'click') {
    state.ring.style.left = `${x}px`
    state.ring.style.top = `${y}px`
    state.ring.animate([
      { transform: 'translate(-50%, -50%) scale(.35)', opacity: .9 },
      { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 }
    ], { duration: reducedMotion ? 120 : 650 })
  }
  state.timer = setTimeout(() => { state.host.remove() }, 4500)
}
