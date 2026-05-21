import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { formatTimeRange } from '../../lib/format'
import { parseDisplayQuantity } from '../../lib/volunteerDashboard'
import { avatarColor, volunteerInitials } from '../../lib/volunteers'
import { GridView } from '../GridView'

export function OrganizerTeamPage() {
  const { data } = useEvent()

  const availByVolunteer = useMemo(() => {
    const map: Record<string, typeof data.availability> = {}
    for (const a of data.availability) {
      ;(map[a.volunteer_id] ??= []).push(a)
    }
    return map
  }, [data.availability])

  const itemsByVolunteer = useMemo(() => {
    const map: Record<string, typeof data.contributions> = {}
    for (const c of data.contributions) {
      if (!c.volunteer_id) continue
      ;(map[c.volunteer_id] ??= []).push(c)
    }
    return map
  }, [data.contributions])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">
      <section>
        <h2 className="text-xl font-bold text-white uppercase">Disponibilidade da equipa</h2>
        <p className="mt-1 text-sm text-slate-400 mb-6">
          Janelas horárias indicadas pelos voluntários para apoiar o dia.
        </p>
        <div className="organizer-grid rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
          <GridView />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-2">Por pessoa</h2>
        <p className="text-sm text-slate-400 mb-6">
          Disponibilidade e materiais que cada um se comprometeu a trazer.
        </p>
        <div className="grid gap-4 lg:grid-cols-2 motion-stagger">
          {data.volunteers.map((v) => {
            const slots = availByVolunteer[v.id] ?? []
            const items = itemsByVolunteer[v.id] ?? []
            return (
              <article
                key={v.id}
                className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-5"
              >
                <div className="flex items-center gap-3 border-b border-[#2a2a3d] pb-4">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: avatarColor(v.id) }}
                  >
                    {volunteerInitials(v.name)}
                  </span>
                  <div>
                    <p className="font-bold text-white uppercase tracking-wide">
                      {v.name}
                    </p>
                    {v.role && (
                      <p className="text-xs text-[#ff2d6a] mt-0.5">{v.role}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    Disponibilidade
                  </p>
                  {slots.length === 0 ? (
                    <p className="text-xs text-slate-600">Sem disponibilidade registada.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {slots.map((s) => (
                        <li
                          key={s.id}
                          className="font-mono text-xs text-slate-300 bg-[#1a1a28] rounded px-2 py-1.5"
                        >
                          {formatTimeRange(s.available_from, s.available_until)}
                          {s.notes && (
                            <span className="text-slate-500 font-sans ml-2">{s.notes}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">
                    Vai trazer
                  </p>
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-600">Nada assumido.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {items.map((c) => (
                        <li key={c.id} className="text-sm text-white">
                          <span className="text-[#ff2d6a] font-mono text-xs">
                            {parseDisplayQuantity(c.quantity)}
                          </span>{' '}
                          {c.item_name}
                          {c.destination && (
                            <span className="text-slate-500 text-xs"> · {c.destination}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
