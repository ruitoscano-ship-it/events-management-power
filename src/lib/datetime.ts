import { format, parseISO } from 'date-fns'

export function toDatetimeLocal(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
}

export function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}
