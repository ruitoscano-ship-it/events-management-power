import { dayLabelFromDate } from './normalize'
import type {
  Contribution,
  Event,
  ScheduleBlock,
  Volunteer,
  VolunteerAvailability,
  VolunteerTask,
} from '../types'

/** Normaliza linha `events` do PostgREST para o tipo da app. */
export function mapEventRow(row: Record<string, unknown>): Event {
  const eventDate = String(row.event_date ?? '')
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: row.description != null ? String(row.description) : null,
    venue: row.venue != null ? String(row.venue) : null,
    event_date: eventDate,
    sport_type: String(row.sport_type ?? 'danca_salao'),
    pairs_count:
      row.pairs_count != null && row.pairs_count !== ''
        ? Number(row.pairs_count)
        : null,
    day_label:
      row.day_label != null
        ? String(row.day_label)
        : eventDate
          ? dayLabelFromDate(eventDate)
          : null,
    edition_label:
      row.edition_label != null ? String(row.edition_label) : null,
  }
}

export function mapVolunteerRow(row: Record<string, unknown>): Volunteer {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    account_id: row.account_id != null ? String(row.account_id) : null,
    name: String(row.name ?? ''),
    email: row.email != null ? String(row.email) : null,
    phone: row.phone != null ? String(row.phone) : null,
    role: row.role != null ? String(row.role) : null,
    notes: row.notes != null ? String(row.notes) : null,
    active: row.active !== false,
  }
}

export function mapScheduleRow(row: Record<string, unknown>): ScheduleBlock {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    title: String(row.title ?? ''),
    description: row.description != null ? String(row.description) : null,
    starts_at: String(row.starts_at),
    ends_at: String(row.ends_at),
    location: row.location != null ? String(row.location) : null,
    block_type: row.block_type as ScheduleBlock['block_type'],
    category: row.category as ScheduleBlock['category'],
    sort_order: Number(row.sort_order ?? 0),
  }
}

export function mapContributionRow(row: Record<string, unknown>): Contribution {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    volunteer_id: row.volunteer_id != null ? String(row.volunteer_id) : null,
    item_name: String(row.item_name ?? ''),
    quantity: row.quantity != null ? String(row.quantity) : null,
    needed_by: row.needed_by != null ? String(row.needed_by) : null,
    status: row.status as Contribution['status'],
    notes: row.notes != null ? String(row.notes) : null,
    destination: row.destination != null ? String(row.destination) : null,
    needed_count:
      row.needed_count != null ? Number(row.needed_count) : null,
  }
}

export function mapAvailabilityRow(
  row: Record<string, unknown>,
): VolunteerAvailability {
  return {
    id: String(row.id),
    volunteer_id: String(row.volunteer_id),
    available_from: String(row.available_from),
    available_until: String(row.available_until),
    notes: row.notes != null ? String(row.notes) : null,
  }
}

export function mapTaskRow(row: Record<string, unknown>): VolunteerTask {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    volunteer_id: row.volunteer_id != null ? String(row.volunteer_id) : null,
    schedule_block_id:
      row.schedule_block_id != null ? String(row.schedule_block_id) : null,
    title: String(row.title ?? ''),
    starts_at: row.starts_at != null ? String(row.starts_at) : null,
    ends_at: row.ends_at != null ? String(row.ends_at) : null,
    status: row.status as VolunteerTask['status'],
    notes: row.notes != null ? String(row.notes) : null,
  }
}
