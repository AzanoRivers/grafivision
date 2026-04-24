import { useState } from 'react'

interface Tab {
  id: string
  label: string
  icon?: string
  content: string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        className="flex gap-1 rounded-xl border p-1.5"
        style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-raised)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={[
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
              active === tab.id
                ? 'bg-brand-red text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tab-panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="mt-6 rounded-xl border p-6 text-sm leading-relaxed"
          style={{
            borderColor: 'var(--color-surface-border)',
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
