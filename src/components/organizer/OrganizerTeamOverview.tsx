import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { formatTimeRange } from '../../lib/format'
import { parseDisplayQuantity } from '../../lib/volunteerDashboard'
import { GridView } from '../GridView'
import type { Volunteer } from '../../types'

interface Props {
  volunteers: Volunteer[]
}

export function OrganizerTeamOverview({ volunteers }: Props) {
  const { data } = useEvent()
  const ids = new Set(volunteers.map((v) => v.id))

  const availByVolunteer = useMemo(() => {
    const map: Record<string, typeof data.availability> = {}
    for (const a of data.availability) {
      if (!ids.has(a.volunteer_id)) continue
      ;(map[a.volunteer_id] ??= []).push(a)
    }
    return map
  }, [data.availability, ids])

  const itemsByVolunteer = useMemo(() => {
    const map: Record<string, typeof data.contributions> = {}
    for (const c of data.contributions) {
      if (!c.volunteer_id || !ids.has(c.volunteer_id)) continue
      ;(map[c.volunteer_id] ??= []).push(c)
    }
    return map
  }, [data.contributions, ids])

  return (
    <>
      <section>
        <h2 className="text-xl font-bold text-white uppercase">Disponibilidade (ativos)</h2>
        <p className="mt-1 text-sm text-slate-400 mb-6">
          Vista geral das janelas horárias declaradas.
        </p>
        <div className="organizer-grid rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
          <GridView />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-2">Resumo por pessoa</h2>
        <div className="grid gap-4 lg:grid-cols-2 motion-stagger">
          {volunteers.map((v) => {
            const slots = availByVolunteer[v.id] ?? []
            const items = itemsByVolunteer[v.id] ?? []
            return (
              <article
                key={v.id}
                className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-5"
              >
                <p className="font-bold text-white">{v.name}</p>
                <div className="mt-3">
                  <p className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <Clock className="h-3 w-3" /> Disponibilidade
                  </p>
                  {slots.length === 0 ? (
                    <p className="text-xs text-slate-600">—</p>
                  ) : (
                    slots.map((s) => (
                      <p key={s.id} className="font-mono text-xs text-slate-400">
                        {formatTimeRange(s.available_from, s.available_until)}
                      </p>
                    ))
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Vai trazer</p>
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-600">—</p>
                  ) : (
                    items.map((c) => (
                      <p key={c.id} className="text-sm text-white">
                        {parseDisplayQuantity(c.quantity)} {c.item_name}
                        {c.status === 'delivered' && (
                          <span className="text-emerald-400 text-xs ml-1">✓</span>
                        )}
                      </p>
                    ))
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
