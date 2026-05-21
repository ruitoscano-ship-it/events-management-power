import { useMemo, useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { parseDisplayQuantity } from '../../lib/volunteerDashboard'
import { avatarColor, volunteerInitials } from '../../lib/volunteers'
import { LogisticsNeedForm } from '../forms/LogisticsNeedForm'
import { Modal } from '../ui/Modal'

export function OrganizerLogisticsPage() {
  const { data, deleteContribution } = useEvent()
  const [showAdd, setShowAdd] = useState(false)

  const open = useMemo(
    () => data.contributions.filter((c) => !c.volunteer_id),
    [data.contributions],
  )

  const byVolunteer = useMemo(() => {
    const map = new Map<string, typeof data.contributions>()
    for (const c of data.contributions) {
      if (!c.volunteer_id) continue
      const list = map.get(c.volunteer_id) ?? []
      list.push(c)
      map.set(c.volunteer_id, list)
    }
    return map
  }, [data.contributions])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white uppercase">Necessidades logísticas</h2>
            <p className="mt-1 text-sm text-slate-400">
              Itens que ainda precisam de voluntário. A equipa vê esta lista e pode marcar «eu trago».
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-2 text-sm font-medium text-white hover:bg-[#e0265d]"
          >
            <Plus className="h-4 w-4" />
            Nova necessidade
          </button>
        </div>

        {open.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6">
            Nenhuma necessidade em aberto.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
              >
                <div>
                  <p className="font-medium text-white">{c.item_name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.needed_count ? `${c.needed_count} em falta` : c.quantity}
                    {c.destination ? ` · ${c.destination}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteContribution(c.id)}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-2">Quem traz o quê</h2>
        <p className="text-sm text-slate-400 mb-6">
          Resumo por voluntário — atualizado quando alguém marca «eu trago».
        </p>
        <div className="space-y-4">
          {data.volunteers.map((v) => {
            const items = byVolunteer.get(v.id) ?? []
            return (
              <article
                key={v.id}
                className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: avatarColor(v.id) }}
                  >
                    {volunteerInitials(v.name)}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{v.name}</p>
                    {v.role && (
                      <p className="text-xs text-[#ff2d6a] uppercase">{v.role}</p>
                    )}
                  </div>
                  <span className="ml-auto text-xs text-slate-500">
                    {items.length === 0 ? 'Sem itens' : `${items.length} item(ns)`}
                  </span>
                </div>
                {items.length > 0 ? (
                  <ul className="space-y-2 border-t border-[#2a2a3d] pt-3">
                    {items.map((c) => (
                      <li key={c.id} className="flex items-start gap-2 text-sm">
                        <Package className="h-4 w-4 text-[#ff2d6a] shrink-0 mt-0.5" />
                        <span className="text-white">
                          <span className="text-[#ff2d6a] font-mono text-xs mr-2">
                            {parseDisplayQuantity(c.quantity)}
                          </span>
                          {c.item_name}
                          {c.destination && (
                            <span className="text-slate-500"> → {c.destination}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 border-t border-[#2a2a3d] pt-3">
                    Ainda não assumiu nenhum item.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <Modal title="Nova necessidade logística" open={showAdd} onClose={() => setShowAdd(false)}>
        <LogisticsNeedForm onDone={() => setShowAdd(false)} />
      </Modal>
    </div>
  )
}
