import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { dayLabelFromDate } from './normalize'
import type { Event } from '../types'

/** Interpreta `event_date` da base (YYYY-MM-DD). */
export function parseEventDate(eventDate: string): Date | null {
  if (!eventDate) return null
  try {
    const iso = eventDate.includes('T') ? eventDate : `${eventDate}T12:00:00`
    const d = parseISO(iso)
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

export function formatEventDateShort(eventDate: string): string {
  const d = parseEventDate(eventDate)
  if (!d) return eventDate || '—'
  return format(d, 'd MMM yyyy', { locale: pt })
}

export function formatEventDateLong(eventDate: string): string {
  const d = parseEventDate(eventDate)
  if (!d) return eventDate || '—'
  return format(d, "d 'de' MMMM yyyy", { locale: pt })
}

/** Dia da semana: valor da BD (`day_label`) ou calculado a partir de `event_date`. */
export function eventWeekdayLabel(event: Pick<Event, 'event_date' | 'day_label'>): string {
  if (event.day_label?.trim()) return event.day_label.trim()
  return dayLabelFromDate(event.event_date)
}

/** Ex.: «sábado, 14 jun 2026» — data sempre derivada de `event_date`. */
export function formatEventDateLine(event: Pick<Event, 'event_date' | 'day_label'>): string {
  const weekday = eventWeekdayLabel(event)
  const short = formatEventDateShort(event.event_date)
  return `${weekday}, ${short}`
}
