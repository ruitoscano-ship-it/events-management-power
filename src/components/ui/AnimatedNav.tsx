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

    const update = () => {
      const btn = row.querySelector<HTMLElement>(`[data-nav-tab="${active}"]`)
      if (!btn) return
      setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
    }

    update()
    btnScrollIntoView(row, active)
    row.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      row.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [active, tabs])

  return (
    <nav className={`border-b border-[#2a2a3d] bg-[#0a0a12] ${className}`}>
      <div
        ref={rowRef}
        className="nav-scroll relative mx-auto flex max-w-7xl gap-4 px-4 sm:gap-6 md:gap-8"
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
            className={`relative z-10 shrink-0 min-h-11 py-3 text-[10px] font-bold tracking-widest transition-colors duration-200 sm:min-h-0 sm:text-xs ${
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

function btnScrollIntoView(row: HTMLDivElement, active: string) {
  const btn = row.querySelector<HTMLElement>(`[data-nav-tab="${active}"]`)
  if (!btn) return
  const pad = 16
  const left = btn.offsetLeft - pad
  const right = btn.offsetLeft + btn.offsetWidth + pad
  if (left < row.scrollLeft) row.scrollLeft = left
  else if (right > row.scrollLeft + row.clientWidth) {
    row.scrollLeft = right - row.clientWidth
  }
}
