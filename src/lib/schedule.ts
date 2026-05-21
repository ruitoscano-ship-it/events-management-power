import { isActiveVolunteer } from './volunteers'
import type { EventData, ScheduleBlock, ScheduleCategory } from '../types'
import { formatTime } from './format'

export const categoryLabels: Record<ScheduleCategory, string> = {
  setup: 'SETUP',
  logistics: 'LOGÍSTICA',
  standard: 'STANDARD',
  latinas: 'LATINAS',
  break: 'PAUSA',
  ceremony: 'CERIMÓNIA',
  activity: 'ATIVIDADE',
}

export function volunteersForBlock(
  data: EventData,
  blockId: string,
): { id: string; name: string }[] {
  const ids = new Set<string>()
  for (const t of data.tasks) {
    if (t.schedule_block_id === blockId && t.volunteer_id) {
      ids.add(t.volunteer_id)
    }
  }
  return data.volunteers.filter((v) => ids.has(v.id) && isActiveVolunteer(v))
}

export function scheduleStats(schedule: ScheduleBlock[], pairsCount?: number | null) {
  const sorted = [...schedule].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  )
  const competitions = schedule.filter(
    (s) => s.category === 'standard' || s.category === 'latinas',
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    provas: competitions.length,
    provasHint: 'standard + latinas',
    pares: pairsCount ?? 0,
    inicio: first ? formatTime(first.starts_at) : '—',
    inicioHint: first?.category === 'setup' ? 'setup' : '',
    fim: last ? formatTime(last.ends_at) : '—',
    fimHint: 'premiação',
  }
}

export function defaultCategory(blockType: string, title: string): ScheduleCategory {
  const t = title.toLowerCase()
  if (blockType === 'break' || t.includes('pausa') || t.includes('almoço')) return 'break'
  if (blockType === 'logistics' || t.includes('secretariat') || t.includes('receção')) {
    return t.includes('setup') || t.includes('abertura') ? 'setup' : 'logistics'
  }
  if (t.includes('latin') || t.includes('cha-cha') || t.includes('jive')) return 'latinas'
  if (t.includes('standard') || t.includes('waltz') || t.includes('juvenis')) return 'standard'
  if (blockType === 'ceremony') return 'ceremony'
  if (blockType === 'competition') return 'standard'
  return 'activity'
}
