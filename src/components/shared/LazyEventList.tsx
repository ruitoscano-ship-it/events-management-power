import type { ReactNode } from 'react'
import { useIncrementalReveal } from '../../hooks/useIncrementalReveal'
import type { Event } from '../../types'

interface Props {
  events: Event[]
  renderCard: (event: Event) => ReactNode
}

export function LazyEventList({ events, renderCard }: Props) {
  const { visible, sentinelRef, hasMore } = useIncrementalReveal(events)

  if (events.length === 0) return null

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 motion-stagger">
        {visible.map((event) => (
          <li key={event.id}>{renderCard(event)}</li>
        ))}
      </ul>
      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-4 flex justify-center py-2"
          aria-hidden
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-600" />
        </div>
      )}
    </>
  )
}
