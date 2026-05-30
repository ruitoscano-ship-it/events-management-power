import { dayLabelFromDate } from './normalize'
import type {
  Contribution,
  Event,
  EventSponsor,
  RevenueEntry,
  ScheduleBlock,
  SponsorStatus,
  SponsorshipKind,
  RevenueEntryType,
  RevenueSource,
  BarCloseSnapshot,
  BarOperation,
  BarOperationStatus,
  BarProduct,
  BarSale,
  ThirdPartyMaterialCategory,
  ThirdPartyOrgKind,
  ThirdPartyRequest,
  ThirdPartyRequestStatus,
  Volunteer,
  VolunteerAvailability,
  VolunteerTask,
} from '../types'

/** Normaliza linha `events` do PostgREST para o tipo da app. */
export function mapEventRow(row: Record<string, unknown>): Event {
  const rawDate = String(row.event_date ?? '')
  const eventDate = rawDate.includes('T') ? rawDate.slice(0, 10) : rawDate
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
    archived_at:
      row.archived_at != null ? String(row.archived_at) : null,
  }
}

/** Row for Supabase `events` — omits `archived_at` unless requested (column may be missing pre-migration). */
export function eventToDbRow(
  event: Event,
  options?: { includeArchivedAt?: boolean },
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: event.id,
    name: event.name,
    description: event.description,
    venue: event.venue,
    event_date: event.event_date,
    sport_type: event.sport_type,
    pairs_count: event.pairs_count ?? null,
    day_label: event.day_label ?? null,
    edition_label: event.edition_label ?? null,
  }
  if (options?.includeArchivedAt) {
    row.archived_at = event.archived_at ?? null
  }
  return row
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

function mapNumeric(row: Record<string, unknown>, key: string): number | null {
  const v = row[key]
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function mapSponsorRow(row: Record<string, unknown>): EventSponsor {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    name: String(row.name ?? ''),
    sponsorship_kind: (row.sponsorship_kind as SponsorshipKind) ?? 'cash',
    amount: mapNumeric(row, 'amount'),
    in_kind_description:
      row.in_kind_description != null ? String(row.in_kind_description) : null,
    status: (row.status as SponsorStatus) ?? 'promised',
    contact_name: row.contact_name != null ? String(row.contact_name) : null,
    contact_email: row.contact_email != null ? String(row.contact_email) : null,
    notes: row.notes != null ? String(row.notes) : null,
    promised_at: row.promised_at != null ? String(row.promised_at).slice(0, 10) : null,
    received_at: row.received_at != null ? String(row.received_at).slice(0, 10) : null,
  }
}

export function mapThirdPartyRequestRow(
  row: Record<string, unknown>,
): ThirdPartyRequest {
  const date = (key: string) => {
    const v = row[key]
    return v != null ? String(v).slice(0, 10) : null
  }
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    organization_name: String(row.organization_name ?? ''),
    organization_kind: (row.organization_kind as ThirdPartyOrgKind) ?? 'municipality',
    material_category: (row.material_category as ThirdPartyMaterialCategory) ?? 'other',
    item_description: String(row.item_description ?? ''),
    quantity: row.quantity != null ? String(row.quantity) : null,
    status: (row.status as ThirdPartyRequestStatus) ?? 'draft',
    reference_number:
      row.reference_number != null ? String(row.reference_number) : null,
    contact_name: row.contact_name != null ? String(row.contact_name) : null,
    contact_email: row.contact_email != null ? String(row.contact_email) : null,
    contact_phone: row.contact_phone != null ? String(row.contact_phone) : null,
    requested_at: date('requested_at'),
    needed_by: date('needed_by'),
    submitted_at: date('submitted_at'),
    resolved_at: date('resolved_at'),
    notes: row.notes != null ? String(row.notes) : null,
  }
}

export function mapBarOperationRow(row: Record<string, unknown>): BarOperation {
  let snapshot: BarCloseSnapshot | null = null
  const raw = row.close_snapshot
  if (raw && typeof raw === 'object') {
    snapshot = raw as BarCloseSnapshot
  }
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    status: (row.status as BarOperationStatus) ?? 'active',
    opened_at: String(row.opened_at ?? new Date().toISOString()),
    closed_at: row.closed_at != null ? String(row.closed_at) : null,
    close_snapshot: snapshot,
    revenue_sync_entry_id:
      row.revenue_sync_entry_id != null ? String(row.revenue_sync_entry_id) : null,
  }
}

export function mapBarProductRow(row: Record<string, unknown>): BarProduct {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    name: String(row.name ?? ''),
    unit_price: mapNumeric(row, 'unit_price') ?? 0,
    quantity_collected: mapNumeric(row, 'quantity_collected') ?? 0,
    quantity_allocated: mapNumeric(row, 'quantity_allocated') ?? 0,
    sort_order: Number(row.sort_order ?? 0),
    active: row.active !== false,
  }
}

export function mapBarSaleRow(row: Record<string, unknown>): BarSale {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    product_id: String(row.product_id),
    quantity: mapNumeric(row, 'quantity') ?? 1,
    unit_price: mapNumeric(row, 'unit_price') ?? 0,
    total_amount: mapNumeric(row, 'total_amount') ?? 0,
    sold_at: String(row.sold_at ?? new Date().toISOString()),
    notes: row.notes != null ? String(row.notes) : null,
  }
}

export function mapRevenueRow(row: Record<string, unknown>): RevenueEntry {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    source: (row.source as RevenueSource) ?? 'other',
    entry_type: (row.entry_type as RevenueEntryType) ?? 'forecast',
    description: row.description != null ? String(row.description) : null,
    amount: mapNumeric(row, 'amount') ?? 0,
    quantity: mapNumeric(row, 'quantity'),
    unit_price: mapNumeric(row, 'unit_price'),
    recorded_at:
      row.recorded_at != null
        ? String(row.recorded_at).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    notes: row.notes != null ? String(row.notes) : null,
  }
}
