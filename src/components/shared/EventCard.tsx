import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar, MapPin, Users } from 'lucide-react'
import { isEventOngoing } from '../../lib/catalog'
import type { Event } from '../../types'

interface Props {
  event: Event
  onSelect: () => void
}

export function EventCard({ event, onSelect }: Props) {
  const ongoing = isEventOngoing(event.event_date)
  let dateLabel = event.event_date
  try {
    dateLabel = format(parseISO(event.event_date + 'T12:00:00'), 'd MMM yyyy', {
      locale: pt,
    })
  } catch {
    /* keep raw */
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4 text-left transition-colors hover:border-[#ff2d6a]/50 hover:bg-[#1a1a28] active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {event.edition_label && (
            <p className="truncate text-[10px] font-semibold tracking-widest text-[#ff2d6a] uppercase">
              {event.edition_label}
            </p>
          )}
          <h3 className="mt-0.5 font-bold text-white uppercase leading-snug text-sm sm:text-base">
            {event.name}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            ongoing
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {ongoing ? 'Em curso' : 'Passado'}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
        <li className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{event.day_label ?? '—'} · {dateLabel}</span>
        </li>
        {event.venue && (
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </li>
        )}
        {event.pairs_count != null && (
          <li className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{event.pairs_count} pares</span>
          </li>
        )}
      </ul>
    </button>
  )
}
