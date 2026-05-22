import { format, parseISO } from 'date-fns'

export function toDatetimeLocal(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
}

export function toTimeLocal(iso: string): string {
  return format(parseISO(iso), 'HH:mm')
}

/** Combine event day (YYYY-MM-DD) with HH:mm into ISO UTC. */
export function mergeEventDateAndTime(eventDate: string, time: string): string {
  return fromDatetimeLocal(`${eventDate}T${time}`)
}

export function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}
