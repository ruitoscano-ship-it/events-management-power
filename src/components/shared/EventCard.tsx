import { Calendar, MapPin, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { isEventArchived, isEventOngoing } from '../../lib/catalog'
import { formatEventDateLine } from '../../lib/eventDate'
import type { Event } from '../../types'

interface Props {
  event: Event
  onSelect: () => void
  footer?: ReactNode
  /** When false, card is not clickable (e.g. archived list). */
  selectable?: boolean
}

export function EventCard({ event, onSelect, footer, selectable = true }: Props) {
  const ongoing = isEventOngoing(event.event_date)
  const archived = isEventArchived(event)
  const dateLine = formatEventDateLine(event)

  return (
    <div className="w-full rounded-xl border border-[#2a2a3d] bg-[#12121c] overflow-hidden">
    <button
      type="button"
      onClick={selectable ? onSelect : undefined}
      disabled={!selectable}
      className={`w-full p-4 text-left transition-colors ${
        selectable
          ? 'hover:border-[#ff2d6a]/50 hover:bg-[#1a1a28] active:scale-[0.99]'
          : 'cursor-default opacity-80'
      }`}
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
            archived
              ? 'bg-amber-500/20 text-amber-400'
              : ongoing
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {archived ? 'Arquivado' : ongoing ? 'Em curso' : 'Passado'}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
        <li className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{dateLine}</span>
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
    {footer ? (
      <div className="border-t border-[#2a2a3d] px-4 py-2">{footer}</div>
    ) : null}
    </div>
  )
}
