import { useMemo, useState } from 'react'
import { Building2, ExternalLink, Plus, TrendingUp } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { formatEur } from '../../lib/currency'
import {
  activeSponsors,
  REVENUE_SOURCE_LABELS,
  SPONSOR_STATUS_LABELS,
  SPONSORSHIP_KIND_LABELS,
  sponsorCashAmount,
  sponsorDisplayValue,
  sumRevenue,
  sumSponsorAmounts,
} from '../../lib/financials'
import { RevenueEntryForm } from '../forms/RevenueEntryForm'
import { SponsorForm } from '../forms/SponsorForm'
import { Modal } from '../ui/Modal'
import type { EventSponsor, RevenueEntry, RevenueEntryType, RevenueSource, SponsorStatus } from '../../types'

type ModalState =
  | { source: RevenueSource; entryType: RevenueEntryType; edit?: RevenueEntry }
  | null

const SPONSOR_STATUS_COLORS: Record<SponsorStatus, string> = {
  promised: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  confirmed: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  received: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  cancelled: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
}

export function OrganizerFinancialsPage() {
  const { data, deleteRevenueEntry, deleteSponsor, eventClosed } = useEvent()
  const [modal, setModal] = useState<ModalState>(null)
  const [sponsorModal, setSponsorModal] = useState<'add' | 'edit' | null>(null)
  const [editSponsor, setEditSponsor] = useState<EventSponsor | null>(null)

  const forecastTotal = useMemo(
    () => sumRevenue(data.revenueEntries, { entry_type: 'forecast' }),
    [data.revenueEntries],
  )
  const actualTotal = useMemo(
    () => sumRevenue(data.revenueEntries, { entry_type: 'actual' }),
    [data.revenueEntries],
  )
  const barForecast = useMemo(
    () => sumRevenue(data.revenueEntries, { source: 'bar', entry_type: 'forecast' }),
    [data.revenueEntries],
  )
  const barActual = useMemo(
    () => sumRevenue(data.revenueEntries, { source: 'bar', entry_type: 'actual' }),
    [data.revenueEntries],
  )
  const ticketsForecast = useMemo(
    () =>
      sumRevenue(data.revenueEntries, { source: 'tickets', entry_type: 'forecast' }),
    [data.revenueEntries],
  )
  const ticketsActual = useMemo(
    () => sumRevenue(data.revenueEntries, { source: 'tickets', entry_type: 'actual' }),
    [data.revenueEntries],
  )

  const variance = actualTotal - forecastTotal
  const sponsorTotals = useMemo(() => sumSponsorAmounts(data.sponsors), [data.sponsors])
  const sponsorsActive = useMemo(() => activeSponsors(data.sponsors), [data.sponsors])
  const totalWithSponsors = actualTotal + sponsorTotals.received

  return (
    <div className="page-container space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white uppercase flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#ff2d6a]" />
          Financeiro
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Receitas do bar e bilhetes, patrocínios comprometidos e recebidos, e visão
          consolidada do evento.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Previsão (bar + bilhetes)" value={formatEur(forecastTotal)} accent="cyan" />
          <SummaryCard label="Receitas registadas" value={formatEur(actualTotal)} accent="emerald" />
          <SummaryCard
            label="Patrocínios comprometidos"
            value={formatEur(sponsorTotals.committed)}
            accent="slate"
          />
          <SummaryCard
            label="Patrocínios recebidos"
            value={formatEur(sponsorTotals.received)}
            accent="emerald"
          />
          <SummaryCard
            label="Total (receitas + patrocínios)"
            value={formatEur(totalWithSponsors)}
            accent="emerald"
          />
          <SummaryCard
            label="Diferença prev. vs real"
            value={formatEur(variance)}
            accent={variance >= 0 ? 'emerald' : 'amber'}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Bar: {formatEur(barForecast)} prev. / {formatEur(barActual)} real · Bilhetes:{' '}
          {formatEur(ticketsForecast)} / {formatEur(ticketsActual)}
        </p>
      </section>

      <RevenueSection
        title="Bar"
        source="bar"
        forecast={barForecast}
        actual={barActual}
        entries={data.revenueEntries.filter((e) => e.source === 'bar')}
        onAddForecast={() =>
          setModal({ source: 'bar', entryType: 'forecast' })
        }
        onAddActual={() => setModal({ source: 'bar', entryType: 'actual' })}
        onEdit={(entry) => setModal({ source: 'bar', entryType: entry.entry_type, edit: entry })}
        onDelete={deleteRevenueEntry}
      />

      <SponsorsFinanceSection
        sponsors={sponsorsActive}
        committed={sponsorTotals.committed}
        received={sponsorTotals.received}
        eventClosed={eventClosed}
        onAdd={() => {
          setEditSponsor(null)
          setSponsorModal('add')
        }}
        onEdit={(s) => {
          setEditSponsor(s)
          setSponsorModal('edit')
        }}
        onDelete={deleteSponsor}
      />

      <RevenueSection
        title="Bilhetes"
        source="tickets"
        forecast={ticketsForecast}
        actual={ticketsActual}
        entries={data.revenueEntries.filter((e) => e.source === 'tickets')}
        onAddForecast={() =>
          setModal({ source: 'tickets', entryType: 'forecast' })
        }
        onAddActual={() => setModal({ source: 'tickets', entryType: 'actual' })}
        onEdit={(entry) =>
          setModal({ source: 'tickets', entryType: entry.entry_type, edit: entry })
        }
        onDelete={deleteRevenueEntry}
      />

      <Modal
        title={sponsorModal === 'add' ? 'Novo patrocinador' : 'Editar patrocinador'}
        open={sponsorModal !== null}
        onClose={() => setSponsorModal(null)}
      >
        {sponsorModal === 'add' && (
          <SponsorForm onDone={() => setSponsorModal(null)} />
        )}
        {sponsorModal === 'edit' && editSponsor && (
          <SponsorForm initial={editSponsor} onDone={() => setSponsorModal(null)} />
        )}
      </Modal>

      <Modal
        title={
          modal?.edit
            ? 'Editar entrada'
            : modal?.entryType === 'forecast'
              ? `Nova previsão — ${modal ? REVENUE_SOURCE_LABELS[modal.source] : ''}`
              : `Registar receita — ${modal ? REVENUE_SOURCE_LABELS[modal.source] : ''}`
        }
        open={modal !== null}
        onClose={() => setModal(null)}
      >
        {modal && (
          <RevenueEntryForm
            source={modal.source}
            entryType={modal.entryType}
            initial={modal.edit}
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}

function SponsorsFinanceSection({
  sponsors,
  committed,
  received,
  eventClosed,
  onAdd,
  onEdit,
  onDelete,
}: {
  sponsors: EventSponsor[]
  committed: number
  received: number
  eventClosed: boolean
  onAdd: () => void
  onEdit: (s: EventSponsor) => void
  onDelete: (id: string) => void
}) {
  const pending = Math.max(0, committed - received)

  return (
    <section className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold uppercase text-white">
            <Building2 className="h-5 w-5 text-[#ff2d6a]" />
            Patrocínios
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Comprometido {formatEur(committed)} · Recebido {formatEur(received)} · Em falta{' '}
            {formatEur(pending)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!eventClosed && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 rounded-lg bg-[#ff2d6a] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Patrocinador
            </button>
          )}
          <a
            href="#sponsors"
            className="inline-flex items-center gap-1 rounded-lg border border-[#2a2a3d] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Separador sponsors
          </a>
        </div>
      </div>

      {sponsors.length === 0 ? (
        <p className="text-sm text-slate-600">
          Sem patrocínios ativos. Adiciona contribuições monetárias ou em espécie.
        </p>
      ) : (
        <ul className="space-y-2">
          {sponsors.map((s) => {
            const cash = sponsorCashAmount(s)
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#2a2a3d]/80 bg-[#0a0a12] px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{s.name}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SPONSOR_STATUS_COLORS[s.status]}`}
                    >
                      {SPONSOR_STATUS_LABELS[s.status]}
                    </span>
                    <span className="text-[10px] uppercase text-slate-500">
                      {SPONSORSHIP_KIND_LABELS[s.sponsorship_kind]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[#ff2d6a]">{sponsorDisplayValue(s)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {cash > 0 ? (
                    <span className="text-sm font-semibold text-emerald-400">
                      {formatEur(cash)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Em espécie</span>
                  )}
                  {!eventClosed && (
                    <span className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        className="text-[10px] text-slate-500 hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(s.id)}
                        className="text-[10px] text-slate-500 hover:text-red-400"
                      >
                        Apagar
                      </button>
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: 'cyan' | 'emerald' | 'amber' | 'slate'
}) {
  const colors = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    slate: 'text-white',
  }
  return (
    <div className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-base font-bold sm:text-lg ${colors[accent]}`}>{value}</p>
    </div>
  )
}

function RevenueSection({
  title,
  forecast,
  actual,
  entries,
  onAddForecast,
  onAddActual,
  onEdit,
  onDelete,
}: {
  title: string
  source: RevenueSource
  forecast: number
  actual: number
  entries: RevenueEntry[]
  onAddForecast: () => void
  onAddActual: () => void
  onEdit: (e: RevenueEntry) => void
  onDelete: (id: string) => void
}) {
  const forecasts = entries.filter((e) => e.entry_type === 'forecast')
  const actuals = entries.filter((e) => e.entry_type === 'actual')

  return (
    <section className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white uppercase">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Previsão {formatEur(forecast)} · Registado {formatEur(actual)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddForecast}
            className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Previsão
          </button>
          <button
            type="button"
            onClick={onAddActual}
            className="inline-flex items-center gap-1 rounded-lg bg-[#ff2d6a] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Registar receita
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EntryList
          heading="Previsões"
          items={forecasts}
          onEdit={onEdit}
          onDelete={onDelete}
          empty="Sem previsões."
        />
        <EntryList
          heading="Receitas registadas"
          items={actuals}
          onEdit={onEdit}
          onDelete={onDelete}
          empty="Nada registado ainda."
        />
      </div>
    </section>
  )
}

function EntryList({
  heading,
  items,
  empty,
  onEdit,
  onDelete,
}: {
  heading: string
  items: RevenueEntry[]
  empty: string
  onEdit: (e: RevenueEntry) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
        {heading}
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li
              key={e.id}
              className="flex justify-between gap-2 rounded-lg border border-[#2a2a3d]/80 bg-[#0a0a12] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {e.description ?? '—'}
                </p>
                <p className="text-xs text-slate-500">
                  {e.recorded_at}
                  {e.quantity != null &&
                    e.unit_price != null &&
                    ` · ${e.quantity} × ${formatEur(e.unit_price)}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold text-emerald-400">
                  {formatEur(e.amount)}
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(e)}
                    className="text-[10px] text-slate-500 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(e.id)}
                    className="text-[10px] text-slate-500 hover:text-red-400"
                  >
                    Apagar
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
