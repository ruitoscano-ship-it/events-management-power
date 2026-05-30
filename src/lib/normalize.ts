import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { defaultCategory } from './schedule'
import type { EventData, ScheduleBlock, Volunteer } from '../types'

function normalizeBlock(block: ScheduleBlock): ScheduleBlock {
  return {
    ...block,
    category:
      block.category ??
      defaultCategory(block.block_type, block.title),
  }
}

function normalizeVolunteer(v: Volunteer): Volunteer {
  return {
    ...v,
    account_id: v.account_id ?? null,
    active: v.active !== false,
  }
}

function dayLabelFromDate(eventDate: string): string {
  try {
    const iso = eventDate.includes('T') ? eventDate : `${eventDate}T12:00:00`
    return format(parseISO(iso), 'EEEE', { locale: pt })
  } catch {
    return ''
  }
}

export function normalizeEventData(data: EventData): EventData {
  const eventDate = data.event.event_date
  return {
    ...data,
    venueLayout: data.venueLayout ?? null,
    sponsors: data.sponsors ?? [],
    revenueEntries: data.revenueEntries ?? [],
    thirdPartyRequests: data.thirdPartyRequests ?? [],
    auditLog: data.auditLog ?? [],
    schedule: data.schedule.map(normalizeBlock),
    volunteers: data.volunteers.map(normalizeVolunteer),
    event: {
      ...data.event,
      day_label: dayLabelFromDate(eventDate) || data.event.day_label,
    },
  }
}

export { dayLabelFromDate }
