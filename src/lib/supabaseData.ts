import { saveCatalog } from './catalog'
import {
  mapAvailabilityRow,
  mapContributionRow,
  mapEventRow,
  mapRevenueRow,
  mapScheduleRow,
  mapSponsorRow,
  mapTaskRow,
  mapThirdPartyRequestRow,
  mapVolunteerRow,
} from './dbMappers'
import { mapVenueLayoutRow } from './venueLayout'
import { normalizeEventData } from './normalize'
import { isSupabaseConfigured, supabase } from './supabase'
import { isMissingRelationError } from './supabaseErrors'
import type { Event, EventCatalog, EventData } from '../types'

function emptyEventShell(event: Event): EventData {
  return normalizeEventData({
    event,
    schedule: [],
    volunteers: [],
    availability: [],
    contributions: [],
    tasks: [],
    venueLayout: null,
    sponsors: [],
    revenueEntries: [],
    thirdPartyRequests: [],
    auditLog: [],
  })
}

/** Lista de eventos na tabela `events` (para o ecrã de escolha). */
export async function fetchEventSummariesFromSupabase(): Promise<Event[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => mapEventRow(row as Record<string, unknown>))
}

/** Carrega um evento completo e dados relacionados. */
export async function fetchEventDataFromSupabase(
  eventId: string,
): Promise<EventData | null> {
  if (!supabase) return null

  const { data: event, error: evErr } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle()

  if (evErr) throw evErr
  if (!event) return null

  const mappedEvent = mapEventRow(event as Record<string, unknown>)

  const [schedule, volunteers, contributions, tasks, sponsors, revenue, thirdParty] =
    await Promise.all([
      supabase
        .from('schedule_blocks')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at'),
      supabase.from('volunteers').select('*').eq('event_id', eventId).order('name'),
      supabase.from('contributions').select('*').eq('event_id', eventId),
      supabase.from('volunteer_tasks').select('*').eq('event_id', eventId),
      supabase
        .from('event_sponsors')
        .select('*')
        .eq('event_id', eventId)
        .order('name'),
      supabase
        .from('revenue_entries')
        .select('*')
        .eq('event_id', eventId)
        .order('recorded_at', { ascending: false }),
      supabase
        .from('third_party_requests')
        .select('*')
        .eq('event_id', eventId)
        .order('organization_name'),
    ])

  if (schedule.error) throw schedule.error
  if (volunteers.error) throw volunteers.error
  if (contributions.error) throw contributions.error
  if (tasks.error) throw tasks.error
  if (sponsors.error) throw sponsors.error
  if (revenue.error) throw revenue.error
  if (
    thirdParty.error &&
    !isMissingRelationError(thirdParty.error, 'third_party_requests')
  ) {
    throw thirdParty.error
  }
  if (thirdParty.error) {
    console.warn(
      '[Supabase] Tabela third_party_requests em falta — executa supabase/migrations/007_third_party_requests.sql',
    )
  }

  const volunteerIds = (volunteers.data ?? []).map((v) => v.id)
  let availability: EventData['availability'] = []
  if (volunteerIds.length > 0) {
    const { data: avail, error: avErr } = await supabase
      .from('volunteer_availability')
      .select('*')
      .in('volunteer_id', volunteerIds)
    if (avErr) throw avErr
    availability = (avail ?? []).map((r) =>
      mapAvailabilityRow(r as Record<string, unknown>),
    )
  }

  const { data: layoutRow, error: layoutErr } = await supabase
    .from('venue_layouts')
    .select('layout_data')
    .eq('event_id', eventId)
    .maybeSingle()

  if (layoutErr) throw layoutErr

  const venueLayout = layoutRow?.layout_data
    ? mapVenueLayoutRow(eventId, layoutRow.layout_data)
    : null

  return normalizeEventData({
    event: mappedEvent,
    schedule: (schedule.data ?? []).map((r) =>
      mapScheduleRow(r as Record<string, unknown>),
    ),
    volunteers: (volunteers.data ?? []).map((r) =>
      mapVolunteerRow(r as Record<string, unknown>),
    ),
    availability,
    contributions: (contributions.data ?? []).map((r) =>
      mapContributionRow(r as Record<string, unknown>),
    ),
    tasks: (tasks.data ?? []).map((r) =>
      mapTaskRow(r as Record<string, unknown>),
    ),
    venueLayout,
    sponsors: (sponsors.data ?? []).map((r) =>
      mapSponsorRow(r as Record<string, unknown>),
    ),
    revenueEntries: (revenue.data ?? []).map((r) =>
      mapRevenueRow(r as Record<string, unknown>),
    ),
    thirdPartyRequests:
      thirdParty.error || !thirdParty.data
        ? []
        : thirdParty.data.map((r) =>
            mapThirdPartyRequestRow(r as Record<string, unknown>),
          ),
    auditLog: [],
  })
}

/** Constrói catálogo a partir do Supabase (summaries); detalhe carrega ao abrir o evento. */
export async function buildCatalogFromSupabase(): Promise<{
  events: Record<string, EventData>
}> {
  const summaries = await fetchEventSummariesFromSupabase()
  const events: Record<string, EventData> = {}

  for (const event of summaries) {
    events[event.id] = emptyEventShell(event)
  }

  return { events }
}

export async function hydrateCatalogFromSupabase(): Promise<boolean> {
  const result = await fetchCatalogFromSupabase()
  return result.ok
}

export async function fetchCatalogFromSupabase(): Promise<{
  catalog: EventCatalog
  ok: boolean
  error: string | null
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      catalog: { accounts: [], events: {} },
      ok: false,
      error: 'Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    }
  }
  try {
    const { events } = await buildCatalogFromSupabase()
    const catalog: EventCatalog = { accounts: [], events }
    saveCatalog(catalog, 'supabase')
    return { catalog, ok: true, error: null }
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Erro ao carregar eventos do servidor.'
    console.error('[Supabase] fetch catalog:', e)
    return { catalog: { accounts: [], events: {} }, ok: false, error: msg }
  }
}
