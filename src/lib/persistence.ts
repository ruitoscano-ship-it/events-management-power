import { supabase } from './supabase'
import type {
  Contribution,
  Event,
  EventData,
  ScheduleBlock,
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

async function dbUpsert(table: Table, row: object): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from(table).upsert(row)
  if (error) throw error
}

async function dbDelete(table: Table, id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function syncEvent(event: Event, useDb: boolean) {
  if (useDb) await dbUpsert('events', event)
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
