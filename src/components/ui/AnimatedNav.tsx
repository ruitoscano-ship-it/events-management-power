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
        className="nav-scroll relative mx-auto flex max-w-7xl gap-1 px-3 sm:gap-4 sm:px-4 md:gap-6"
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
            className={`relative z-10 shrink-0 min-h-11 px-1.5 py-2.5 text-[9px] font-bold tracking-wide transition-colors duration-200 min-[400px]:text-[10px] sm:min-h-0 sm:px-2 sm:py-3 sm:tracking-widest sm:text-xs ${
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
