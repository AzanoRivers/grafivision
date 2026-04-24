import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Architecture: no React `key` changes on the animation div.
 * Previous approach changed `key` to restart CSS animations — this caused
 * React to unmount+remount the element, creating a 1-frame window where
 * no slide image was visible, showing the bg-black container.
 *
 * Fix: animation divs are NEVER unmounted. The animation is restarted
 * imperatively via refs (set animation='none', read offsetWidth to force
 * reflow, re-apply animation). This is the standard browser technique
 * for restarting a CSS animation on a live element.
 *
 * Additionally: all async callbacks (goTo, interval) use refs instead of
 * closures over `current` to eliminate stale-closure bugs.
 */

interface Slide {
  image: string
  word: string
  tag: string
  desc: string
}

const slides: Slide[] = [
  {
    image: '/images/banner/banner_1.png',
    word: 'GrafiVisión',
    tag: 'Más de 33 años en artes gráficas',
    desc: 'Soluciones integrales en impresión y producción publicitaria en Bogotá.',
  },
  {
    image: '/images/banner/banner_2.png',
    word: 'Empaques',
    tag: 'Diseño y producción de empaques',
    desc: 'Cajas, estuches y packaging con acabados de lujo para tu marca.',
  },
  {
    image: '/images/banner/banner_3.png',
    word: 'Offset',
    tag: 'Impresión Offset & Digital',
    desc: 'Alta definición y fidelidad de color en tirajes cortos y grandes volúmenes.',
  },
  {
    image: '/images/banner/banner_4.png',
    word: 'Formato',
    tag: 'Gran Formato & Material POP',
    desc: 'Pendones, vinilos, exhibidores y piezas de alto impacto visual.',
  },
]

const INTERVAL = 5800
const ENTER_MS = 750
const CLEAR_MS = ENTER_MS + 200

// Module-level image cache — persists across re-renders
const imageCache = new Set<string>()

// Uses img.decode() — waits for BOTH network download AND pixel decode to complete.
// img.onload only signals download done; decoding="async" defers pixel decode, which
// causes the browser to show a black frame when the slide is made visible before
// the decode finishes. decode() guarantees the browser can paint immediately.
async function preloadImage(src: string): Promise<void> {
  if (imageCache.has(src)) return
  const img = new window.Image()
  img.src = src
  try {
    await img.decode() // download + decode — browser can paint instantly after this
  } catch {
    // decode() can reject for SVGs or unsupported formats — never block on error
  }
  imageCache.add(src)
}

function padTwo(n: number) { return String(n).padStart(2, '0') }

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [animKey, setAnimKey] = useState(0)
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  // Tracks confirmed-loaded slides — prevents bg-black showing on unloaded images
  const [imagesReady, setImagesReady] = useState<boolean[]>(() =>
    slides.map(() => false) // all start false; slide 0 becomes true after decode
  )
  // Skeleton states: skeletonOut triggers fade, skeletonGone unmounts after fade
  const [skeletonOut, setSkeletonOut] = useState(false)
  const [skeletonGone, setSkeletonGone] = useState(false)

  // ── Refs ──────────────────────────────────────────────────────────
  const touchX = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isFirstRender = useRef(true)
  // Animation wrapper divs — restarted imperatively, never unmounted
  const animDivRefs = useRef<(HTMLDivElement | null)[]>(slides.map(() => null))
  // Always-fresh current index — avoids stale closures in async/timer callbacks
  const currentRef = useRef(0)
  useEffect(() => { currentRef.current = current }, [current])

  // Interval ref — lets any navigation call reset the timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => goNextRef.current(), INTERVAL)
  }, [])

  // ── Imperative animation restart (useLayoutEffect) ──────────────────────
  // MUST be useLayoutEffect, not useEffect.
  // useEffect fires AFTER the browser paints — the new slide would be visible
  // for one frame without clip-path (full image flash) before the animation starts.
  // useLayoutEffect fires synchronously after DOM mutations and BEFORE paint,
  // so the clip-path is already set when the browser renders the first frame.
  useLayoutEffect(() => {
    if (isFirstRender.current) return
    const div = animDivRefs.current[current]
    if (!div) return
    div.style.animation = 'none'
    void div.offsetWidth // force reflow — resets animation state in the GPU
    div.style.animation = `enter-${direction} ${ENTER_MS}ms cubic-bezier(0.4,0,0.2,1) both`
    div.style.willChange = 'clip-path'
    const cleanup = setTimeout(() => { if (div) div.style.willChange = 'auto' }, ENTER_MS + 50)
    return () => clearTimeout(cleanup)
  }, [current, direction]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ────────────────────────────────────────────────────
  const goTo = useCallback((index: number, dir: 'ltr' | 'rtl' = 'ltr') => {
    // Block until image confirmed loaded — prevents bg-black showing
    preloadImage(slides[index].image).then(() => {
      setImagesReady(r => r.map((v, i) => i === index ? true : v))
      isFirstRender.current = false
      const leaving = currentRef.current // always fresh — no stale closure
      setDirection(dir)
      setPrev(leaving)
      setCurrent(index)
      setAnimKey(k => k + 1)
      resetTimer() // reset interval so next auto-advance is always INTERVAL ms away
    })
  }, [resetTimer])

  const goPrev = useCallback(() => {
    const idx = (currentRef.current - 1 + slides.length) % slides.length
    goTo(idx, 'rtl')
  }, [goTo])

  const goNext = useCallback(() => {
    const idx = (currentRef.current + 1) % slides.length
    goTo(idx, 'ltr')
  }, [goTo])

  // Stable handler refs for effects that must not re-subscribe on every render
  const goNextRef = useRef(goNext)
  const goPrevRef = useRef(goPrev)
  useEffect(() => { goNextRef.current = goNext }, [goNext])
  useEffect(() => { goPrevRef.current = goPrev }, [goPrev])

  // Clear exiting slide after brush animation completes
  useEffect(() => {
    if (prev === null) return
    const t = setTimeout(() => setPrev(null), CLEAR_MS)
    return () => clearTimeout(t)
  }, [prev])

  // Eager preload all images on mount
  useEffect(() => {
    slides.forEach((s, i) => {
      preloadImage(s.image).then(() => {
        setImagesReady(r => {
          const next = [...r]
          next[i] = true
          return next
        })
        if (i === 0) {
          setSkeletonOut(true)
          setTimeout(() => setSkeletonGone(true), 750)
        }
      })
    })
  }, [])

  // Auto-advance — start timer on mount; goTo resets it on every navigation
  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current !== null) clearInterval(timerRef.current) }
  }, [resetTimer])

  // Wheel / trackpad navigation intentionally removed.

  // Touch/pointer swipe
  const handlePointerDown = (e: React.PointerEvent) => { touchX.current = e.clientX }
  const handlePointerUp = (e: React.PointerEvent) => {
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
    >
      {/* ── Background slides ───────────────────────────────────── */}
      {/*
        ARCHITECTURE: All 4 slide containers stay permanently mounted (no unmounting).
        The animation wrapper div (animDivRefs) never changes key — its animation is
        restarted imperatively via useEffect above. This eliminates the unmount/remount
        flash that caused the bg-black to show through for one browser frame.
      */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
        {slides.map((s, i) => {
          const isActive = i === current
          const isExiting = i === prev
          const isIdle = !isActive && !isExiting

          return (
            <div
              key={s.image}
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                zIndex: isActive ? 2 : isExiting ? 1 : 0,
                // Idle slides fully hidden. Active slide hidden until image confirmed
                // loaded — prevents bg-black showing through on slow connections.
                opacity: (isIdle || (isActive && !imagesReady[i])) ? 0 : undefined,
              }}
            >
              {/* Animation wrapper — ref-controlled, never unmounted, never re-keyed */}
              <div
                ref={el => { animDivRefs.current[i] = el }}
                className="absolute inset-0"
              >
                <img
                  src={s.image}
                  alt=""
                  width="1440"
                  height="900"
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding={i === 0 ? 'sync' : 'async'}
                />

                {/* Overlays */}
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

      {/* ── Loading skeleton ─────────────────────────────────────────
          Shows while slide 0 image is downloading + decoding.
          Fades out (skeletonOut) then unmounts (skeletonGone).
          Dark bg with red-tinted shimmer sweep matching brand palette. */}
      {!skeletonGone && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#111]"
          style={{
            opacity: skeletonOut ? 0 : 1,
            transition: 'opacity 600ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Shimmer sweep */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg,transparent 0%,rgba(232,34,43,0.06) 30%,rgba(255,150,150,0.11) 50%,rgba(232,34,43,0.06) 70%,transparent 100%)',
              animation: 'sk-glint 2.4s ease-in-out infinite',
            }}
          />

          {/* Content placeholders — mirrors real hero layout */}
          <div className="relative flex flex-col items-center gap-5 w-full max-w-xl px-8">
            {/* Tag badge */}
            <div className="h-2.5 w-28 rounded-full bg-white/7" />
            {/* Divider */}
            <div className="h-px w-12 bg-white/6" />
            {/* Big word title */}
            <div className="h-16 w-56 rounded-2xl bg-white/8 xl:h-24 xl:w-72" />
            {/* Subtitle line 1 */}
            <div className="h-3 w-64 rounded-full bg-white/6" />
            {/* Subtitle line 2 */}
            <div className="h-3 w-48 rounded-full bg-white/5" />
          </div>

          {/* Bottom nav dots (mirrors actual dot bar) */}
          <div className="absolute bottom-8 right-6 xl:right-10 flex items-center gap-3">
            <div className="h-1.5 w-8 rounded-full bg-white/8" />
            <div className="h-1.5 w-3 rounded-full bg-white/6" />
            <div className="h-1.5 w-3 rounded-full bg-white/6" />
            <div className="h-1.5 w-3 rounded-full bg-white/6" />
          </div>

          {/* Top progress bar placeholder */}
          <div className="absolute top-0 left-0 h-0.5 w-full bg-brand-red/15" />
        </div>
      )}
    </section>
  )
}
