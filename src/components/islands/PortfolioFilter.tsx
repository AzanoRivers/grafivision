import type { PortfolioCategory, PortfolioItem } from '@/lib/types';
import { useCallback, useState } from 'react';

interface PortfolioFilterProps {
  items: PortfolioItem[]
}

const categories: { value: PortfolioCategory; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'offset', label: 'Offset' },
  { value: 'digital', label: 'Digital' },
  { value: 'gran-formato', label: 'Gran Formato' },
  { value: 'pop', label: 'Material POP' },
  { value: 'empaques', label: 'Empaques' },
]

const categoryLabels: Record<string, string> = {
  offset: 'Offset',
  digital: 'Digital',
  'gran-formato': 'Gran Formato',
  pop: 'Material POP',
  empaques: 'Empaques',
}

export function PortfolioFilter({ items }: PortfolioFilterProps) {
  const [active, setActive] = useState<PortfolioCategory>('todos')
  const [gridKey, setGridKey] = useState(0)
  const [transitioning, setTrans] = useState(false)

  const handleFilter = useCallback((cat: PortfolioCategory) => {
    if (cat === active) return
    setTrans(true)
    setTimeout(() => {
      setActive(cat)
      setGridKey((k) => k + 1)
      setTrans(false)
    }, 180)
  }, [active])

  const filtered = active === 'todos'
    ? items
    : items.filter((i) => i.category === active)

  return (
    <div>
      {/* ── Filter tabs ───────────────────────────────── */}
      <div
        className="mb-10 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Filtrar por categoría"
      >
        {categories.map(({ value, label }) => {
          const count = value === 'todos'
            ? items.length
            : items.filter((i) => i.category === value).length

          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active === value}
              onClick={() => handleFilter(value)}
              className={[
                'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 active:scale-95',
                active === value
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'border border-surface-border bg-surface-raised text-text-secondary hover:border-brand-red/40 hover:text-brand-red',
              ].join(' ')}
            >
              {label}
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-xs font-bold leading-none',
                  active === value
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-overlay text-text-muted',
                ].join(' ')}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Grid ─────────────────────────────────────── */}
      <div
        key={gridKey}
        className={[
          'grid grid-cols-1 gap-5 transition-opacity duration-180 md:grid-cols-2 xl:grid-cols-4',
          transitioning ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        role="tabpanel"
        aria-label={`Proyectos: ${categories.find((c) => c.value === active)?.label}`}
      >
        {filtered.map((item, i) => (
          <a
            key={item.slug}
            href={`/portafolio/${item.slug}`}
            className="group relative block overflow-hidden rounded-2xl bg-surface-raised ring-1 ring-surface-border animate-fade-up"
            style={{ animationDelay: `${i * 55}ms` }}
            aria-label={`Ver proyecto: ${item.title}`}
          >
            {/* Image */}
            <div className="aspect-4/3 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                width={600}
                height={450}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="mb-2 w-fit rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white">
                {categoryLabels[item.category] ?? item.category}
              </span>
              <h3 className="font-display text-sm font-bold text-white xl:text-base">{item.title}</h3>
              {item.year && (
                <span className="mt-1 text-xs text-white/60">{item.year}</span>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/70">
                Ver proyecto
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </div>

            {/* Static category badge */}
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-text-secondary backdrop-blur-sm">
                {categoryLabels[item.category] ?? item.category}
              </span>
            </div>

            {/* Featured dot */}
            {item.featured && (
              <div
                className="absolute left-3 top-3 h-2 w-2 rounded-full bg-brand-red shadow-sm"
                title="Proyecto destacado"
                aria-hidden="true"
              />
            )}
          </a>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-text-muted">No hay proyectos en esta categoría.</p>
        </div>
      )}
    </div>
  )
}
