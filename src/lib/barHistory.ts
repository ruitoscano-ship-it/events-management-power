import { mapBarOperationRow, mapEventRow } from './dbMappers'
import { supabase } from './supabase'
import type { BarCloseSnapshot, BarHistoryEntry } from '../types'

export async function fetchBarHistoryFromSupabase(
  excludeEventId?: string,
): Promise<BarHistoryEntry[]> {
  if (!supabase) return []

  const { data: ops, error } = await supabase
    .from('bar_operations')
    .select('event_id, closed_at, close_snapshot')
    .eq('status', 'closed')
    .not('close_snapshot', 'is', null)
    .order('closed_at', { ascending: false })
    .limit(30)

  if (error) throw error

  const rows = (ops ?? []).filter(
    (r) => !excludeEventId || String(r.event_id) !== excludeEventId,
  )
  if (rows.length === 0) return []

  const eventIds = [...new Set(rows.map((r) => String(r.event_id)))]
  const { data: events, error: evErr } = await supabase
    .from('events')
    .select('id, name, event_date')
    .in('id', eventIds)

  if (evErr) throw evErr

  const eventMap = new Map(
    (events ?? []).map((e) => {
      const ev = mapEventRow(e as Record<string, unknown>)
      return [ev.id, ev] as const
    }),
  )

  return rows
    .map((row) => {
      const eventId = String(row.event_id)
      const ev = eventMap.get(eventId)
      const snapshot = row.close_snapshot as BarCloseSnapshot | null
      if (!snapshot || !ev) return null
      return {
        event_id: eventId,
        event_name: ev.name,
        event_date: ev.event_date,
        closed_at: String(row.closed_at ?? snapshot.closed_at),
        snapshot,
      } satisfies BarHistoryEntry
    })
    .filter((x): x is BarHistoryEntry => x != null)
}

export function barHistoryFromCatalog(
  events: Record<string, { event: { id: string; name: string; event_date: string }; barOperation: ReturnType<typeof mapBarOperationRow> | null }>,
  excludeEventId?: string,
): BarHistoryEntry[] {
  const out: BarHistoryEntry[] = []
  for (const [id, data] of Object.entries(events)) {
    if (excludeEventId && id === excludeEventId) continue
    const op = data.barOperation
    if (op?.status === 'closed' && op.close_snapshot) {
      out.push({
        event_id: id,
        event_name: data.event.name,
        event_date: data.event.event_date,
        closed_at: op.closed_at ?? op.close_snapshot.closed_at,
        snapshot: op.close_snapshot,
      })
    }
  }
  return out.sort(
    (a, b) => new Date(b.closed_at).getTime() - new Date(a.closed_at).getTime(),
  )
}
