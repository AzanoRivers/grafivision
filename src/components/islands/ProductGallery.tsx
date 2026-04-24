import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './ProductGallery.module.css'
import { ProductLightbox } from './ProductLightbox'

export interface ProductCategoryData {
  id:     string
  label:  string
  images: string[]
}

interface Props {
  categories: ProductCategoryData[]
}

// ── Tile ──────────────────────────────────────────────────────────────────────
function Tile({ src, realIndex, onClick }: { src: string; realIndex: number; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <button className={styles.tile} onClick={onClick} aria-label={`Ver producto ${realIndex + 1}`}>
      <div className={styles.tileInner}>
        <div className={`${styles.skeleton}${loaded ? ' ' + styles.skeletonLoaded : ''}`} aria-hidden="true" />
        <span className={styles.tileBorder} aria-hidden="true" />
        <img
          src={src}
          alt={`Producto ${realIndex + 1}`}
          className={styles.img}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
        <span className={styles.glint} aria-hidden="true" />
      </div>
    </button>
  )
}

// ── Strip ─────────────────────────────────────────────────────────────────────
function Strip({ images, onTileClick }: { images: string[]; onTileClick: (i: number) => void }) {
  const trackRef       = useRef<HTMLDivElement>(null)
  const isDragging     = useRef(false)
  const dragStartX     = useRef(0)
  const dragScrollLeft = useRef(0)
  const tripled        = [...images, ...images, ...images]

  const jumpToMiddle = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = el.scrollWidth / 3
  }, [])

  useEffect(() => { jumpToMiddle() }, [jumpToMiddle])

  // Re-center when image set changes (category switch)
  useEffect(() => { jumpToMiddle() }, [images, jumpToMiddle])

  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const seg = el.scrollWidth / 3
    if (el.scrollLeft < seg * 0.05)      el.scrollLeft += seg
    else if (el.scrollLeft > seg * 1.95) el.scrollLeft -= seg
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current; if (!el) return
    isDragging.current = true; dragStartX.current = e.clientX; dragScrollLeft.current = el.scrollLeft
    el.style.cursor = 'grabbing'; el.style.userSelect = 'none'
  }, [])
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    const el = trackRef.current; if (!el) return
    el.scrollLeft = dragScrollLeft.current - (e.clientX - dragStartX.current)
  }, [])
  const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = trackRef.current; if (!el) return
    el.style.cursor = ''; el.style.userSelect = ''
    if (Math.abs(e.clientX - dragStartX.current) > 5) e.stopPropagation()
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.edgeLeft}  aria-hidden="true" />
      <div className={styles.edgeRight} aria-hidden="true" />
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {tripled.map((src, i) => (
          <Tile
            key={`${src}-${i}`}
            src={src}
            realIndex={i % images.length}
            onClick={() => onTileClick(i % images.length)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ProductGallery({ categories }: Props) {
  const ALL_ID = '__all__'
  const allImages = categories.flatMap(c => c.images)

  const [activeCat,     setActiveCat]     = useState(ALL_ID)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxImages, setLightboxImages] = useState<string[]>(allImages)

  const currentImages = activeCat === ALL_ID
    ? allImages
    : (categories.find(c => c.id === activeCat)?.images ?? allImages)

  const handleTabClick = (id: string) => {
    setActiveCat(id)
    setLightboxIndex(null)
  }

  const handleTileClick = (i: number) => {
    setLightboxImages(currentImages)
    setLightboxIndex(i)
  }

  return (
    <>
      {/* ── Category tabs ─────────────────────────────────────────── */}
      <div className={styles.tabs} role="tablist" aria-label="Categorías de productos">
        <button
          role="tab"
          aria-selected={activeCat === ALL_ID}
          className={`${styles.tab}${activeCat === ALL_ID ? ' ' + styles.tabActive : ''}`}
          onClick={() => handleTabClick(ALL_ID)}
        >
          Todos
          <span className={styles.tabCount}>{allImages.length}</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCat === cat.id}
            className={`${styles.tab}${activeCat === cat.id ? ' ' + styles.tabActive : ''}`}
            onClick={() => handleTabClick(cat.id)}
          >
            {cat.label}
            <span className={styles.tabCount}>{cat.images.length}</span>
          </button>
        ))}
      </div>

      {/* ── Strip ─────────────────────────────────────────────────── */}
      <Strip
        key={activeCat}
        images={currentImages}
        onTileClick={handleTileClick}
      />

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <ProductLightbox
          images={lightboxImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
