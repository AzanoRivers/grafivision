// Fluid smoky cursor — destination-out decay + radial gradients + mix-blend-mode:multiply
// Técnica: en vez de clearRect, se aplica destination-out lento → los blobs "lingan"
// como fluido y se disipan. mix-blend-mode:multiply en CSS hace que sobre fondo blanco
// los colores sean visibles; píxeles transparentes no afectan la página.

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  targetRadius: number
  alpha: number
  life: number
  hue: number
}

// Paleta fija: cada partícula del mismo spawn tiene color distinto → se mezclan
const PALETTE = [356, 322, 14, 338, 0]  // rojo, rosa, naranja-rojo, carmín, rojo puro
const SPAWN_N = 5
const MAX_P   = 100
const DECAY   = 0.022  // destination-out por frame

function startSmoke(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight

  const particles: Particle[] = []
  let isExcluded = false
  let rafId      = 0
  let lastTime   = performance.now()
  let lastSpawnX = -9999
  let lastSpawnY = -9999

  function spawn(x: number, y: number) {
    for (let i = 0; i < SPAWN_N; i++) {
      if (particles.length >= MAX_P) particles.shift()
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 1.8 + 0.4
      // Cada partícula del spawn toma un color distinto de la paleta → coexisten y se mezclan
      const hue = PALETTE[i % PALETTE.length] + (Math.random() - 0.5) * 12
      particles.push({
        x:            x + (Math.random() - 0.5) * 55,
        y:            y + (Math.random() - 0.5) * 55,
        vx:           Math.cos(angle) * speed * 0.35,
        vy:           Math.sin(angle) * speed * 0.35 - 0.55,
        radius:       Math.random() * 18 + 8,
        targetRadius: Math.random() * 90 + 45,
        alpha:        0.22 + Math.random() * 0.14,
        life:         1,
        hue,
      })
    }
  }

  function render() {
    const now = performance.now()
    const dt  = Math.min((now - lastTime) / 16.67, 2.5)
    lastTime  = now

    // Decay lento — humo linga y se desvanece gradualmente (no clearRect)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = `rgba(0,0,0,${(DECAY * dt).toFixed(4)})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Pintar partículas con gradiente radial suave
    ctx.globalCompositeOperation = 'source-over'

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]

      p.x      += p.vx * dt
      p.y      += p.vy * dt
      p.vy     -= 0.014 * dt                          // sube lentamente
      p.vx     += (Math.random() - 0.5) * 0.06        // turbulencia suave
      p.radius += (p.targetRadius - p.radius) * 0.035 // expande
      p.life   -= 0.009 * dt

      if (p.life <= 0) { particles.splice(i, 1); continue }

      const a = p.alpha * p.life
      const r = Math.max(0.1, p.radius)
      const h = p.hue.toFixed(0)

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
      g.addColorStop(0,   `hsla(${h},88%,45%,${a.toFixed(3)})`)
      g.addColorStop(0.35,`hsla(${h},82%,52%,${(a * 0.65).toFixed(3)})`)
      g.addColorStop(1,   `hsla(${h},78%,58%,0)`)

      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    rafId = requestAnimationFrame(render)
  }

  const onResize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }

  const onMove = (e: MouseEvent) => {
    const el = e.target instanceof Element ? e.target : null
    isExcluded = !!el?.closest('[data-glow-exclude]')
    if (isExcluded) return
    canvas.classList.add('is-active')
    const dx = e.clientX - lastSpawnX
    const dy = e.clientY - lastSpawnY
    if (dx * dx + dy * dy < 14 * 14) return
    lastSpawnX = e.clientX
    lastSpawnY = e.clientY
    spawn(e.clientX, e.clientY)
  }

  const onLeave = () => canvas.classList.remove('is-active')

  window.addEventListener('resize', onResize, { passive: true })
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)

  render()

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

export function initCursorTrail(): (() => void) | undefined {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(hover: hover)').matches) return

  const canvas = document.getElementById('cursor-trail') as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  return startSmoke(canvas as HTMLCanvasElement, ctx as CanvasRenderingContext2D)
}
