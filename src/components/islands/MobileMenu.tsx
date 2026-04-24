import type { NavItem } from '@/lib/types'
import { useEffect, useRef, useState } from 'react'

interface MobileMenuProps {
  navItems: NavItem[]
}

export function MobileMenu({ navItems }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  // mounted: true after first open — keeps drawer in DOM for exit animation
  const [mounted, setMounted] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const openMenu = () => { setMounted(true); setOpen(true) }
  const closeMenu = () => setOpen(false)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        className="xl:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-md hover:bg-surface-overlay transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-brand-red"
      >
        <span className="block w-5 h-px bg-text-primary transition-all duration-200" />
        <span className="block w-5 h-px bg-text-primary transition-all duration-200" />
        <span className="block w-3.5 h-px bg-text-primary transition-all duration-200 self-end" />
      </button>

      {/* Backdrop — solo cuando está abierto */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-49"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Drawer — solo montado tras primer uso */}
      {mounted && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className={[
            'fixed top-0 right-0 h-full w-72 bg-surface-raised z-50 flex flex-col',
            'transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
            <a
              href="/"
              className="inline-flex items-center gap-3 text-text-primary"
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width={28}
                height={28}
                fill="currentColor"
                className="text-brand-red shrink-0"
                aria-hidden="true"
              >
                <path d="M38.2,4c-1.4-1.1-38.3,8-19.9,44.6C-16.4,35.8,5.5-12.8,38.2,4" />
                <path d="M24.8,17.9c-12.5,10.2-5.7,31-5.4,31.5c1.1,0.3,2,0.6,3.7,0.6c2.3-23,20.4-31.8,20.4-31.8S34.7,17.9,24.8,17.9" />
                <path d="M49.2,23.6c1.1,14.5-11.4,26.1-24.7,26.1C24.5,49.7,31.3,29,49.2,23.6" />
              </svg>
              <span className="font-display font-bold text-lg tracking-tight">GrafiVisión</span>
            </a>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Cerrar menú"
              className="flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedItem(expandedItem === item.href ? null : item.href)
                        }
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors"
                      >
                        {item.label}
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className={[
                            'transition-transform duration-200',
                            expandedItem === item.href ? 'rotate-180' : '',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedItem === item.href && (
                        <ul className="mt-1 ml-4 space-y-1 border-l border-surface-border pl-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <a
                                href={child.href}
                                onClick={closeMenu}
                                className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-brand-red hover:bg-surface-overlay transition-colors"
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
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA footer */}
          <div className="px-6 py-5 border-t border-surface-border">
            <a
              href="/contacto"
              onClick={closeMenu}
              className="flex items-center justify-center w-full px-6 py-2.5 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>
      )}
    </>
  )
}
