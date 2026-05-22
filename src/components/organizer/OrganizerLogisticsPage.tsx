import { useMemo, useState } from 'react'
import { Check, Package, Plus } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { activeVolunteers, avatarColor, volunteerInitials } from '../../lib/volunteers'
import { parseDisplayQuantity } from '../../lib/volunteerDashboard'
import { LogisticsNeedForm } from '../forms/LogisticsNeedForm'
import { Modal } from '../ui/Modal'

export function OrganizerLogisticsPage() {
  const { data, deleteContribution, markContributionComplete, saveContribution } = useEvent()
  const [showAdd, setShowAdd] = useState(false)

  const open = useMemo(
    () => data.contributions.filter((c) => !c.volunteer_id && c.status !== 'delivered'),
    [data.contributions],
  )
  const assigned = useMemo(
    () =>
      data.contributions.filter(
        (c) => c.volunteer_id && c.status !== 'delivered',
      ),
    [data.contributions],
  )
  const complete = useMemo(
    () => data.contributions.filter((c) => c.status === 'delivered'),
    [data.contributions],
  )

  const volunteerName = (id: string) =>
    data.volunteers.find((v) => v.id === id)?.name ?? '—'

  return (
    <div className="page-container space-y-8 sm:space-y-10">
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white uppercase sm:text-xl">Em aberto</h2>
            <p className="mt-1.5 text-base leading-relaxed text-slate-300 sm:text-sm sm:text-slate-400">
              Necessidades à espera de voluntário («eu levo»).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-3 text-sm font-bold text-white sm:min-h-11 sm:w-auto sm:py-2.5"
          >
            <Plus className="h-4 w-4" />
            Nova necessidade
          </button>
        </div>
        {open.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6">
            Nada em aberto.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 motion-stagger">
            {open.map((c) => (
              <li
                key={c.id}
                className="flex justify-between gap-2 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
              >
                <div>
                  <p className="font-medium text-white">{c.item_name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.needed_count ? `${c.needed_count} em falta` : c.quantity}
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
        <h2 className="text-xl font-bold text-white uppercase mb-4">Atribuídos</h2>
        <p className="text-sm text-slate-400 mb-4">
          Confirmados mas ainda não marcados como concluídos.
        </p>
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum item atribuído pendente.</p>
        ) : (
          <ul className="space-y-2">
            {assigned.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ff2d6a]/30 bg-[#12121c] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {c.volunteer_id && (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: avatarColor(c.volunteer_id) }}
                    >
                      {volunteerInitials(volunteerName(c.volunteer_id))}
                    </span>
                  )}
                  <div>
                    <p className="text-white font-medium">{c.item_name}</p>
                    <p className="text-xs text-slate-400">
                      {volunteerName(c.volunteer_id!)}
                      {c.destination ? ` · ${c.destination}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => markContributionComplete(c.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/50 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Check className="h-3.5 w-3.5" />
                  Marcar concluído
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-400" />
          Completos
        </h2>
        {complete.length === 0 ? (
          <p className="text-sm text-slate-500">Ainda sem itens concluídos.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 motion-stagger">
            {complete.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3"
              >
                <p className="text-white font-medium">{c.item_name}</p>
                <p className="text-xs text-emerald-400/90 mt-1">
                  {parseDisplayQuantity(c.quantity)} · {c.volunteer_id ? volunteerName(c.volunteer_id) : '—'}
                  {c.destination ? ` → ${c.destination}` : ''}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    saveContribution({ ...c, status: 'confirmed' })
                  }
                  className="mt-2 text-[10px] text-slate-500 hover:text-white"
                >
                  Reabrir
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-4">Por voluntário ativo</h2>
        <div className="space-y-3">
          {activeVolunteers(data.volunteers).map((v) => {
            const items = data.contributions.filter((c) => c.volunteer_id === v.id)
            if (items.length === 0) return null
            return (
              <article
                key={v.id}
                className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
              >
                <p className="font-semibold text-white">{v.name}</p>
                <ul className="mt-2 space-y-1">
                  {items.map((c) => (
                    <li key={c.id} className="text-sm text-slate-300">
                      {c.item_name}
                      <span className={`ml-2 text-xs ${c.status === 'delivered' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {c.status === 'delivered' ? 'completo' : c.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <Modal title="Nova necessidade" open={showAdd} onClose={() => setShowAdd(false)}>
        <LogisticsNeedForm onDone={() => setShowAdd(false)} />
      </Modal>
    </div>
  )
}
