import type { CSSProperties, ReactNode } from 'react'

interface PageTransitionProps {
  /** Unique key per view — changing it triggers enter animation */
  pageKey: string
  direction?: number
  variant?: 'page' | 'role' | 'fade'
  className?: string
  children: ReactNode
}

export function PageTransition({
  pageKey,
  direction = 0,
  variant = 'page',
  className = '',
  children,
}: PageTransitionProps) {
  const animClass =
    variant === 'role'
      ? 'motion-role'
      : variant === 'fade'
        ? 'motion-fade'
        : 'motion-page'

  const style = {
    '--motion-dx': `${direction * 18}px`,
  } as CSSProperties

  return (
    <div
      key={pageKey}
      className={`${animClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  )
}
