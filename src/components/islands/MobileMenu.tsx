import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { NavItem } from '@/lib/types'

interface MobileMenuProps {
  navItems: NavItem[]
}

const RAINBOW =
  'linear-gradient(90deg,#E8222B 0%,#FF6B35 16%,#FFD700 33%,#22C55E 50%,#3B82F6 66%,#8B5CF6 83%,#EC4899 100%)'

const SHEET_BG = [
  'linear-gradient(145deg,',
  'rgba(232,34,43,0.045) 0%,',
  'rgba(255,107,53,0.03) 18%,',
  'rgba(255,215,0,0.025) 36%,',
  'rgba(34,197,94,0.025) 54%,',
  'rgba(59,130,246,0.03) 72%,',
  'rgba(139,92,246,0.035) 88%,',
  'rgba(236,72,153,0.03) 100%),#FFFFFF',
].join('')

export function MobileMenu({ navItems }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const sheetRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

  const openMenu = useCallback(() => {
    setMounted(true)
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Scroll lock: overflow hidden en <html> — no resetea scrollY, sin salto visual
  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  // Escape key + focus trap
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
        return
      }
      if (e.key === 'Tab') {
        const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, closeMenu])

  // Move focus into sheet when it opens
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      sheetRef.current
        ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
        ?.focus()
    }, 60)
    return () => clearTimeout(t)
  }, [open])

  // Portal content — only on client, after first open
  const portalContent =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <>
            {/* Backdrop — above header (z-9999) */}
            {open && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                style={{ zIndex: 10000 }}
                onClick={closeMenu}
                aria-hidden="true"
              />
            )}

            {/* Bottom sheet */}
            <div
              id="mobile-menu-sheet"
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              style={{ background: SHEET_BG, zIndex: 10001 }}
              className={[
                'fixed bottom-0 left-0 right-0',
                'flex flex-col',
                'max-h-[88dvh]',
                'rounded-t-3xl shadow-2xl overflow-hidden',
                'transition-transform duration-300 ease-in-out',
                open ? 'translate-y-0' : 'translate-y-full',
              ].join(' ')}
            >
              {/* Rainbow strip */}
              <div
                aria-hidden="true"
                className="h-[3px] w-full shrink-0"
                style={{ background: RAINBOW }}
              />

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
                <div className="w-10 h-1 rounded-full bg-surface-muted" />
              </div>

              {/* Header: logo + close */}
              <div className="flex items-center justify-between px-5 pt-1 pb-4 shrink-0">
                <a
                  href="/"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity rounded-md focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-2"
                  aria-label="GrafiVisión, ir al inicio"
                >
                  <img
                    src="/logo-camaleon.png"
                    width={32}
                    height={32}
                    alt=""
                    aria-hidden="true"
                    className="shrink-0 object-contain"
                    loading="eager"
                  />
                  <span className="font-display font-bold text-lg tracking-tight text-brand-red select-none">
                    GrafiVisión
                  </span>
                </a>

                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Cerrar menú"
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/70 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-2"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M2 2L16 16M16 2L2 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="mx-5 border-t border-surface-border shrink-0" />

              {/* Nav */}
              <nav
                className="flex-1 overflow-y-auto overscroll-contain py-3 min-h-0"
                aria-label="Navegación móvil"
              >
                <ul className="px-3 space-y-0.5">
                  {navItems.map((item) => {
                    const isActive =
                      currentPath === item.href ||
                      (item.href !== '/' && currentPath.startsWith(item.href))
                    const hasChildren = Boolean(item.children?.length)
                    const isExpanded = expandedItem === item.href

                    return (
                      <li key={item.href}>
                        {hasChildren ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setExpandedItem(isExpanded ? null : item.href)}
                              aria-expanded={isExpanded}
                              className={[
                                'w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors duration-150',
                                isActive
                                  ? 'text-brand-red font-semibold bg-white/70'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-white/60',
                              ].join(' ')}
                            >
                              <span className="flex items-center gap-3">
                                {isActive && (
                                  <span
                                    className="w-1 h-4 rounded-full bg-brand-red shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                                {item.label}
                              </span>
                              <svg
                                width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className={[
                                  'shrink-0 transition-transform duration-200',
                                  isExpanded ? 'rotate-180' : '',
                                ].join(' ')}
                                aria-hidden="true"
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                            {isExpanded && (
                              <ul className="mt-1 ml-5 space-y-0.5 border-l-2 border-surface-border pl-3">
                                {item.children!.map((child) => (
                                  <li key={child.href}>
                                    <a
                                      href={child.href}
                                      onClick={closeMenu}
                                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-brand-red hover:bg-white/60 transition-colors duration-150"
                                    >
                                      {child.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (
                          <a
                            href={item.href}
                            onClick={closeMenu}
                            aria-current={isActive ? 'page' : undefined}
                            className={[
                              'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors duration-150',
                              isActive
                                ? 'text-brand-red font-semibold bg-white/70'
                                : 'text-text-secondary hover:text-text-primary hover:bg-white/60',
                            ].join(' ')}
                          >
                            {isActive && (
                              <span
                                className="w-1 h-4 rounded-full bg-brand-red shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            {item.label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* CTA */}
              <div className="px-5 py-4 border-t border-surface-border shrink-0">
                <a
                  href="/contacto"
                  onClick={closeMenu}
                  className="flex items-center justify-center w-full px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-orange hover:to-brand-pink active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-2"
                >
                  Contáctanos
                </a>
              </div>
            </div>
          </>,
          document.body
        )
      : null

  return (
    <>
      {/* Hamburger trigger — stays in header */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        aria-controls="mobile-menu-sheet"
        className="xl:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-primary hover:bg-surface-overlay active:bg-surface-overlay transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-red focus-visible:outline-offset-2"
      >
        <svg
          width="22"
          height="16"
          viewBox="0 0 22 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="0" y="0"  width="22" height="2" rx="1" fill="currentColor" />
          <rect x="0" y="7"  width="22" height="2" rx="1" fill="currentColor" />
          <rect x="0" y="14" width="14" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      {portalContent}
    </>
  )
}
