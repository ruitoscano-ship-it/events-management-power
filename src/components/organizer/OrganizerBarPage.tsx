import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  History,
  Lock,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Wine,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useEvent } from '../../context/EventContext'
import { fetchBarHistoryFromSupabase } from '../../lib/barHistory'
import {
  availableQuantity,
  computeBarDashboard,
  soldQuantityForProduct,
} from '../../lib/barManagement'
import { exportBarMenu } from '../../lib/barMenuExport'
import { formatEur } from '../../lib/currency'
import { isSupabaseConfigured } from '../../lib/supabase'
import { BarProductForm } from '../forms/BarProductForm'
import { BarSaleForm } from '../forms/BarSaleForm'
import { Modal } from '../ui/Modal'
import type { BarHistoryEntry, BarProduct } from '../../types'

type BarView = 'dashboard' | 'products' | 'sales' | 'history'

export function OrganizerBarPage() {
  const { organizerLoggedIn } = useAuth()
  const {
    data,
    eventClosed,
    barFrozen,
    startBarOperation,
    deleteBarProduct,
    deleteBarSale,
    closeBarOperation,
    syncBarRevenueFromSales,
    refreshEvent,
    saving,
    lastFetchedAt,
  } = useEvent()

  const [view, setView] = useState<BarView>('dashboard')
  const [productModal, setProductModal] = useState<'add' | 'edit' | null>(null)
  const [editProduct, setEditProduct] = useState<BarProduct | null>(null)
  const [saleModal, setSaleModal] = useState(false)
  const [closing, setClosing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [history, setHistory] = useState<BarHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [menuExportOpen, setMenuExportOpen] = useState(false)

  const stats = useMemo(() => computeBarDashboard(data), [data])
  const canEdit = !eventClosed && !barFrozen
  const barActive = data.barOperation?.status === 'active'
  const snapshot = data.barOperation?.close_snapshot

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      if (isSupabaseConfigured) {
        const rows = await fetchBarHistoryFromSupabase(data.event.id)
        setHistory(rows)
      } else {
        setHistory([])
      }
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [data.event.id])

  useEffect(() => {
    if (view === 'history') void loadHistory()
  }, [view, loadHistory])

  useEffect(() => {
    if (view !== 'dashboard' || barFrozen) return
    const t = window.setInterval(() => void refreshEvent(), 15000)
    return () => window.clearInterval(t)
  }, [view, barFrozen, refreshEvent])

  if (!organizerLoggedIn) {
    return (
      <div className="page-container">
        <p className="text-sm text-slate-500">
          Gestão de bar disponível apenas para administradores do evento.
        </p>
      </div>
    )
  }

  async function handleClose(syncRevenue: boolean) {
    const msg = syncRevenue
      ? 'Encerrar o bar e sincronizar a receita do bar com o total de vendas?'
      : 'Encerrar o bar? A operação fica congelada (apenas consulta).'
    if (!window.confirm(msg)) return
    setClosing(true)
    const err = await closeBarOperation({ syncRevenue })
    setClosing(false)
    if (err) window.alert(err)
  }

  async function handleSyncRevenue() {
    setSyncing(true)
    try {
      await syncBarRevenueFromSales()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="page-container space-y-6">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold uppercase text-white">
              <Wine className="h-5 w-5 text-[#ff2d6a]" />
              Gestão de bar
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Stock, vendas e reconciliação com a receita do bar. Apenas
              administradores do evento.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && !data.barOperation && (
              <button
                type="button"
                onClick={() => void startBarOperation()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-2 text-sm font-medium text-white"
              >
                Iniciar operação
              </button>
            )}
            {canEdit && barActive && (
              <button
                type="button"
                onClick={() => void handleClose(true)}
                disabled={closing || saving}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-200"
              >
                <Lock className="h-4 w-4" />
                {closing ? 'A encerrar…' : 'Fim do evento (bar)'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge
            label={
              barFrozen
                ? 'Bar encerrado'
                : barActive
                  ? 'Bar em operação'
                  : 'Bar não iniciado'
            }
            tone={barFrozen ? 'amber' : barActive ? 'emerald' : 'slate'}
          />
          {view === 'dashboard' && !barFrozen && lastFetchedAt && (
            <span className="text-[10px] text-slate-600">
              Atualização automática ·{' '}
              {format(parseISO(lastFetchedAt), 'HH:mm:ss', { locale: pt })}
            </span>
          )}
          {view === 'dashboard' && !barFrozen && (
            <button
              type="button"
              onClick={() => void refreshEvent()}
              className="inline-flex items-center gap-1 text-[10px] uppercase text-slate-500 hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              Atualizar
            </button>
          )}
        </div>
      </section>

      {(barFrozen || eventClosed) && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {eventClosed
            ? 'Evento encerrado — consulta o desempenho do bar no histórico.'
            : 'Operação de bar congelada. Os dados abaixo são o relatório de encerramento.'}
        </div>
      )}

      {Math.abs(stats.variance) > 0.01 && !barFrozen && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Receita e vendas não coincidem</p>
            <p className="mt-1 text-amber-100/90">
              Vendas: {formatEur(stats.salesRevenue)} · Receita bar (financeiro):{' '}
              {formatEur(stats.barRevenueRecorded)} · Diferença:{' '}
              {formatEur(stats.variance)}
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={() => void handleSyncRevenue()}
                disabled={syncing}
                className="mt-2 text-xs font-bold uppercase text-[#ff2d6a] hover:underline"
              >
                {syncing ? 'A sincronizar…' : 'Sincronizar receita com vendas'}
              </button>
            )}
          </div>
        </div>
      )}

      {Math.abs(stats.variance) <= 0.01 && stats.salesRevenue > 0 && !barFrozen && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Vendas alinhadas com a receita do bar
        </div>
      )}

      <nav className="flex flex-wrap gap-2 border-b border-[#2a2a3d] pb-2">
        <ViewTab id="dashboard" active={view} onChange={setView} icon={BarChart3}>
          Painel
        </ViewTab>
        <ViewTab id="products" active={view} onChange={setView} icon={Package}>
          Produtos
        </ViewTab>
        <ViewTab id="sales" active={view} onChange={setView} icon={ShoppingCart}>
          Vendas
        </ViewTab>
        <ViewTab id="history" active={view} onChange={setView} icon={History}>
          Histórico
        </ViewTab>
      </nav>

      {view === 'dashboard' && (
        <BarDashboardPanel stats={stats} snapshot={snapshot} />
      )}

      {view === 'products' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setEditProduct(null)
                  setProductModal('add')
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-3 py-2 text-sm text-white"
              >
                <Plus className="h-4 w-4" />
                Produto
              </button>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuExportOpen((v) => !v)}
                disabled={data.barProducts.filter((p) => p.active && p.quantity_allocated > 0).length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-3 py-2 text-sm font-medium text-slate-200 hover:border-[#ff2d6a]/40 disabled:opacity-40"
                aria-expanded={menuExportOpen}
              >
                <Download className="h-4 w-4" />
                Exportar menu
              </button>
              {menuExportOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[14rem] rounded-lg border border-[#2a2a3d] bg-[#12121c] p-1 shadow-xl">
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                    onClick={() => {
                      exportBarMenu(data, 'print')
                      setMenuExportOpen(false)
                    }}
                  >
                    Menu A4 (imprimir / PDF)
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                    onClick={() => {
                      exportBarMenu(data, 'table')
                      setMenuExportOpen(false)
                    }}
                  >
                    Cartão para mesa (1 cópia)
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                    onClick={() => {
                      exportBarMenu(data, 'table-grid')
                      setMenuExportOpen(false)
                    }}
                  >
                    4 cartões por folha (recortar)
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                    onClick={() => {
                      exportBarMenu(data, 'csv')
                      setMenuExportOpen(false)
                    }}
                  >
                    Excel / CSV
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                    onClick={() => {
                      exportBarMenu(data, 'txt')
                      setMenuExportOpen(false)
                    }}
                  >
                    Texto (.txt)
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            O menu exportado inclui produtos ativos com stock alocado. Usa «Cartão para mesa»
            ou «4 cartões por folha» para colocar nas mesas.
          </p>
          {data.barProducts.length === 0 ? (
            <p className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6 text-sm text-slate-500">
              Sem produtos. Adiciona artigos com quantidades recolhidas e alocadas.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.barProducts.map((p) => {
                const sold = soldQuantityForProduct(p.id, data.barSales)
                const avail = availableQuantity(p, data.barSales)
                return (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-sm text-[#ff2d6a]">
                        {formatEur(p.unit_price)} / un.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Recolhido: {p.quantity_collected} · Alocado:{' '}
                        {p.quantity_allocated} · Vendido: {sold} · Disponível:{' '}
                        {avail}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditProduct(p)
                            setProductModal('edit')
                          }}
                          className="rounded border border-[#2a2a3d] px-2 py-1 text-xs text-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBarProduct(p.id)}
                          className="rounded border border-[#2a2a3d] px-2 py-1 text-xs text-slate-500 hover:text-red-400"
                        >
                          Apagar
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {view === 'sales' && (
        <section className="space-y-4">
          {canEdit && barActive && (
            <button
              type="button"
              onClick={() => setSaleModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-3 py-2 text-sm text-white"
            >
              <Plus className="h-4 w-4" />
              Registar venda
            </button>
          )}
          {!barActive && canEdit && (
            <p className="text-sm text-amber-300">Inicia a operação de bar primeiro.</p>
          )}
          <ul className="space-y-2">
            {[...data.barSales]
              .sort(
                (a, b) =>
                  new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime(),
              )
              .map((s) => {
                const p = data.barProducts.find((x) => x.id === s.product_id)
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap justify-between gap-2 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {p?.name ?? 'Produto'} × {s.quantity}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(s.sold_at), "d MMM yyyy · HH:mm", {
                          locale: pt,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#ff2d6a]">
                        {formatEur(s.total_amount)}
                      </span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => deleteBarSale(s.id)}
                          className="text-xs text-slate-500 hover:text-red-400"
                        >
                          Apagar
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
          </ul>
        </section>
      )}

      {view === 'history' && (
        <BarHistoryPanel
          currentSnapshot={snapshot}
          history={history}
          loading={historyLoading}
          onRefresh={() => void loadHistory()}
        />
      )}

      <Modal
        title={productModal === 'add' ? 'Novo produto' : 'Editar produto'}
        open={productModal !== null}
        onClose={() => setProductModal(null)}
      >
        {productModal === 'add' && <BarProductForm onDone={() => setProductModal(null)} />}
        {productModal === 'edit' && editProduct && (
          <BarProductForm initial={editProduct} onDone={() => setProductModal(null)} />
        )}
      </Modal>

      <Modal
        title="Registar venda"
        open={saleModal}
        onClose={() => setSaleModal(false)}
      >
        <BarSaleForm onDone={() => setSaleModal(false)} />
      </Modal>
    </div>
  )
}

function BarDashboardPanel({
  stats,
  snapshot,
}: {
  stats: ReturnType<typeof computeBarDashboard>
  snapshot: import('../../types').BarCloseSnapshot | null | undefined
}) {
  const display = snapshot
    ? {
        salesRevenue: snapshot.sales_revenue,
        barRevenueRecorded: snapshot.bar_revenue_recorded,
        variance: snapshot.variance,
        totalUnitsSold: snapshot.total_units_sold,
      }
    : stats

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Receita vendas" value={formatEur(display.salesRevenue)} />
        <MetricCard
          label="Receita bar (registada)"
          value={formatEur(display.barRevenueRecorded)}
        />
        <MetricCard
          label="Diferença"
          value={formatEur(display.variance)}
          warn={Math.abs(display.variance) > 0.01}
        />
        <MetricCard label="Unidades vendidas" value={String(display.totalUnitsSold)} />
      </div>

      {!snapshot && stats.topProducts.length > 0 && (
        <div className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
          <h3 className="text-xs font-bold uppercase text-slate-500">Top produtos</h3>
          <ul className="mt-2 space-y-1">
            {stats.topProducts.map((t) => (
              <li
                key={t.product.id}
                className="flex justify-between text-sm text-slate-300"
              >
                <span>{t.product.name}</span>
                <span>
                  {t.sold} un. · {formatEur(t.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!snapshot && stats.lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="text-xs font-bold uppercase text-amber-400">Stock baixo</h3>
          <ul className="mt-2 space-y-1 text-sm text-amber-100/90">
            {stats.lowStock.map((x) => (
              <li key={x.product.id}>
                {x.product.name}: {x.available} disponíveis
              </li>
            ))}
          </ul>
        </div>
      )}

      {snapshot && (
        <div className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
          <h3 className="text-xs font-bold uppercase text-slate-500">
            Relatório de encerramento
          </h3>
          <ul className="mt-3 space-y-2">
            {snapshot.products.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap justify-between gap-2 border-b border-[#2a2a3d]/50 pb-2 text-sm last:border-0"
              >
                <span className="text-white">{p.name}</span>
                <span className="text-slate-400">
                  Vendido {p.sold} / {p.allocated} · {formatEur(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function BarHistoryPanel({
  currentSnapshot,
  history,
  loading,
  onRefresh,
}: {
  currentSnapshot: import('../../types').BarCloseSnapshot | null | undefined
  history: BarHistoryEntry[]
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <section className="space-y-6">
      {currentSnapshot && (
        <div className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4">
          <h3 className="font-bold text-white">Este evento</h3>
          <p className="mt-1 text-xs text-slate-500">
            Encerrado em{' '}
            {format(parseISO(currentSnapshot.closed_at), "d MMM yyyy · HH:mm", {
              locale: pt,
            })}
          </p>
          <p className="mt-2 text-sm text-[#ff2d6a]">
            {formatEur(currentSnapshot.sales_revenue)} ·{' '}
            {currentSnapshot.total_units_sold} unidades
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase text-slate-500">
          Eventos anteriores
        </h3>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs text-slate-500 hover:text-white"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">A carregar histórico…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-slate-500">
          Sem outros encerramentos de bar registados.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li
              key={h.event_id + h.closed_at}
              className="rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
            >
              <p className="font-semibold text-white">{h.event_name}</p>
              <p className="text-xs text-slate-500">
                {h.event_date} ·{' '}
                {format(parseISO(h.closed_at), "d MMM yyyy · HH:mm", { locale: pt })}
              </p>
              <p className="mt-1 text-sm text-[#ff2d6a]">
                {formatEur(h.snapshot.sales_revenue)} · {h.snapshot.total_units_sold}{' '}
                un. · Δ {formatEur(h.snapshot.variance)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ViewTab({
  id,
  active,
  onChange,
  icon: Icon,
  children,
}: {
  id: BarView
  active: BarView
  onChange: (v: BarView) => void
  icon: typeof BarChart3
  children: React.ReactNode
}) {
  const on = active === id
  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
        on
          ? 'bg-[#ff2d6a]/20 text-white'
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: 'emerald' | 'amber' | 'slate'
}) {
  const cls = {
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    slate: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
  }[tone]
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${cls}`}
    >
      {label}
    </span>
  )
}

function MetricCard({
  label,
  value,
  warn,
}: {
  label: string
  value: string
  warn?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        warn
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-[#2a2a3d] bg-[#12121c]'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  )
}
