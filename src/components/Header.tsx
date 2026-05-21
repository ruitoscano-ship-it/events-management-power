import { MapPin, Sparkles } from 'lucide-react'
import { formatDate, formatShortDate } from '../lib/format'
import type { Event } from '../types'

interface HeaderProps {
  event: Event
  source: 'supabase' | 'local'
  isSupabaseConfigured: boolean
}

export function Header({ event, source, isSupabaseConfigured }: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600 uppercase tracking-wide">
            EventFlow · Dança de salão desportiva
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            {event.name}
          </h1>
          {event.description && (
            <p className="mt-2 max-w-2xl text-slate-600">{event.description}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            source === 'supabase'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {source === 'supabase' ? 'Supabase' : isSupabaseConfigured ? 'Modo local (fallback)' : 'Modo demo (localStorage)'}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="font-medium text-slate-800">
          {formatDate(event.event_date + 'T12:00:00')}
        </span>
        {event.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            {event.venue}
          </span>
        )}
        <span className="text-slate-400">· {formatShortDate(event.event_date + 'T12:00:00')}</span>
      </div>
    </header>
  )
}
