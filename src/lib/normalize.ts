import { defaultCategory } from './schedule'
import type { EventData, ScheduleBlock } from '../types'

function normalizeBlock(block: ScheduleBlock): ScheduleBlock {
  return {
    ...block,
    category:
      block.category ??
      defaultCategory(block.block_type, block.title),
  }
}

export function normalizeEventData(data: EventData): EventData {
  return {
    ...data,
    schedule: data.schedule.map(normalizeBlock),
    event: {
      ...data.event,
      day_label: data.event.day_label ?? 'Sábado',
    },
  }
}
