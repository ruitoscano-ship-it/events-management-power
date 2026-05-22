import { newId, mergeEventDateAndTime, toTimeLocal } from './datetime'
import type { EventData, ScheduleBlock, ScheduleCategory, VolunteerTask } from '../types'

export type ScheduleRowDraft = {
  title: string
  description: string
  location: string
  category: ScheduleCategory
  startTime: string
  endTime: string
  volunteerIds: string[]
}

export function volunteerIdsForBlock(data: EventData, blockId: string): string[] {
  const ids = new Set<string>()
  for (const t of data.tasks) {
    if (t.schedule_block_id === blockId && t.volunteer_id) {
      ids.add(t.volunteer_id)
    }
  }
  return [...ids]
}

export function draftFromBlock(data: EventData, block: ScheduleBlock): ScheduleRowDraft {
  return {
    title: block.title,
    description: block.description ?? '',
    location: block.location ?? '',
    category: block.category,
    startTime: toTimeLocal(block.starts_at),
    endTime: toTimeLocal(block.ends_at),
    volunteerIds: volunteerIdsForBlock(data, block.id),
  }
}

export function blockFromDraft(
  block: ScheduleBlock,
  draft: ScheduleRowDraft,
  eventDate: string,
): ScheduleBlock {
  return {
    ...block,
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    location: draft.location.trim() || null,
    category: draft.category,
    starts_at: mergeEventDateAndTime(eventDate, draft.startTime),
    ends_at: mergeEventDateAndTime(eventDate, draft.endTime),
  }
}

export function reconcileBlockTasks(
  data: EventData,
  block: ScheduleBlock,
  volunteerIds: string[],
): { tasks: VolunteerTask[]; removeIds: string[]; upsertTasks: VolunteerTask[] } {
  const existingForBlock = data.tasks.filter(
    (t) => t.schedule_block_id === block.id && t.volunteer_id,
  )
  const removeIds = existingForBlock
    .filter((t) => !volunteerIds.includes(t.volunteer_id!))
    .map((t) => t.id)

  const upsertTasks: VolunteerTask[] = []
  for (const vid of volunteerIds) {
    const found = existingForBlock.find((t) => t.volunteer_id === vid)
    upsertTasks.push(
      found
        ? {
            ...found,
            title: block.title,
            starts_at: block.starts_at,
            ends_at: block.ends_at,
          }
        : {
            id: newId(),
            event_id: block.event_id,
            volunteer_id: vid,
            schedule_block_id: block.id,
            title: block.title,
            starts_at: block.starts_at,
            ends_at: block.ends_at,
            status: 'assigned',
            notes: null,
          },
    )
  }

  const others = data.tasks.filter((t) => t.schedule_block_id !== block.id)
  return { tasks: [...others, ...upsertTasks], removeIds, upsertTasks }
}

export function draftsEqual(a: ScheduleRowDraft, b: ScheduleRowDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
