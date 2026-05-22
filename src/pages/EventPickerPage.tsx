import { Archive, ArrowLeft, LogOut, RefreshCw, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isEventOngoing, listEventSummaries } from '../lib/catalog'
import { isSupabaseConfigured } from '../lib/supabase'
import { EventCard } from '../components/shared/EventCard'

interface Props {
  variant: 'organizer' | 'volunteer'
}

export function EventPickerPage({ variant }: Props) {
  const {
    catalog,
    catalogLoading,
    dataSource,
    volunteerAccount,
    selectEvent,
    clearActiveEvent,
    exitToEntry,
    logoutOrganizer,
    logoutVolunteer,
    forceSyncFromServer,
    lastSyncedAt,
    archiveEvent,
    restoreEvent,
  } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const { ongoing, past, archived } = useMemo(() => {
    const all = listEventSummaries(catalog)
    const archivedAll = listEventSummaries(catalog, { includeArchived: true }).filter(
      (e) => e.archived_at,
    )
    return {
      ongoing: all.filter((e) => isEventOngoing(e.event_date)),
      past: all.filter((e) => !isEventOngoing(e.event_date)),
      archived: archivedAll,
    }
  }, [catalog])

  async function handleArchive(eventId: string, name: string) {
    if (
      !window.confirm(
        `Arquivar «${name}»?\n\nDeixa de aparecer na lista para organizadores e voluntários. Os dados mantêm-se na base de dados.`,
      )
    ) {
      return
    }
    setBusyId(eventId)
    const err = await archiveEvent(eventId)
    setBusyId(null)
    if (err) window.alert(err)
  }

  async function handleRestore(eventId: string, name: string) {
    if (!window.confirm(`Restaurar «${name}» na lista de eventos?`)) return
    setBusyId(eventId)
    const err = await restoreEvent(eventId)
    setBusyId(null)
    if (err) window.alert(err)
  }

  function handleBack() {
    if (variant === 'organizer') logoutOrganizer()
    else logoutVolunteer()
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <div className="page-container-narrow">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white uppercase tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            {variant === 'organizer' ? 'Terminar sessão' : 'Sair da conta'}
          </button>
          <button
            type="button"
            onClick={exitToEntry}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Início
          </button>
        </div>

        <h1 className="text-2xl font-black text-white uppercase">
          Escolher <span className="text-[#ff2d6a]">evento</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {variant === 'organizer'
            ? 'Seleciona o evento que estás a organizar.'
            : volunteerAccount
              ? `Olá, ${volunteerAccount.name.split(' ')[0]}. Escolhe o evento em que vais apoiar.`
              : 'Seleciona o evento.'}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {dataSource === 'supabase' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
              Supabase
            </span>
          )}
          {isSupabaseConfigured && dataSource === 'local' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
              Cache local (sem ligação)
            </span>
          )}
          {lastSyncedAt && (
            <span className="text-[10px] text-slate-600">
              Sync {new Date(lastSyncedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isSupabaseConfigured && (
            <button
              type="button"
              disabled={syncing || catalogLoading}
              onClick={async () => {
                setSyncing(true)
                await forceSyncFromServer()
                setSyncing(false)
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#2a2a3d] bg-[#1a1a28] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-300 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing || catalogLoading ? 'animate-spin' : ''}`} />
              {syncing ? 'A sincronizar…' : 'Atualizar do servidor'}
            </button>
          )}
        </div>

        {catalogLoading ? (
          <p className="mt-8 text-sm text-slate-500">A carregar eventos…</p>
        ) : ongoing.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-3">
              Em curso ({ongoing.length})
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 motion-stagger">
              {ongoing.map((event) => (
                <li key={event.id}>
                  <EventCard
                    event={event}
                    onSelect={() => void selectEvent(event.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {!catalogLoading && past.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">
              Passados ({past.length})
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 motion-stagger">
              {past.map((event) => (
                <li key={event.id}>
                  <EventCard
                    event={event}
                    onSelect={() => void selectEvent(event.id)}
                    footer={
                      variant === 'organizer' ? (
                        <button
                          type="button"
                          disabled={busyId === event.id}
                          onClick={() => void handleArchive(event.id, event.name)}
                          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          {busyId === event.id ? 'A arquivar…' : 'Arquivar'}
                        </button>
                      ) : undefined
                    }
                  />
                </li>
              ))}
            </ul>
            {variant === 'organizer' && (
              <p className="mt-3 text-[11px] text-slate-600">
                Eventos arquivados deixam de aparecer aqui para toda a equipa.
              </p>
            )}
          </section>
        )}

        {!catalogLoading && variant === 'organizer' && archived.length > 0 && (
          <section className="mt-8">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className="text-xs font-bold tracking-widest text-slate-500 uppercase hover:text-white"
            >
              Arquivados ({archived.length}) {showArchived ? '▾' : '▸'}
            </button>
            {showArchived && (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 motion-stagger">
                {archived.map((event) => (
                  <li key={event.id}>
                    <EventCard
                      event={event}
                      selectable={false}
                      onSelect={() => {}}
                      footer={
                        <button
                          type="button"
                          disabled={busyId === event.id}
                          onClick={() => void handleRestore(event.id, event.name)}
                          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                          {busyId === event.id ? 'A restaurar…' : 'Restaurar'}
                        </button>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!catalogLoading && ongoing.length === 0 && past.length === 0 && (
          <p className="mt-8 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6 text-sm text-slate-500">
            Nenhum evento disponível.
          </p>
        )}

        {variant === 'volunteer' && (
          <button
            type="button"
            onClick={() => {
              clearActiveEvent()
              handleBack()
            }}
            className="mt-8 text-xs text-slate-500 hover:text-white underline"
          >
            Usar outra conta
          </button>
        )}
      </div>
    </div>
  )
}
