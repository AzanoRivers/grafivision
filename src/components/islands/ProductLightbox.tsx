import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ProductLightbox.module.css'

interface Props {
  images: string[]
  startIndex: number
  onClose: () => void
}

function cardDelta(imgIdx: number, offset: number, total: number): number {
  let d = imgIdx - offset
  d = d - total * Math.round(d / total)
  return d
}

function applyCardTransforms(
  cardDoms: Map<number, HTMLButtonElement>,
  cardInnerDoms: Map<number, HTMLDivElement>,
  offset: number,
  total: number,
  viewportW: number,
) {
  const W       = viewportW
  const isSmall = W < 1280
  const isTiny  = W < 440

  for (const [slotIdx, el] of cardDoms.entries()) {
    const d = cardDelta(slotIdx, offset, total)
    const a = Math.abs(d)
    const s = d < 0 ? -1 : 1

    if (a > 2.6) {
      // Skip DOM mutation when already hidden — avoids style recalcs on distant slots
      if (el.style.opacity !== '0') {
        el.style.opacity       = '0'
        el.style.pointerEvents = 'none'
      }
      continue
    }

    let tx: number, tz: number, ry: number,
        opacity: number, bright: number, sat: number, zi: number

    if (a <= 1) {
      const arc = Math.sin(a * Math.PI / 2)
      tx      =  s * a * W * 0.46
      tz      = -arc * 300
      ry      = -s * a * 52
      opacity = 1 - a * 0.22
      bright  = 1.0 - a * 0.12
      sat     = 1.1 - a * 0.1
      zi      = 5 + Math.round((1 - a) * 5)
    } else {
      const t = a - 1
      tx      =  s * (W * 0.46 + t * W * 0.68)
      tz      = -300 - t * 200
      ry      = -s * (52 - t * 18)
      opacity = Math.max(0, 0.78 - t * 0.78)
      bright  = 0.88 - t * 0.5
      sat     = 1.0 - t * 0.65
      zi      = Math.max(0, 4 - Math.round(t * 3))
    }

    const st         = el.style
    st.transform     = `translateX(${tx.toFixed(0)}px) translateZ(${tz.toFixed(0)}px) rotateY(${ry.toFixed(1)}deg)`
    st.opacity       = Math.max(0, opacity).toFixed(3)
    st.filter        = `brightness(${bright.toFixed(2)}) saturate(${sat.toFixed(2)})`
    st.zIndex        = String(Math.max(0, zi))
    st.pointerEvents = a < 1.5 ? 'auto' : 'none'
    st.cursor        = a < 0.15 ? 'default' : 'pointer'

    const inner = cardInnerDoms.get(slotIdx)
    if (inner) {
      const vwActive  = isTiny ? 92 : isSmall ? 80 : 58
      const vwSide    = isSmall ? 44 : 40
      const vwEdge    = 22
      const maxActive = isTiny ? W * 0.92 : isSmall ? W * 0.80 : 820
      const maxSide   = isSmall ? W * 0.44 : 520
      const maxEdge   = 260

      let vw: number, maxPx: number
      if (a <= 1) {
        vw    = vwActive - a * (vwActive - vwSide)
        maxPx = maxActive - a * (maxActive - maxSide)
      } else {
        const t = a - 1
        vw    = Math.max(vwEdge,  vwSide  - t * (vwSide  - vwEdge))
        maxPx = Math.max(maxEdge, maxSide - t * (maxSide - maxEdge))
      }
      inner.style.width = `min(${vw.toFixed(1)}vw, ${maxPx.toFixed(0)}px)`
    }
  }
}

function computeVirtualTotal(imageCount: number): number {
  if (imageCount <= 1) return 1
  return imageCount * Math.ceil(5 / imageCount)
}

export function ProductLightbox({ images, startIndex, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const CLOSE_MS = 220
  const [isClosing, setIsClosing] = useState(false)
  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, CLOSE_MS)
  }, [isClosing, onClose])

  const imgCount   = images.length
  const total      = computeVirtualTotal(imgCount)
  const modInt     = (n: number) => ((Math.round(n) % total + total) % total)
  const imageSrcFor = (slot: number) => images[((slot % imgCount) + imgCount) % imgCount]

  const offsetRef = useRef<number>(startIndex)
  const velRef    = useRef<number>(0)
  const rafIdRef  = useRef<number>(0)

  const [current, setCurrent]             = useState(startIndex)
  const realCurrent                       = ((current % imgCount) + imgCount) % imgCount
  const [loadedImages, setLoadedImages]   = useState<ReadonlySet<number>>(() => new Set())
  const markLoaded = useCallback((realIdx: number) => {
    setLoadedImages(prev => {
      if (prev.has(realIdx)) return prev
      const s = new Set(prev); s.add(realIdx); return s
    })
  }, [])

  const overlayRef    = useRef<HTMLDivElement>(null)
  const cardDoms      = useRef<Map<number, HTMLButtonElement>>(new Map())
  const cardInnerDoms = useRef<Map<number, HTMLDivElement>>(new Map())
  const viewportW     = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1440)
  const isMounted     = useRef(false)

  useEffect(() => {
    isMounted.current = true
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w) viewportW.current = w
    })
    if (overlayRef.current) ro.observe(overlayRef.current)
    return () => { isMounted.current = false; cancelAnimationFrame(rafIdRef.current); ro.disconnect() }
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyCardTransforms(cardDoms.current, cardInnerDoms.current, offsetRef.current, total, viewportW.current)
  }, [mounted, total])

  const FRICTION = 0.76
  const SNAP_VEL = 0.012

  const startAnimation = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
    const loop = () => {
      if (!isMounted.current) return
      velRef.current    *= FRICTION
      offsetRef.current += velRef.current
      offsetRef.current  = ((offsetRef.current % total) + total) % total
      applyCardTransforms(cardDoms.current, cardInnerDoms.current, offsetRef.current, total, viewportW.current)
      const rounded = modInt(offsetRef.current)
      setCurrent(prev => prev === rounded ? prev : rounded)
      if (Math.abs(velRef.current) < SNAP_VEL) {
        velRef.current = 0
        const snapTo = modInt(offsetRef.current)
        const lerp = () => {
          if (!isMounted.current) return
          let diff = snapTo - offsetRef.current
          diff -= total * Math.round(diff / total)
          if (Math.abs(diff) < 0.001) {
            offsetRef.current = snapTo
            applyCardTransforms(cardDoms.current, cardInnerDoms.current, snapTo, total, viewportW.current)
            setCurrent(snapTo)
            return
          }
          offsetRef.current += diff * 0.26
          offsetRef.current  = ((offsetRef.current % total) + total) % total
          applyCardTransforms(cardDoms.current, cardInnerDoms.current, offsetRef.current, total, viewportW.current)
          rafIdRef.current = requestAnimationFrame(lerp)
        }
        rafIdRef.current = requestAnimationFrame(lerp)
        return
      }
      rafIdRef.current = requestAnimationFrame(loop)
    }
    rafIdRef.current = requestAnimationFrame(loop)
  }, [total]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => { velRef.current =  0.18; startAnimation() }, [startAnimation])
  const goPrev = useCallback(() => { velRef.current = -0.18; startAnimation() }, [startAnimation])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     handleClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose, goNext, goPrev])

  const SLIDE_PX    = 450
  const lastWheelMs = useRef(0)
  useEffect(() => {
    if (!mounted) return
    const el = overlayRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault(); e.stopPropagation()
      const now = Date.now()
      if (now - lastWheelMs.current > 250) velRef.current = 0
      lastWheelMs.current = now
      const raw   = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      const delta = Math.max(-8, Math.min(8, raw))
      velRef.current += delta / SLIDE_PX
      velRef.current  = Math.max(-0.18, Math.min(0.18, velRef.current))
      startAnimation()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [mounted, startAnimation])

  const touchStartX = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -50) goNext()
    if (dx >  50) goPrev()
  }

  useEffect(() => {
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const blockCtx = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', blockCtx)
    return () => { document.body.style.overflow = saved; document.removeEventListener('contextmenu', blockCtx) }
  }, [])

  type Slot = 'prevPrev' | 'prev' | 'active' | 'next' | 'nextNext'
  function slotForIndex(idx: number): Slot {
    const d = cardDelta(idx, current, total)
    const r = Math.round(d)
    if      (r === 0)  return 'active'
    else if (r === -1) return 'prev'
    else if (r ===  1) return 'next'
    else if (r <= -2)  return 'prevPrev'
    else               return 'nextNext'
  }

  const content = (
    <div
      ref={overlayRef}
      className={`${styles.overlay}${isClosing ? ' ' + styles.overlayClosing : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de productos"
    >
      <div className={styles.closeCatcher} onClick={handleClose} aria-hidden="true" />

      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropBase} />
        <div className={styles.backdropGrid} />
      </div>

      <button className={styles.close} onClick={handleClose} aria-label="Cerrar">
        <span aria-hidden="true">✕</span>
      </button>

      <div className={styles.stage} aria-live="polite">
        {Array.from({ length: total }, (_, slotIdx) => {
          const realIdx = ((slotIdx % imgCount) + imgCount) % imgCount
          const src     = imageSrcFor(slotIdx)
          const slot    = slotForIndex(slotIdx)
          return (
            <button
              key={slotIdx}
              ref={el => { if (el) cardDoms.current.set(slotIdx, el); else cardDoms.current.delete(slotIdx) }}
              className={`${styles.card} ${styles[slot]}`}
              onClick={
                slot === 'next' || slot === 'nextNext' ? goNext
                : slot === 'prev' || slot === 'prevPrev' ? goPrev
                : undefined
              }
              tabIndex={slot === 'prev' || slot === 'active' || slot === 'next' ? 0 : -1}
              aria-label={
                slot === 'active'
                  ? `Producto ${realIdx + 1} de ${imgCount}`
                  : slot === 'prev' || slot === 'prevPrev' ? 'Anterior' : 'Siguiente'
              }
            >
              <div
                ref={el => { if (el) cardInnerDoms.current.set(slotIdx, el); else cardInnerDoms.current.delete(slotIdx) }}
                className={styles.cardInner}
              >
                <div
                  className={`${styles.skeleton}${loadedImages.has(realIdx) ? ' ' + styles.skeletonLoaded : ''}`}
                  aria-hidden="true"
                />
                <span className={styles.cardBorder} aria-hidden="true" />
                <img
                  src={src}
                  alt={`Producto ${realIdx + 1}`}
                  className={styles.img}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => markLoaded(realIdx)}
                />
              </div>
            </button>
          )
        })}
      </div>

      {imgCount <= 20 && (
        <div className={styles.dots} aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot}${i === realCurrent ? ' ' + styles.dotActive : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}
