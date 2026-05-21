import { formatTime } from './format'
import { volunteersForBlock } from './schedule'
import type { EventData, ScheduleBlock, VolunteerTask } from '../types'

export interface DayRow {
  taskId: string
  startsAt: string
  endsAt: string
  title: string
  location: string
  category: ScheduleBlock['category']
  othersCount: number
}

export function shiftLabels(
  availability: EventData['availability'],
  volunteerId: string,
): string[] {
  return availability
    .filter((a) => a.volunteer_id === volunteerId)
    .map(
      (a) =>
        `${formatTime(a.available_from)}-${formatTime(a.available_until)}`,
    )
}

export function buildMyDayRows(
  data: EventData,
  volunteerId: string,
): DayRow[] {
  const myTasks = data.tasks
    .filter((t) => t.volunteer_id === volunteerId && t.starts_at && t.ends_at)
    .sort(
      (a, b) =>
        new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime(),
    )

  return myTasks.map((t) => rowFromTask(data, t))
}

function rowFromTask(data: EventData, task: VolunteerTask): DayRow {
  const block = task.schedule_block_id
    ? data.schedule.find((s) => s.id === task.schedule_block_id)
    : null
  const onBlock = task.schedule_block_id
    ? volunteersForBlock(data, task.schedule_block_id)
    : []
  const othersCount = Math.max(0, onBlock.length - 1)

  return {
    taskId: task.id,
    startsAt: task.starts_at!,
    endsAt: task.ends_at!,
    title: block?.title ?? task.title,
    location: block?.location ?? 'GERAL',
    category: block?.category ?? 'activity',
    othersCount,
  }
}

export function countContributionUnits(contributions: EventData['contributions']) {
  return contributions.reduce((sum, c) => {
    const m = c.quantity?.match(/x?\s*(\d+)/i) ?? c.needed_count
    if (typeof m === 'number') return sum + m
    if (Array.isArray(m) && m[1]) return sum + parseInt(m[1], 10)
    return sum + 1
  }, 0)
}

export function parseDisplayQuantity(quantity: string | null): string {
  if (!quantity) return 'x1'
  if (/^x\d/i.test(quantity)) return quantity
  const m = quantity.match(/^(\d+)/)
  return m ? `x${m[1]}` : 'x1'
}
