import { loadCatalog, saveCatalog } from './catalog'
import { normalizeEventData } from './normalize'
import { isSupabaseConfigured, supabase } from './supabase'
import type { Event, EventData } from '../types'

function emptyEventShell(event: Event): EventData {
  return normalizeEventData({
    event,
    schedule: [],
    volunteers: [],
    availability: [],
    contributions: [],
    tasks: [],
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
  return data ?? []
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

  const [schedule, volunteers, contributions, tasks] = await Promise.all([
    supabase
      .from('schedule_blocks')
      .select('*')
      .eq('event_id', eventId)
      .order('starts_at'),
    supabase.from('volunteers').select('*').eq('event_id', eventId).order('name'),
    supabase.from('contributions').select('*').eq('event_id', eventId),
    supabase.from('volunteer_tasks').select('*').eq('event_id', eventId),
  ])

  if (schedule.error) throw schedule.error
  if (volunteers.error) throw volunteers.error
  if (contributions.error) throw contributions.error
  if (tasks.error) throw tasks.error

  const volunteerIds = (volunteers.data ?? []).map((v) => v.id)
  let availability: EventData['availability'] = []
  if (volunteerIds.length > 0) {
    const { data: avail, error: avErr } = await supabase
      .from('volunteer_availability')
      .select('*')
      .in('volunteer_id', volunteerIds)
    if (avErr) throw avErr
    availability = avail ?? []
  }

  const local = loadCatalog()
  const cached = local.events[eventId]

  return normalizeEventData({
    event,
    schedule: schedule.data ?? [],
    volunteers: volunteers.data ?? [],
    availability,
    contributions: contributions.data ?? [],
    tasks: tasks.data ?? [],
    auditLog: cached?.auditLog ?? [],
  })
}

/** Constrói catálogo a partir do Supabase (summaries); detalhe carrega ao abrir o evento. */
export async function buildCatalogFromSupabase(): Promise<{
  events: Record<string, EventData>
}> {
  const summaries = await fetchEventSummariesFromSupabase()
  const local = loadCatalog()
  const events: Record<string, EventData> = {}

  for (const event of summaries) {
    events[event.id] =
      local.events[event.id] ?? emptyEventShell(event)
  }

  return { events }
}

export async function hydrateCatalogFromSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false
  try {
    const { events } = await buildCatalogFromSupabase()
    const merged = {
      accounts: [],
      events,
    }
    saveCatalog(merged)
    return true
  } catch (e) {
    console.error('[Supabase] hydrate catalog:', e)
    return false
  }
}
