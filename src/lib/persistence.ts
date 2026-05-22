import { eventToDbRow } from './dbMappers'
import { supabase } from './supabase'
import { venueLayoutToDbPayload } from './venueLayout'
import type {
  Contribution,
  Event,
  EventData,
  EventSponsor,
  RevenueEntry,
  ScheduleBlock,
  VenueLayout,
  Volunteer,
  VolunteerAvailability,
  VolunteerTask,
} from '../types'

type Table =
  | 'events'
  | 'schedule_blocks'
  | 'volunteers'
  | 'volunteer_availability'
  | 'contributions'
  | 'volunteer_tasks'
  | 'venue_layouts'
  | 'event_sponsors'
  | 'revenue_entries'

async function dbUpsert(
  table: Table,
  row: object,
  options?: { onConflict?: string },
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from(table)
    .upsert(row, options?.onConflict ? { onConflict: options.onConflict } : undefined)
  if (error) throw error
}

async function dbDelete(table: Table, id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function syncEvent(event: Event, useDb: boolean) {
  if (!useDb || !supabase) return

  const row = eventToDbRow(event)
  const { data, error } = await supabase
    .from('events')
    .update(row)
    .eq('id', event.id)
    .select('id, name')

  if (error) throw error
  if (data && data.length > 0) return

  const { error: upsertErr } = await supabase
    .from('events')
    .upsert(row, { onConflict: 'id' })

  if (upsertErr) throw upsertErr
}

export async function syncEventArchivedAt(
  event: Event,
  useDb: boolean,
): Promise<void> {
  if (!useDb || !supabase) return

  const { error } = await supabase
    .from('events')
    .update({ archived_at: event.archived_at ?? null })
    .eq('id', event.id)

  if (error?.code === 'PGRST204' && error.message.includes('archived_at')) {
    throw new Error(
      'Coluna archived_at em falta na base de dados. Executa supabase/migrations/005_events_archived.sql no Supabase.',
    )
  }
  if (error) throw error
}

export async function syncSchedule(block: ScheduleBlock, useDb: boolean) {
  if (useDb) await dbUpsert('schedule_blocks', block)
}

export async function syncVolunteer(volunteer: Volunteer, useDb: boolean) {
  if (useDb) await dbUpsert('volunteers', volunteer)
}

export async function syncAvailability(
  slot: VolunteerAvailability,
  useDb: boolean,
) {
  if (useDb) await dbUpsert('volunteer_availability', slot)
}

export async function syncContribution(
  contribution: Contribution,
  useDb: boolean,
) {
  if (useDb) await dbUpsert('contributions', contribution)
}

export async function syncTask(task: VolunteerTask, useDb: boolean) {
  if (useDb) await dbUpsert('volunteer_tasks', task)
}

export async function syncVenueLayout(layout: VenueLayout, useDb: boolean) {
  if (useDb) await dbUpsert('venue_layouts', venueLayoutToDbPayload(layout))
}

export async function syncSponsor(sponsor: EventSponsor, useDb: boolean) {
  if (useDb) await dbUpsert('event_sponsors', sponsor)
}

export async function syncRevenueEntry(entry: RevenueEntry, useDb: boolean) {
  if (useDb) await dbUpsert('revenue_entries', entry)
}

export async function removeSponsor(id: string, useDb: boolean) {
  if (useDb) await dbDelete('event_sponsors', id)
}

export async function removeRevenueEntry(id: string, useDb: boolean) {
  if (useDb) await dbDelete('revenue_entries', id)
}

export async function removeSchedule(id: string, useDb: boolean) {
  if (useDb) await dbDelete('schedule_blocks', id)
}

export async function removeVolunteer(id: string, useDb: boolean) {
  if (useDb) await dbDelete('volunteers', id)
}

export async function removeAvailability(id: string, useDb: boolean) {
  if (useDb) await dbDelete('volunteer_availability', id)
}

export async function removeContribution(id: string, useDb: boolean) {
  if (useDb) await dbDelete('contributions', id)
}

export async function removeTask(id: string, useDb: boolean) {
  if (useDb) await dbDelete('volunteer_tasks', id)
}

export function patchData(
  data: EventData,
  patch: Partial<EventData>,
): EventData {
  return { ...data, ...patch }
}
