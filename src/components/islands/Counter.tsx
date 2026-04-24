import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  target: number
  suffix?: string
  label: string
  duration?: number
}

export function Counter({ target, suffix = '', label, duration = 2000 }: CounterProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()

          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 text-center">
      <div
        className="font-display text-5xl xl:text-6xl font-bold tabular-nums"
        style={{ color: 'var(--color-text-primary)' }}
        aria-label={`${target}${suffix} ${label}`}
      >
        <span>{value}</span>
        <span>{suffix}</span>
      </div>
      <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
    </div>
  )
}
