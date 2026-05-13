import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './VideoGallery.module.css'
import { VideoModal, type VideoItem } from './VideoModal'

interface Props {
  videos: VideoItem[]
}

// ── Duration helper ─────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── VideoCard ───────────────────────────────────────────────
interface VideoCardProps {
  video: VideoItem
  index: number
  onClick: () => void
}

function VideoCard({ video, index, onClick }: VideoCardProps) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const [thumbReady, setThumbReady] = useState(false)   // thumbnail frame visible
  const [skLoaded,   setSkLoaded]   = useState(false)   // skeleton can fade out
  const [duration,   setDuration]   = useState<string>('')
  const [srcActive,  setSrcActive]  = useState(false)   // IO triggered

  // Intersection Observer: defer metadata load until card enters viewport.
  // rootMargin 100px starts preloading just before card is visible.
  // Stagger delay (index * 80ms) prevents all visible cards from firing
  // simultaneously — spreads network + decode load across ~880ms for 11 cards.
  useEffect(() => {
    const el = cardRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSrcActive(true)
      return
    }
    let timer: ReturnType<typeof setTimeout>
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          timer = setTimeout(() => setSrcActive(true), index * 80)
        }
      },
      { rootMargin: '100px 0px' },
    )
    io.observe(el)
    return () => { io.disconnect(); clearTimeout(timer) }
  }, [index])

  // Release video resources on unmount — prevents active network connections
  // from blocking page navigation (Astro View Transitions)
  useEffect(() => {
    return () => {
      const v = videoRef.current
      if (!v) return
      v.pause()
      v.src = ''
      v.load()
    }
  }, [])

  // Handle metadata loaded: extract duration, seek to first frame
  const handleMetadata = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    // Format and store duration
    setDuration(formatDuration(v.duration))
    // Seek to 0.001s — triggers onSeeked when frame is ready
    // This is the reliable cross-platform approach (incl. iOS)
    try {
      v.currentTime = 0.001
    } catch {
      // If seek fails (restricted on some iOS states), still show thumbnail
      setThumbReady(true)
      setSkLoaded(true)
    }
  }, [])

  // Handle seek complete — now the first frame is rendered
  const handleSeeked = useCallback(() => {
    setThumbReady(true)
    // Small delay before hiding skeleton so cross-fade looks smooth
    setTimeout(() => setSkLoaded(true), 50)
  }, [])

  // Stagger entrance delay (0-based index, 60ms increments, max 4 cols)
  const staggerDelay = `${(index % 6) * 65}ms`

  return (
    <article
      style={{ animationDelay: staggerDelay }}
      className={styles.cardWrapper}
    >
      <button
        className={styles.card}
        onClick={onClick}
        aria-label={`Reproducir: ${video.label}`}
        type="button"
      >
        {/* ── Media container ───────────────────────────────── */}
        <div ref={cardRef} className={styles.cardInner}>

          {/* Thumbnail video — loaded lazily via IO, not playing */}
          {srcActive && (
            <video
              ref={videoRef}
              src={video.src}
              preload="metadata"
              playsInline
              muted
              tabIndex={-1}
              className={`${styles.thumbnail}${thumbReady ? ` ${styles.thumbnailReady}` : ''}`}
              onLoadedMetadata={handleMetadata}
              onSeeked={handleSeeked}
              aria-hidden="true"
            />
          )}

          {/* Skeleton — visible until thumbnail frame ready */}
          <div
            className={`${styles.skeleton}${skLoaded ? ` ${styles.skeletonLoaded}` : ''}`}
            aria-hidden="true"
          />

          {/* Play overlay + button */}
          <div className={styles.playOverlay} aria-hidden="true">
            <span className={styles.playBtn}>
              <svg
                className={styles.playIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {/* Triangle pointing right — optical offset applied via CSS */}
                <path d="M7 4.5v15l12.5-7.5L7 4.5z" />
              </svg>
            </span>
          </div>

          {/* Duration badge — fades in once metadata loads */}
          {duration && (
            <span className={`${styles.duration} ${styles.durationVisible}`}>
              {duration}
            </span>
          )}

          {/* Animated border ring */}
          <span className={styles.cardRing} aria-hidden="true" />
        </div>

        {/* ── Card footer ───────────────────────────────────── */}
        <div className={styles.footer}>
          <p className={styles.label}>{video.label}</p>
        </div>
      </button>
    </article>
  )
}

// ── VideoGallery (exported island) ─────────────────────────
export function VideoGallery({ videos }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <>
      <div
        className={styles.grid}
        role="list"
        aria-label="Galería de videos de maquinaria"
      >
        {videos.map((v, i) => (
          <div key={v.src} role="listitem">
            <VideoCard
              video={v}
              index={i}
              onClick={() => setActiveIndex(i)}
            />
          </div>
        ))}
      </div>

      {activeIndex !== null && (
        <VideoModal
          videos={videos}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  )
}
