import { useState, useEffect, useCallback, useRef } from 'react'

interface Slide {
  image: string
  word:  string
  tag:   string
  desc:  string
}

const slides: Slide[] = [
  {
    image: '/images/banner/banner_1.png',
    word:  'GrafiVisión',
    tag:   'Más de 33 años en artes gráficas',
    desc:  'Soluciones integrales en impresión y producción publicitaria en Bogotá.',
  },
  {
    image: '/images/banner/banner_2.png',
    word:  'Empaques',
    tag:   'Diseño y producción de empaques',
    desc:  'Cajas, estuches y packaging con acabados de lujo para tu marca.',
  },
  {
    image: '/images/banner/banner_3.png',
    word:  'Offset',
    tag:   'Impresión Offset & Digital',
    desc:  'Alta definición y fidelidad de color en tirajes cortos y grandes volúmenes.',
  },
  {
    image: '/images/banner/banner_4.png',
    word:  'Formato',
    tag:   'Gran Formato & Material POP',
    desc:  'Pendones, vinilos, exhibidores y piezas de alto impacto visual.',
  },
]

const INTERVAL   = 5800
const ENTER_MS   = 750
const EXIT_MS    = 900   // EXIT > ENTER: old slide stays visible until new fully covers
const CLEAR_MS   = 1050  // fires after EXIT_MS

function padTwo(n: number) { return String(n).padStart(2, '0') }

export function HeroSlider() {
  const [current,     setCurrent]     = useState(0)
  const [prev,        setPrev]        = useState<number | null>(null)
  const [animKey,     setAnimKey]     = useState(0)
  const [direction,   setDirection]   = useState<'ltr' | 'rtl'>('ltr')
  const [enterCounts, setEnterCounts] = useState<number[]>(() => slides.map((_, i) => i === 0 ? 1 : 0))
  const [exitCounts,  setExitCounts]  = useState<number[]>(() => slides.map(() => 0))

  const touchX        = useRef<number | null>(null)
  const sectionRef    = useRef<HTMLElement>(null)
  const wheelCooldown = useRef(false)
  // Skip brush-in on very first render — no previous slide to reveal over
  const isFirstRender = useRef(true)
  // Refs for cursor parallax (one per slide)
  const parallaxRefs  = useRef<(HTMLDivElement | null)[]>(slides.map(() => null))

  const goTo = useCallback((index: number, dir: 'ltr' | 'rtl' = 'ltr') => {
    isFirstRender.current = false
    const leaving = current
    setDirection(dir)
    setPrev(leaving)
    setCurrent(index)
    setAnimKey(k => k + 1)
    setEnterCounts(c => c.map((v, i) => i === index  ? v + 1 : v))
    setExitCounts (c => c.map((v, i) => i === leaving ? v + 1 : v))
  }, [current])

  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, 'rtl'), [current, goTo])
  const goNext = useCallback(() => goTo((current + 1) % slides.length, 'ltr'), [current, goTo])

  // Clear prev AFTER enter animation completes (no re-render mid-animation)
  useEffect(() => {
    if (prev === null) return
    const t = setTimeout(() => setPrev(null), CLEAR_MS)
    return () => clearTimeout(t)
  }, [prev])

  // Keep nav refs current for wheel handler
  const goNextRef = useRef(goNext)
  const goPrevRef = useRef(goPrev)
  useEffect(() => { goNextRef.current = goNext }, [goNext])
  useEffect(() => { goPrevRef.current = goPrev }, [goPrev])

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(goNext, INTERVAL)
    return () => clearInterval(timer)
  }, [goNext])

  // Wheel + trackpad horizontal
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (wheelCooldown.current) return
      const absX = Math.abs(e.deltaX), absY = Math.abs(e.deltaY)
      const isH = absX > absY && absX > 15
      const isV = absY > absX && absY > 25
      if (!isH && !isV) return
      e.preventDefault()
      wheelCooldown.current = true
      setTimeout(() => { wheelCooldown.current = false }, 750)
      const forward = isH ? e.deltaX > 0 : e.deltaY > 0
      forward ? goNextRef.current() : goPrevRef.current()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Cursor parallax — CSS transition handles smoothness, no RAF needed
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left)  / r.width  - 0.5) * 20
    const y = ((e.clientY - r.top)   / r.height - 0.5) * 12
    const tf = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(1.06)`
    parallaxRefs.current.forEach(div => { if (div) div.style.transform = tf })
  }, [])

  const handleMouseLeave = useCallback(() => {
    parallaxRefs.current.forEach(div => {
      if (div) div.style.transform = 'translate3d(0px,0px,0) scale(1.06)'
    })
  }, [])

  // Touch/pointer swipe
  const handlePointerDown = (e: React.PointerEvent) => { touchX.current = e.clientX }
  const handlePointerUp   = (e: React.PointerEvent) => {
    if (touchX.current === null) return
    const delta = e.clientX - touchX.current
    touchX.current = null
    if (Math.abs(delta) < 40) return
    delta < 0 ? goNext() : goPrev()
  }

  const slide = slides[current]

  return (
    <section
      ref={sectionRef}
      data-glow-exclude
      className="group relative flex min-h-[calc(100dvh-4rem)] xl:min-h-[calc(100dvh-5rem)] items-center justify-center"
      aria-label="Hero — GrafiVisión"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Background slides ───────────────────────────────────── */}
      {/* bg-black: insurance — any gap in clip-path shows dark, not the page background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
        {slides.map((s, i) => {
          const isActive  = i === current
          const isExiting = i === prev
          const isIdle    = !isActive && !isExiting

          let divKey: string
          let anim:   string | undefined

          if (isActive) {
            divKey = `enter-${i}-${enterCounts[i]}`
            // No brush-in on very first render (nothing behind to reveal over)
            anim = isFirstRender.current
              ? undefined
              : `enter-${direction} ${ENTER_MS}ms cubic-bezier(0.4,0,0.2,1) both`
          } else if (isExiting) {
            divKey = `exit-${i}-${exitCounts[i]}`
            anim   = `exit-slide ${EXIT_MS}ms ease-in both`
          } else {
            divKey = `idle-${i}`
            anim   = undefined
          }

          return (
            <div
              key={s.image}
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                zIndex:  isActive ? 2 : isExiting ? 1 : 0,
                // Idle slides fully hidden — never visible through clip-path gaps
                opacity: isIdle ? 0 : undefined,
              }}
            >
              {/* Brush-in / fade-out wrapper */}
              <div
                key={divKey}
                className="absolute inset-0"
                style={anim ? { animation: anim, willChange: 'clip-path' } : undefined}
              >
                {/* Parallax container — CSS transition for smooth mouse follow */}
                <div
                  ref={el => { parallaxRefs.current[i] = el }}
                  className="absolute inset-0"
                  style={{
                    transform:  'scale(1.06)',
                    transition: 'transform 1.4s cubic-bezier(0.25,0.46,0.45,0.94)',
                    willChange: 'transform',
                  }}
                >
                  <img
                    src={s.image}
                    alt=""
                    width="1440"
                    height="900"
                    className="h-full w-full object-cover"
                    loading="eager"
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding={i === 0 ? 'sync' : 'async'}
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/38" />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Arrow: Previous ─────────────────────────────────────── */}
      <button
        type="button"
        aria-label="Diapositiva anterior"
        onClick={goPrev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:border-white/70 hover:bg-black/45 active:scale-90 xl:left-8 xl:h-14 xl:w-14"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── Arrow: Next ─────────────────────────────────────────── */}
      <button
        type="button"
        aria-label="Siguiente diapositiva"
        onClick={goNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:border-white/70 hover:bg-black/45 active:scale-90 xl:right-8 xl:h-14 xl:w-14"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Text content ────────────────────────────────────────── */}
      <div
        key={animKey}
        className="container-content section-padding relative z-10 flex flex-col items-center py-32 text-center"
      >
        <p
          className="animate-hero-cta mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-white/85"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
        >
          {slide.tag}
        </p>
        <div className="animate-hero-cta mb-6 h-px w-16 bg-white/40" aria-hidden="true" style={{ animationDelay: '0.1s' }} />
        <h1
          className="animate-hero-word font-display text-6xl font-bold leading-none tracking-tight text-white xl:text-8xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.4)' }}
        >
          {slide.word}
        </h1>
        <p
          className="animate-hero-tag mt-4 text-lg font-medium text-white/90 xl:text-2xl"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.65)' }}
        >
          {slide.desc}
        </p>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────── */}
      <button
        type="button"
        aria-label="Ir a la siguiente sección"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.92, behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 transition-opacity duration-300 hover:opacity-90"
      >
        <div className="relative h-9 w-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <span
            className="animate-scroll-drop absolute inset-x-0 h-4 rounded-full"
            style={{ background: 'rgba(232,34,43,0.75)' }}
            aria-hidden="true"
          />
        </div>
        <svg width="9" height="5" viewBox="0 0 9 5" fill="none" stroke="rgba(232,34,43,0.8)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M1 1l3.5 3L8 1" />
        </svg>
      </button>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 z-10 w-full px-6 xl:px-10">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-semibold tabular-nums tracking-widest text-white/50 select-none">
            {padTwo(current + 1)}&thinsp;<span className="text-white/25">/</span>&thinsp;{padTwo(slides.length)}
          </span>
          <div role="tablist" aria-label="Diapositivas" className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Diapositiva ${i + 1}`}
                onClick={() => goTo(i, i > current ? 'ltr' : 'rtl')}
                className={[
                  'h-1.5 rounded-full transition-all duration-500',
                  i === current ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70',
                ].join(' ')}
              />
            ))}
          </div>
          <span className="w-10 select-none" aria-hidden="true" />
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <div
        key={`p-${current}`}
        aria-hidden="true"
        className="absolute top-0 left-0 z-10 h-0.5 w-full origin-left bg-brand-red/80"
        style={{ animation: `slider-progress ${INTERVAL}ms linear both` }}
      />

      {/* ── Splash decorativo ─────────────────────────────────────── */}
      <img
        src="/images/splash.png"
        alt=""
        aria-hidden="true"
        width="320"
        height="320"
        loading="eager"
        decoding="sync"
        className="pointer-events-none select-none absolute bottom-0 left-28 md:left-32 xl:left-44 2xl:left-52 z-20 w-60 xl:w-80"
      />
    </section>
  )
}
