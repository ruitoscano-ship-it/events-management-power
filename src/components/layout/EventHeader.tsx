import {
  ArrowLeftRight,
  Calendar,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatEventDateLine, formatEventDateLong } from '../../lib/eventDate'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { avatarColor, volunteerById, volunteerInitials } from '../../lib/volunteers'

const MARIA_AVATAR = '#f97316'

const headerBtnClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-300 hover:text-white active:bg-[#1a1a28] sm:min-h-10 sm:bg-transparent sm:px-3'

export function EventHeader() {
  const { data, source, refreshEvent, lastFetchedAt } = useEvent()
  const [syncing, setSyncing] = useState(false)
  const {
    mode,
    volunteerIdInEvent,
    clearActiveEvent,
    logoutVolunteer,
    logoutOrganizer,
    exitToEntry,
    volunteerAccount,
  } = useAuth()
  const e = data.event
  const pairsDisplay = e.pairs_count ?? '—'
  const dateLine = formatEventDateLine(e)
  const dateLong = formatEventDateLong(e.event_date)

  const volunteer =
    mode === 'volunteer' && volunteerIdInEvent
      ? volunteerById(data.volunteers, volunteerIdInEvent)
      : null

  function handleExit() {
    clearActiveEvent()
  }

  function handleLogout() {
    if (mode === 'organizer') logoutOrganizer()
    else logoutVolunteer()
  }

  async function handleRefresh() {
    setSyncing(true)
    await refreshEvent()
    setSyncing(false)
  }

  return (
    <header className="border-b border-[#2a2a3d] bg-[#0a0a12]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff2d6a]/20 text-[#ff2d6a] sm:h-10 sm:w-10 sm:rounded-lg">
              <Users className="h-5 w-5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              {e.edition_label && (
                <p className="truncate text-xs font-semibold tracking-widest text-[#ff2d6a] uppercase">
                  {e.edition_label}
                </p>
              )}
              <h1 className="text-base font-bold uppercase leading-snug tracking-wide text-white sm:text-base md:text-lg">
                {e.name}
              </h1>
              <p
                className="mt-1.5 flex items-center gap-2 text-sm text-slate-300 capitalize sm:text-xs sm:text-slate-400"
                title={dateLong}
              >
                <Calendar className="h-4 w-4 shrink-0 text-[#ff2d6a]/90 sm:h-3.5 sm:w-3.5" />
                <span>{dateLine}</span>
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:items-end">
            {mode === 'volunteer' && (volunteer || volunteerAccount) && (
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-3 py-2 sm:px-3">
                {volunteer && (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        volunteer.id === 'v-ma' ? MARIA_AVATAR : avatarColor(volunteer.id),
                    }}
                  >
                    {volunteerInitials(volunteer.name)}
                  </span>
                )}
                <span className="truncate text-sm font-medium text-white">
                  {volunteer?.name.split(' ')[0] ?? volunteerAccount?.name.split(' ')[0]}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button type="button" onClick={handleExit} title="Trocar evento" className={headerBtnClass}>
                <ArrowLeftRight className="h-4 w-4 shrink-0" />
                <span>Evento</span>
              </button>
              <button type="button" onClick={handleLogout} className={headerBtnClass}>
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sair</span>
              </button>
              <button
                type="button"
                onClick={exitToEntry}
                className={`${headerBtnClass} sm:hidden`}
              >
                <span>Início</span>
              </button>
            </div>
          </div>
        </div>

        {isSupabaseConfigured && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm sm:text-xs">
            {syncing ? (
              <span
                className="inline-flex items-center gap-2 text-slate-400"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-4 w-4 animate-spin text-[#ff2d6a]" />
                A atualizar…
              </span>
            ) : (
              <>
                {source === 'supabase' && (
                  <span className="hidden font-semibold uppercase tracking-wide text-emerald-400/90 sm:inline text-xs">
                    Supabase
                  </span>
                )}
                {lastFetchedAt && (
                  <span className="text-slate-500">
                    Atualizado{' '}
                    {new Date(lastFetchedAt).toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void handleRefresh()}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#2a2a3d] px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-white disabled:opacity-50 sm:min-h-8 sm:px-2 sm:py-1"
                >
                  <RefreshCw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  Atualizar
                </button>
              </>
            )}
          </div>
        )}

        <dl className="mt-4 hidden gap-4 text-xs text-slate-400 sm:grid sm:grid-cols-3 md:flex md:gap-6">
          <div className="min-w-0">
            <dt className="text-slate-500 uppercase tracking-wide text-[10px]">Data</dt>
            <dd className="mt-0.5 text-sm font-medium capitalize text-white" title={dateLong}>
              {dateLine}
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-1">
            <dt className="text-slate-500 uppercase tracking-wide text-[10px]">Local</dt>
            <dd className="mt-0.5 text-sm font-medium text-white">{e.venue ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 uppercase tracking-wide text-[10px]">Pares</dt>
            <dd className="mt-0.5 text-sm font-medium text-white">{pairsDisplay}</dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-[#2a2a3d]/60 bg-[#0d0d14] px-4 py-3.5 sm:hidden">
        <dl className="space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pares inscritos
            </dt>
            <dd className="text-xl font-bold text-[#ff2d6a]">{pairsDisplay}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Local
            </dt>
            <dd className="mt-1 flex items-start gap-2 font-medium leading-snug text-white">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ff2d6a]/80" />
              <span>{e.venue ?? '—'}</span>
            </dd>
          </div>
        </dl>
      </div>
    </header>
  )
}
