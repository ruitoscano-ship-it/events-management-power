import { useEffect, useRef, useState } from 'react'

const DEFAULT_BATCH = 6

/**
 * Reveals list items in batches as the user scrolls (intersection observer).
 */
export function useIncrementalReveal<T>(
  items: T[],
  batchSize = DEFAULT_BATCH,
): {
  visible: T[]
  sentinelRef: React.RefObject<HTMLDivElement | null>
  hasMore: boolean
} {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setVisibleCount(batchSize)
  }, [items, batchSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || visibleCount >= items.length) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((n) => Math.min(n + batchSize, items.length))
        }
      },
      { rootMargin: '160px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [items.length, visibleCount, batchSize])

  return {
    visible: items.slice(0, visibleCount),
    sentinelRef,
    hasMore: visibleCount < items.length,
  }
}
