import { useLayoutEffect, useRef, useState } from 'react'

/** 1 = forward (slide from right), -1 = back (slide from left), 0 = neutral */
export function useTabDirection<T extends string>(
  active: T,
  order: readonly T[],
): number {
  const prevRef = useRef(active)
  const [direction, setDirection] = useState(0)

  useLayoutEffect(() => {
    const prev = prevRef.current
    if (prev === active) return
    const pi = order.indexOf(prev)
    const ni = order.indexOf(active)
    setDirection(ni > pi ? 1 : ni < pi ? -1 : 0)
    prevRef.current = active
  }, [active, order])

  return direction
}
