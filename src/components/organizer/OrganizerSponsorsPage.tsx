import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { formatEur } from '../../lib/currency'
import {
  SPONSOR_STATUS_LABELS,
  SPONSORSHIP_KIND_LABELS,
  sponsorDisplayValue,
  sumSponsorAmounts,
} from '../../lib/financials'
import { SponsorForm } from '../forms/SponsorForm'
import { Modal } from '../ui/Modal'
import type { EventSponsor, SponsorStatus } from '../../types'

const STATUS_COLORS: Record<SponsorStatus, string> = {
  promised: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  confirmed: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  received: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  cancelled: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
}

export function OrganizerSponsorsPage() {
  const { data, deleteSponsor } = useEvent()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<EventSponsor | null>(null)

  const totals = useMemo(() => sumSponsorAmounts(data.sponsors), [data.sponsors])
  const active = useMemo(
    () => data.sponsors.filter((s) => s.status !== 'cancelled'),
    [data.sponsors],
  )

  return (
    <div className="page-container space-y-8">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white uppercase">Patrocínios</h2>
            <p className="mt-1 text-sm text-slate-400">
              Regista patrocinadores, valor ou apoio em espécie, e acompanha o estado até receção.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null)
              setModal('add')
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Novo patrocinador
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard label="Patrocinadores ativos" value={String(active.length)} />
          <StatCard label="Valor comprometido" value={formatEur(totals.committed)} />
          <StatCard label="Valor recebido" value={formatEur(totals.received)} />
        </div>
      </section>

      <section>
        {data.sponsors.length === 0 ? (
          <p className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6 text-sm text-slate-500">
            Ainda não há patrocinadores registados.
          </p>
        ) : (
          <ul className="space-y-2 motion-stagger">
            {data.sponsors.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{s.name}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[s.status]}`}
                    >
                      {SPONSOR_STATUS_LABELS[s.status]}
                    </span>
                    <span className="text-[10px] uppercase text-slate-500">
                      {SPONSORSHIP_KIND_LABELS[s.sponsorship_kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#ff2d6a]">{sponsorDisplayValue(s)}</p>
                  {(s.contact_name || s.promised_at) && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {s.contact_name}
                      {s.contact_name && s.promised_at && ' · '}
                      {s.promised_at && `Promessa: ${s.promised_at}`}
                      {s.received_at && ` · Recebido: ${s.received_at}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(s)
                      setModal('edit')
                    }}
                    className="text-xs text-slate-400 hover:text-white border border-[#2a2a3d] rounded px-2 py-1"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSponsor(s.id)}
                    className="text-xs text-slate-500 hover:text-red-400 border border-[#2a2a3d] rounded px-2 py-1"
                  >
                    Apagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        title={modal === 'add' ? 'Novo patrocinador' : 'Editar patrocinador'}
        open={modal !== null}
        onClose={() => setModal(null)}
      >
        {modal === 'add' && <SponsorForm onDone={() => setModal(null)} />}
        {modal === 'edit' && selected && (
          <SponsorForm initial={selected} onDone={() => setModal(null)} />
        )}
      </Modal>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  )
}
