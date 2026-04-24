import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

interface CarouselSlide {
  src: string
  alt: string
  caption?: string
}

interface CarouselProps {
  slides: CarouselSlide[]
  loop?: boolean
  autoplay?: boolean
  autoplayDelay?: number
}

export function Carousel({ slides, loop = true, autoplay = false, autoplayDelay = 4000 }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  useEffect(() => {
    if (!autoplay || !emblaApi) return
    const id = setInterval(() => emblaApi.scrollNext(), autoplayDelay)
    return () => clearInterval(id)
  }, [autoplay, autoplayDelay, emblaApi])

  return (
    <div className="relative">
      {/* Viewport */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="flex-none w-full">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width="1280"
                  height="720"
                  className="h-full w-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                {slide.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/70 to-transparent px-6 py-4">
                    <p className="text-sm text-white/90">{slide.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!loop && !canScrollPrev}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-brand-red disabled:opacity-30"
            style={{ ['--color-brand-red' as string]: 'var(--color-brand-red)' }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!loop && !canScrollNext}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-brand-red disabled:opacity-30"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Ir a slide ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: selectedIndex === i ? '1.5rem' : '0.375rem',
                  backgroundColor: selectedIndex === i ? 'var(--color-brand-red)' : 'var(--color-surface-muted)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
