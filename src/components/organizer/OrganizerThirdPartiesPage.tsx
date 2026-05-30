import { useMemo, useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import {
  countThirdPartyByStatus,
  THIRD_PARTY_ORG_LABELS,
  THIRD_PARTY_STATUS_COLORS,
  THIRD_PARTY_STATUS_LABELS,
  thirdPartyRequestSummary,
} from '../../lib/thirdParties'
import { ThirdPartyRequestForm } from '../forms/ThirdPartyRequestForm'
import { Modal } from '../ui/Modal'
import { ThirdPartyMaterialIcon } from './ThirdPartyMaterialIcon'
import type { ThirdPartyRequest, ThirdPartyRequestStatus } from '../../types'

const FILTER_ALL = 'all' as const
type StatusFilter = typeof FILTER_ALL | ThirdPartyRequestStatus

export function OrganizerThirdPartiesPage() {
  const { data, deleteThirdPartyRequest, eventClosed } = useEvent()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<ThirdPartyRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(FILTER_ALL)

  const active = useMemo(
    () => data.thirdPartyRequests.filter((r) => r.status !== 'cancelled'),
    [data.thirdPartyRequests],
  )

  const filtered = useMemo(() => {
    const list = [...data.thirdPartyRequests].sort((a, b) =>
      a.organization_name.localeCompare(b.organization_name, 'pt'),
    )
    if (statusFilter === FILTER_ALL) return list
    return list.filter((r) => r.status === statusFilter)
  }, [data.thirdPartyRequests, statusFilter])

  const pendingCount = countThirdPartyByStatus(active, ['draft', 'submitted'])
  const approvedCount = countThirdPartyByStatus(active, ['approved'])
  const fulfilledCount = countThirdPartyByStatus(active, ['fulfilled'])

  return (
    <div className="page-container space-y-8">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white uppercase">
              Pedidos a terceiros
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Gere pedidos a entidades de apoio — câmara municipal, freguesia,
              proteção civil — para som, cadeiras, mesas, barreiras e outro
              material.
            </p>
          </div>
          {!eventClosed && (
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setModal('add')
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-2 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Novo pedido
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pedidos ativos" value={String(active.length)} />
          <StatCard label="Em curso" value={String(pendingCount)} />
          <StatCard label="Aprovados" value={String(approvedCount)} />
          <StatCard label="Entregues" value={String(fulfilledCount)} />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <FilterChip
          active={statusFilter === FILTER_ALL}
          onClick={() => setStatusFilter(FILTER_ALL)}
        >
          Todos
        </FilterChip>
        {(
          Object.keys(THIRD_PARTY_STATUS_LABELS) as ThirdPartyRequestStatus[]
        ).map((s) => (
          <FilterChip
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {THIRD_PARTY_STATUS_LABELS[s]}
          </FilterChip>
        ))}
      </section>

      <section>
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6 text-sm text-slate-500">
            {data.thirdPartyRequests.length === 0
              ? 'Ainda não há pedidos a entidades externas.'
              : 'Nenhum pedido com este filtro.'}
          </p>
        ) : (
          <ul className="space-y-2 motion-stagger">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#2a2a3d] bg-[#0a0a12]">
                    <ThirdPartyMaterialIcon category={r.material_category} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2
                        className="h-3.5 w-3.5 shrink-0 text-slate-500"
                        aria-hidden
                      />
                      <p className="font-semibold text-white">
                        {r.organization_name}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${THIRD_PARTY_STATUS_COLORS[r.status]}`}
                      >
                        {THIRD_PARTY_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {THIRD_PARTY_ORG_LABELS[r.organization_kind]}
                    </p>
                    <p className="mt-1 text-sm text-[#ff2d6a]">
                      {thirdPartyRequestSummary(r)}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-300">
                      {r.item_description}
                    </p>
                    {(r.reference_number ||
                      r.needed_by ||
                      r.contact_name) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {r.reference_number && `Ref. ${r.reference_number}`}
                        {r.reference_number && r.needed_by && ' · '}
                        {r.needed_by && `Até ${r.needed_by}`}
                        {(r.reference_number || r.needed_by) &&
                          r.contact_name &&
                          ' · '}
                        {r.contact_name}
                      </p>
                    )}
                  </div>
                </div>
                {!eventClosed && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(r)
                        setModal('edit')
                      }}
                      className="rounded border border-[#2a2a3d] px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteThirdPartyRequest(r.id)}
                      className="rounded border border-[#2a2a3d] px-2 py-1 text-xs text-slate-500 hover:text-red-400"
                    >
                      Apagar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        title={modal === 'add' ? 'Novo pedido a terceiro' : 'Editar pedido'}
        open={modal !== null}
        onClose={() => setModal(null)}
      >
        {modal === 'add' && <ThirdPartyRequestForm onDone={() => setModal(null)} />}
        {modal === 'edit' && selected && (
          <ThirdPartyRequestForm
            initial={selected}
            onDone={() => setModal(null)}
          />
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

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
        active
          ? 'border-[#ff2d6a]/60 bg-[#ff2d6a]/15 text-white'
          : 'border-[#2a2a3d] bg-[#1a1a28] text-slate-500 hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
