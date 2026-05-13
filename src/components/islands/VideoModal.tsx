import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './VideoModal.module.css'

export interface VideoItem {
  src: string
  label: string
}

interface Props {
  videos: VideoItem[]
  startIndex: number
  onClose: () => void
}

export function VideoModal({ videos, startIndex, onClose }: Props) {
  const [mounted,   setMounted]   = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [current,   setCurrent]   = useState(startIndex)
  // true while video is buffering / not yet playable
  const [isLoading, setIsLoading] = useState(true)

  const videoRef    = useRef<HTMLVideoElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  // Guard: prevents rapid arrow clicks from thrashing video decoder.
  // Released when canplay fires (or after NAV_LOCK_MS as safety fallback).
  const navLockRef    = useRef(false)
  const navLockTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const NAV_LOCK_MS   = 400

  // Hydration guard — portal requires document
  useEffect(() => { setMounted(true) }, [])

  // Reset loading indicator on every video change
  useEffect(() => { setIsLoading(true) }, [current])

  // ── Close with exit animation ────────────────────────────
  const CLOSE_MS = 220
  const handleClose = useCallback(() => {
    if (isClosing) return
    videoRef.current?.pause()
    setIsClosing(true)
    setTimeout(onClose, CLOSE_MS)
  }, [isClosing, onClose])

  // ── Body scroll lock — no-jump approach ─────────────────
  // overflow:hidden preserves scroll position (no position:fixed jump).
  // iOS rubber-band scroll is contained by the overlay's
  // touch-action:none + overscroll-behavior:contain.
  useEffect(() => {
    const body         = document.body
    const scrollbarW   = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPadding  = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
    return () => {
      body.style.overflow     = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [])

  // ── Autoplay on open + navigation ───────────────────────
  // [current, mounted]: mounted ensures portal is in DOM before play() runs.
  // key={current} on <video> guarantees a fresh element each time.
  useEffect(() => {
    if (!mounted) return
    const v = videoRef.current
    if (!v) return
    let pendingListener: (() => void) | null = null
    const doPlay = () => v.play().catch(() => {})
    v.play().catch(() => {
      pendingListener = doPlay
      v.addEventListener('canplay', pendingListener, { once: true })
    })
    return () => {
      v.pause()
      if (pendingListener) v.removeEventListener('canplay', pendingListener)
    }
  }, [current, mounted])

  // ── Release nav lock helper ───────────────────────────────
  const releaseNavLock = useCallback(() => {
    navLockRef.current = false
    if (navLockTimer.current) {
      clearTimeout(navLockTimer.current)
      navLockTimer.current = null
    }
  }, [])

  // ── Navigate (with rapid-click guard) ───────────────────
  // Each click locks navigation for up to NAV_LOCK_MS.
  // The lock releases early when canplay fires via onCanPlay handler.
  // This prevents thrashing: 5 rapid clicks → 5 video decoder allocs.
  const navigate = useCallback((dir: 1 | -1) => {
    if (navLockRef.current) return
    navLockRef.current = true
    videoRef.current?.pause()
    setCurrent(prev => (prev + dir + videos.length) % videos.length)
    // Safety release after NAV_LOCK_MS if canplay never fires
    navLockTimer.current = setTimeout(releaseNavLock, NAV_LOCK_MS)
  }, [videos.length, releaseNavLock])

  const goNext = useCallback(() => navigate(1),  [navigate])
  const goPrev = useCallback(() => navigate(-1), [navigate])

  // Cleanup nav lock timer on unmount
  useEffect(() => () => {
    if (navLockTimer.current) clearTimeout(navLockTimer.current)
  }, [])

  // ── Video loading event handlers ─────────────────────────
  const handleCanPlay = useCallback(() => {
    setIsLoading(false)
    releaseNavLock() // allow next navigation as soon as video is ready
  }, [releaseNavLock])

  const handleWaiting = useCallback(() => {
    setIsLoading(true)
  }, [])

  const handlePlaying = useCallback(() => {
    setIsLoading(false)
    releaseNavLock()
  }, [releaseNavLock])

  // ── Keyboard ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLVideoElement) return
      if (e.key === 'Escape')     { e.preventDefault(); handleClose() }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose, goNext, goPrev])

  // ── Touch swipe ──────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -50) goNext()
    if (dx >  50) goPrev()
  }, [goNext, goPrev])

  // ── Focus trap ───────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    overlayRef.current?.focus()
  }, [mounted])

  const content = (
    <div
      ref={overlayRef}
      className={`${styles.overlay}${isClosing ? ` ${styles.overlayClosing}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Reproductor de video"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={-1}
    >
      {/* ── Backdrop ──────────────────────────────────────── */}
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropBase} />
        <div className={styles.backdropGrid} />
      </div>

      {/* ── Click-outside catcher ─────────────────────────── */}
      <div
        className={styles.closeCatcher}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* ── Close button ──────────────────────────────────── */}
      <button
        className={styles.close}
        onClick={handleClose}
        aria-label="Cerrar reproductor"
        type="button"
      >
        <span aria-hidden="true">✕</span>
      </button>

      {/* ── Content ───────────────────────────────────────── */}
      <div className={styles.content}>

        {/* ── Video area with nav arrows ──────────────────── */}
        <div className={styles.videoArea}>

          {/* Prev arrow */}
          {videos.length > 1 && (
            <button
              className={`${styles.nav} ${styles.navPrev}`}
              onClick={goPrev}
              aria-label="Video anterior"
              type="button"
            >
              <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Video player
              key={current} forces React to unmount + remount on navigation,
              cleanly stopping the previous video and loading the new one.
              CRITICAL iOS attrs: playsInline, controls, preload="auto"
          */}
          <div className={`${styles.videoWrap}${isLoading ? ` ${styles.videoWrapLoading}` : ''}`}>
            <video
              key={current}
              ref={videoRef}
              src={videos[current].src}
              className={`${styles.video}${isLoading ? ` ${styles.videoHidden}` : ''}`}
              controls
              playsInline
              preload="auto"
              aria-label={videos[current].label}
              onCanPlay={handleCanPlay}
              onPlaying={handlePlaying}
              onWaiting={handleWaiting}
            />

            {/* Loading spinner — visible while buffering */}
            {isLoading && mounted && (
              <div className={styles.videoLoader} aria-hidden="true">
                <div className={styles.videoLoaderRing} />
              </div>
            )}
          </div>

          {/* Next arrow */}
          {videos.length > 1 && (
            <button
              className={`${styles.nav} ${styles.navNext}`}
              onClick={goNext}
              aria-label="Siguiente video"
              type="button"
            >
              <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Label + counter ─────────────────────────────── */}
        <p className={styles.videoMeta} aria-live="polite">
          <span className={styles.videoLabel}>{videos[current].label}</span>
          {videos.length > 1 && (
            <span className={styles.videoCounter} aria-hidden="true">
              {current + 1} / {videos.length}
            </span>
          )}
        </p>

        {/* ── Dot indicators (max 20 dots to avoid overflow) ── */}
        {videos.length > 1 && videos.length <= 20 && (
          <div
            className={styles.dots}
            role="tablist"
            aria-label="Seleccionar video"
          >
            {videos.map((v, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={v.label}
                className={`${styles.dot}${i === current ? ` ${styles.dotActive}` : ''}`}
                onClick={() => {
                  videoRef.current?.pause()
                  setCurrent(i)
                }}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}
