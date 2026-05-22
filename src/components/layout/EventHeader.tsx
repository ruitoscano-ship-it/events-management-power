import { ArrowLeftRight, Calendar, LogOut, MapPin, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatEventDateLine, formatEventDateLong } from '../../lib/eventDate'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { avatarColor, volunteerById, volunteerInitials } from '../../lib/volunteers'

const MARIA_AVATAR = '#f97316'

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

  return (
    <header className="border-b border-[#2a2a3d] bg-[#0a0a12]">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ff2d6a]/20 text-[#ff2d6a] sm:h-10 sm:w-10">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              {e.edition_label && (
                <p className="truncate text-[10px] font-semibold tracking-widest text-[#ff2d6a] uppercase sm:text-[11px]">
                  {e.edition_label}
                </p>
              )}
              <h1 className="text-sm font-bold uppercase leading-snug tracking-wide text-white sm:text-base md:text-lg">
                {e.name}
              </h1>
              <p
                className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 capitalize md:hidden"
                title={dateLong}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-[#ff2d6a]/80" />
                <span className="truncate">{dateLine}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {mode === 'volunteer' && (volunteer || volunteerAccount) && (
              <div className="flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-2.5 py-1.5 sm:px-3">
                {volunteer && (
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      backgroundColor:
                        volunteer.id === 'v-ma' ? MARIA_AVATAR : avatarColor(volunteer.id),
                    }}
                  >
                    {volunteerInitials(volunteer.name)}
                  </span>
                )}
                <span className="truncate text-sm font-medium text-white max-w-[min(140px,40vw)]">
                  {volunteer?.name.split(' ')[0] ?? volunteerAccount?.name.split(' ')[0]}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExit}
              title="Trocar evento"
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2a2a3d] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-white sm:flex-none sm:justify-start"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
              <span>Evento</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2a2a3d] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-white sm:flex-none sm:justify-start"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              Sair
            </button>

            <button
              type="button"
              onClick={exitToEntry}
              className="min-h-10 text-[10px] uppercase text-slate-600 hover:text-slate-400 sm:hidden"
            >
              Início
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isSupabaseConfigured && source === 'supabase' && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90">
              Supabase
            </span>
          )}
          {lastFetchedAt && (
            <span className="text-[10px] text-slate-600">
              Atualizado{' '}
              {new Date(lastFetchedAt).toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          {isSupabaseConfigured && (
            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                setSyncing(true)
                await refreshEvent()
                setSyncing(false)
              }}
              className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#2a2a3d] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          )}
        </div>

        <dl className="mt-3 hidden gap-4 text-xs text-slate-400 sm:grid sm:grid-cols-3 md:flex md:gap-6">
          <div className="min-w-0">
            <dt className="text-slate-500 uppercase tracking-wide text-[10px]">Data</dt>
            <dd className="mt-0.5 font-medium capitalize text-white" title={dateLong}>
              {dateLine}
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-1">
            <dt className="text-slate-500 uppercase tracking-wide text-[10px]">Local</dt>
            <dd className="mt-0.5 font-medium text-white truncate">{e.venue ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 uppercase tracking-wide text-[10px]">Pares</dt>
            <dd className="mt-0.5 font-medium text-white">{pairsDisplay}</dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-[#2a2a3d]/60 px-3 py-2.5 sm:hidden">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
          <div className="col-span-2 flex items-center gap-1.5 capitalize text-white">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate" title={dateLong}>
              {dateLine}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Pares </span>
            <span className="font-medium text-white">{pairsDisplay}</span>
          </div>
          <div className="min-w-0 text-right">
            <span className="text-slate-500">Local </span>
            <span className="font-medium text-white inline-flex items-center gap-0.5 justify-end max-w-full">
              <MapPin className="h-3 w-3 shrink-0 inline sm:hidden" />
              <span className="truncate">{e.venue ?? '—'}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
