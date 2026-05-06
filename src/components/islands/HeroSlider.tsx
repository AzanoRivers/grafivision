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
  mobileImage?: string
}

const MOBILE_BASE = '/images/banner/Nuevos%2006052026/mobile'

const slides: Slide[] = [
  { image: '/images/banner/banner-1-ia-no-redes.png', mobileImage: `${MOBILE_BASE}/banner-home-1.png` },
  { image: '/images/banner/banner-2-empaques.png',    mobileImage: `${MOBILE_BASE}/banner-home-2.png` },
  { image: '/images/banner/banner-3-impresiones.png', mobileImage: `${MOBILE_BASE}/banner-home-3.png` },
  { image: '/images/banner/banner-4-material-pop.png', mobileImage: `${MOBILE_BASE}/banner-home-4.png` },
]

const INTERVAL = 5800
const ENTER_MS = 750
const CLEAR_MS = ENTER_MS + 200

const RAINBOW = 'linear-gradient(90deg, #E8222B 0%, #FF6B35 16%, #FFD700 33%, #22C55E 50%, #3B82F6 66%, #8B5CF6 83%, #EC4899 100%)'
const SECTION_BG = 'linear-gradient(135deg, #fff5f5 0%, #fff9f0 25%, #f0fff4 50%, #f0f0ff 75%, #fff5fb 100%)'

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
    await img.decode()
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
  const [imagesReady, setImagesReady] = useState<boolean[]>(() =>
    slides.map(() => false)
  )
  const [skeletonOut, setSkeletonOut] = useState(false)
  const [skeletonGone, setSkeletonGone] = useState(false)

  // ── Refs ──────────────────────────────────────────────────────────
  const touchX = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const isFirstRender = useRef(true)
  const animDivRefs = useRef<(HTMLDivElement | null)[]>(slides.map(() => null))
  const currentRef = useRef(0)
  useEffect(() => { currentRef.current = current }, [current])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => goNextRef.current(), INTERVAL)
  }, [])

  // ── Imperative animation restart (useLayoutEffect) ──────────────────────
  useLayoutEffect(() => {
    if (isFirstRender.current) return
    const div = animDivRefs.current[current]
    if (!div) return
    div.style.animation = 'none'
    void div.offsetWidth
    div.style.animation = `enter-${direction} ${ENTER_MS}ms cubic-bezier(0.4,0,0.2,1) both`
    div.style.willChange = 'clip-path'
    const cleanup = setTimeout(() => { if (div) div.style.willChange = 'auto' }, ENTER_MS + 50)
    return () => clearTimeout(cleanup)
  }, [current, direction]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ────────────────────────────────────────────────────
  const goTo = useCallback((index: number, dir: 'ltr' | 'rtl' = 'ltr') => {
    const s = slides[index]
    const toLoad = s.mobileImage ? [s.image, s.mobileImage] : [s.image]
    Promise.all(toLoad.map(preloadImage)).then(() => {
      setImagesReady(r => r.map((v, i) => i === index ? true : v))
      isFirstRender.current = false
      const leaving = currentRef.current
      setDirection(dir)
      setPrev(leaving)
      setCurrent(index)
      setAnimKey(k => k + 1)
      resetTimer()
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

  const goNextRef = useRef(goNext)
  const goPrevRef = useRef(goPrev)
  useEffect(() => { goNextRef.current = goNext }, [goNext])
  useEffect(() => { goPrevRef.current = goPrev }, [goPrev])

  useEffect(() => {
    if (prev === null) return
    const t = setTimeout(() => setPrev(null), CLEAR_MS)
    return () => clearTimeout(t)
  }, [prev])

  useEffect(() => {
    slides.forEach((s, i) => {
      const toLoad = s.mobileImage ? [s.image, s.mobileImage] : [s.image]
      Promise.all(toLoad.map(preloadImage)).then(() => {
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

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current !== null) clearInterval(timerRef.current) }
  }, [resetTimer])

  // Touch/pointer swipe
  const handlePointerDown = (e: React.PointerEvent) => { touchX.current = e.clientX }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchX.current === null) return
    const delta = e.clientX - touchX.current
    touchX.current = null
    if (Math.abs(delta) < 40) return
    delta < 0 ? goNext() : goPrev()
  }

  return (
    <section
      ref={sectionRef}
      data-glow-exclude
      className="group relative flex min-h-[calc(100dvh-4rem)] xl:min-h-[calc(100dvh-5rem)] items-center justify-center overflow-hidden"
      aria-label="Hero — GrafiVisión"
      style={{ background: SECTION_BG }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* ── Background slides ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
                opacity: (isIdle || (isActive && !imagesReady[i])) ? 0 : undefined,
              }}
            >
              <div
                ref={el => { animDivRefs.current[i] = el }}
                className="absolute inset-0"
              >
                <img
                  src={s.image}
                  alt=""
                  width="1440"
                  height="900"
                  className="hidden xl:block h-full w-full object-cover object-top"
                  loading="eager"
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding={i === 0 ? 'sync' : 'async'}
                />
                {s.mobileImage && (
                  <img
                    src={s.mobileImage}
                    alt=""
                    width="750"
                    height="1334"
                    className="block xl:hidden h-full w-full object-cover object-center"
                    loading="eager"
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding={i === 0 ? 'sync' : 'async'}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── White fade at bottom — contrast for controls ─────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] h-40"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.0) 100%)' }}
      />

      {/* ── Rainbow accent strip ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-[3px]"
        style={{ background: RAINBOW }}
      />

      {/* ── Arrow: Previous ─────────────────────────────────────── */}
      <button
        type="button"
        aria-label="Diapositiva anterior"
        onClick={goPrev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all duration-300 hover:border-brand-red hover:text-brand-red hover:shadow-lg active:scale-90 xl:left-8 xl:h-14 xl:w-14"
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
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all duration-300 hover:border-brand-red hover:text-brand-red hover:shadow-lg active:scale-90 xl:right-8 xl:h-14 xl:w-14"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-0 z-10 w-full px-6 xl:px-10">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-semibold tabular-nums tracking-widest text-gray-500 select-none">
            {padTwo(current + 1)}&thinsp;<span className="text-gray-300">/</span>&thinsp;{padTwo(slides.length)}
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
                  i === current ? 'w-8' : 'w-3 bg-gray-400/50 hover:bg-gray-500/60',
                ].join(' ')}
                style={i === current ? { background: RAINBOW } : undefined}
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
        className="absolute top-0 left-0 z-10 h-0.5 w-full origin-left"
        style={{
          background: RAINBOW,
          animation: `slider-progress ${INTERVAL}ms linear both`,
        }}
      />

      {/* ── Loading skeleton ─────────────────────────────────────────
          Light theme to match the new rainbow/white background. */}
      {!skeletonGone && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
          style={{
            background: SECTION_BG,
            opacity: skeletonOut ? 0 : 1,
            transition: 'opacity 600ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Rainbow shimmer sweep */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg,transparent 0%,rgba(232,34,43,0.05) 30%,rgba(139,92,246,0.08) 50%,rgba(59,130,246,0.05) 70%,transparent 100%)',
              animation: 'sk-glint 2.4s ease-in-out infinite',
            }}
          />

          {/* ── Rainbow spinner ─────────────────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
            <svg
              width="88" height="88" viewBox="0 0 88 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ animation: 'breathe-scale 3.2s ease-in-out infinite' }}
            >
              <defs>
                {/* Outer arc: violet → magenta */}
                <linearGradient id="sk-g1" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#8B5CF6" />
                  <stop offset="65%"  stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
                </linearGradient>
                {/* Middle arc: red → orange → yellow */}
                <linearGradient id="sk-g2" x1="88" y1="0" x2="0" y2="88" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#E8222B" />
                  <stop offset="55%"  stopColor="#FF6B35" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                </linearGradient>
                {/* Inner arc: blue → green */}
                <linearGradient id="sk-g3" x1="0" y1="88" x2="88" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#3B82F6" />
                  <stop offset="65%"  stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                </linearGradient>
                {/* Soft glow filter */}
                <filter id="sk-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Track rings — barely visible guides */}
              <circle cx="44" cy="44" r="38" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
              <circle cx="44" cy="44" r="28" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
              <circle cx="44" cy="44" r="18" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />

              {/* Outer arc — violet/magenta, slow CCW, 240° arc */}
              <circle
                cx="44" cy="44" r="38"
                stroke="url(#sk-g1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="160 79"
                filter="url(#sk-glow)"
                style={{ animation: 'spin 3s linear infinite reverse', transformOrigin: '44px 44px' }}
              />

              {/* Middle arc — red/orange/yellow, medium CW, 240° arc */}
              <circle
                cx="44" cy="44" r="28"
                stroke="url(#sk-g2)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="118 58"
                filter="url(#sk-glow)"
                style={{ animation: 'spin 2s linear infinite', transformOrigin: '44px 44px' }}
              />

              {/* Inner arc — blue/green, fast CCW, 240° arc */}
              <circle
                cx="44" cy="44" r="18"
                stroke="url(#sk-g3)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="75 38"
                filter="url(#sk-glow)"
                style={{ animation: 'spin 1.3s linear infinite reverse', transformOrigin: '44px 44px' }}
              />

              {/* Center dot — warm gradient */}
              <circle cx="44" cy="44" r="4" fill="url(#sk-g2)" opacity="0.7" />
            </svg>
          </div>

          {/* Bottom nav dots (mirrors actual dot bar) */}
          <div className="absolute bottom-5 right-6 xl:right-10 flex items-center gap-3">
            <div className="h-1.5 w-8 rounded-full bg-gray-300/60" />
            <div className="h-1.5 w-3 rounded-full bg-gray-300/40" />
            <div className="h-1.5 w-3 rounded-full bg-gray-300/40" />
            <div className="h-1.5 w-3 rounded-full bg-gray-300/40" />
          </div>

          {/* Top progress bar placeholder */}
          <div className="absolute top-0 left-0 h-0.5 w-full" style={{ background: RAINBOW, opacity: 0.2 }} />

          {/* Rainbow strip */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: RAINBOW }} />
        </div>
      )}
    </section>
  )
}
