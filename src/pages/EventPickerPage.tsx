import { ArrowLeft, LogOut } from 'lucide-react'
import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { isEventOngoing, listEventSummaries } from '../lib/catalog'
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
  } = useAuth()

  const { ongoing, past } = useMemo(() => {
    const all = listEventSummaries(catalog)
    return {
      ongoing: all.filter((e) => isEventOngoing(e.event_date)),
      past: all.filter((e) => !isEventOngoing(e.event_date)),
    }
  }, [catalog])

  function handleBack() {
    if (variant === 'organizer') logoutOrganizer()
    else logoutVolunteer()
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <div className="page-container max-w-3xl">
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

        {dataSource === 'supabase' && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            Ligado ao Supabase
          </p>
        )}

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
                  />
                </li>
              ))}
            </ul>
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
