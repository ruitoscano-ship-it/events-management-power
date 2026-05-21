import { useLayoutEffect, useRef, useState } from 'react'

export interface NavTab<T extends string> {
  id: T
  label: string
}

interface AnimatedNavProps<T extends string> {
  tabs: readonly NavTab<T>[]
  active: T
  onChange: (tab: T) => void
  className?: string
}

export function AnimatedNav<T extends string>({
  tabs,
  active,
  onChange,
  className = '',
}: AnimatedNavProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const btn = row.querySelector<HTMLElement>(`[data-nav-tab="${active}"]`)
    if (!btn) return
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
  }, [active, tabs])

  return (
    <nav className={`border-b border-[#2a2a3d] bg-[#0a0a12] ${className}`}>
      <div
        ref={rowRef}
        className="relative mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 md:gap-8"
      >
        <span
          className="nav-indicator"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
          }}
          aria-hidden
        />
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            data-nav-tab={t.id}
            onClick={() => onChange(t.id)}
            className={`relative z-10 shrink-0 py-3 text-xs font-bold tracking-widest transition-colors duration-200 ${
              active === t.id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
