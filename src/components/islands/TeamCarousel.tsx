import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import type { TeamMember } from '@/lib/types'

interface TeamCarouselProps {
  members: TeamMember[]
  autoplay?: boolean
  autoplayDelay?: number
}

const SocialIcon = ({ platform }: { platform: string }) => {
  const paths: Record<string, string> = {
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    behance:   'M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.602.414.272.74.623.976 1.06.234.435.352.958.352 1.56 0 .67-.15 1.23-.452 1.685-.302.45-.756.817-1.358 1.1.817.235 1.426.65 1.827 1.244.402.594.602 1.312.602 2.15 0 .658-.128 1.225-.384 1.71-.256.483-.605.882-1.046 1.187-.44.305-.956.53-1.545.675-.59.144-1.2.216-1.83.216H0V4.503h6.938zm-.386 4.866c.52 0 .94-.123 1.258-.37.316-.246.475-.625.475-1.133 0-.29-.053-.533-.16-.727-.106-.194-.252-.35-.434-.465-.184-.117-.4-.2-.645-.25-.244-.05-.506-.074-.783-.074H2.708v3.02h3.844zm.15 5.12c.305 0 .585-.028.843-.087.257-.057.48-.15.667-.278.188-.127.335-.296.44-.506.106-.21.158-.475.158-.797 0-.634-.178-1.09-.535-1.368-.356-.277-.836-.416-1.44-.416H2.708v3.453h3.994zm8.212-4.08c.22.567.33 1.183.33 1.848h-6.1c.028.71.255 1.253.68 1.632.424.38.962.568 1.612.568.51 0 .944-.13 1.303-.392.358-.26.577-.543.657-.848h1.917c-.307.95-.797 1.64-1.47 2.07-.67.43-1.482.646-2.435.646-.66 0-1.256-.107-1.787-.32-.53-.213-.983-.52-1.357-.916-.374-.398-.663-.874-.866-1.432-.202-.558-.304-1.17-.304-1.84 0-.65.104-1.252.31-1.803.207-.55.5-1.025.878-1.422.378-.398.83-.707 1.357-.928.525-.222 1.103-.333 1.732-.333.7 0 1.313.133 1.84.397.527.265.962.623 1.306 1.074.343.45.595.967.753 1.552zm-4.1-2.49c-.468 0-.862.137-1.178.41-.317.272-.52.666-.608 1.184h3.627c-.06-.51-.25-.902-.565-1.175-.316-.273-.703-.41-1.275-.41zM19.23 5.16h5.77v1.35H19.23V5.16z',
    linkedin:  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    dribbble:  'M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.627 0 12-5.372 12-12 0-6.627-5.373-12-12-12zm7.996 5.62c1.386 1.668 2.214 3.816 2.232 6.158-2.89-.574-5.638-.483-8.108.205-.19-.476-.395-.952-.61-1.418 2.614-.997 4.876-2.56 6.486-4.945zm-1.387-1.21C17.041 6.607 14.95 8.063 12.5 9a58.474 58.474 0 00-3.002-4.68A9.946 9.946 0 0112 4c2.48 0 4.757.896 6.609 2.41zM7.883 5.199A56.3 56.3 0 0110.88 9.8c-3.208.757-6.715 1.012-9.748.822.507-2.526 1.996-4.7 4.086-6.114a9.89 9.89 0 012.664.69zM2.01 12.139c.004-.174.012-.347.024-.52 3.282.198 7.006-.056 10.449-.927.205.42.4.842.582 1.264-3.65 1.007-6.82 3.283-8.903 6.483A9.934 9.934 0 012.01 12.14zm3.54 8.47c1.834-3.018 4.84-5.21 8.27-6.235.757 1.97 1.33 4.02 1.66 6.116A9.984 9.984 0 0112 22a9.951 9.951 0 01-6.45-2.39zm8.37 1.7a29.29 29.29 0 00-1.51-5.657c2.228-.37 4.665-.263 7.135.34a9.962 9.962 0 01-5.625 5.317z',
  }
  if (!paths[platform]) return null
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[platform]} />
    </svg>
  )
}

export function TeamCarousel({ members, autoplay = true, autoplayDelay = 4500 }: TeamCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
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
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {members.map((member) => (
            <div
              key={member.id}
              className="min-w-0 flex-none w-full md:w-[calc(50%-10px)] xl:w-[calc(33.333%-14px)]"
            >
              <article className="group overflow-hidden rounded-2xl border border-surface-border bg-surface-raised">
                {/* Photo */}
                <div className="relative overflow-hidden aspect-3/4">
                  <img
                    src={member.photo}
                    alt={member.name}
                    width={360}
                    height={480}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="font-display text-base font-bold text-text-primary">{member.name}</p>
                  <p className="mt-0.5 text-sm font-medium text-brand-red">{member.role}</p>
                  {member.bio && (
                    <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3">{member.bio}</p>
                  )}
                  {member.social && Object.values(member.social).some(Boolean) && (
                    <div className="mt-4 flex items-center gap-3">
                      {member.social.instagram && (
                        <a
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Instagram de ${member.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-text-muted transition-colors hover:border-brand-red hover:text-brand-red"
                        >
                          <SocialIcon platform="instagram" />
                        </a>
                      )}
                      {member.social.behance && (
                        <a
                          href={member.social.behance}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Behance de ${member.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-text-muted transition-colors hover:border-brand-red hover:text-brand-red"
                        >
                          <SocialIcon platform="behance" />
                        </a>
                      )}
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`LinkedIn de ${member.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-text-muted transition-colors hover:border-brand-red hover:text-brand-red"
                        >
                          <SocialIcon platform="linkedin" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between">
        {/* Dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Miembros del equipo">
          {members.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selectedIndex}
              aria-label={`Ir al miembro ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                i === selectedIndex ? 'w-8 bg-brand-red' : 'w-3 bg-surface-border hover:bg-surface-muted',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Miembro anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-raised text-text-secondary transition-all hover:border-brand-red hover:text-brand-red"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Miembro siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-raised text-text-secondary transition-all hover:border-brand-red hover:text-brand-red"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
