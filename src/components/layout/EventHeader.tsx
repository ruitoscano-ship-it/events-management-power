import { ArrowLeftRight, LogOut, Users } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { useAuth } from '../../context/AuthContext'
import { avatarColor, volunteerById, volunteerInitials } from '../../lib/volunteers'

const MARIA_AVATAR = '#f97316'

export function EventHeader() {
  const { data } = useEvent()
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

  const volunteer =
    mode === 'volunteer' && volunteerIdInEvent
      ? volunteerById(data.volunteers, volunteerIdInEvent)
      : null

  function handleExit() {
    if (mode === 'organizer') {
      clearActiveEvent()
    } else {
      clearActiveEvent()
    }
  }

  function handleLogout() {
    if (mode === 'organizer') logoutOrganizer()
    else logoutVolunteer()
  }

  return (
    <header className="border-b border-[#2a2a3d] bg-[#0a0a12]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ff2d6a]/20 text-[#ff2d6a] sm:h-10 sm:w-10">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              {e.edition_label && (
                <p className="truncate text-[10px] font-semibold tracking-widest text-[#ff2d6a] uppercase">
                  {e.edition_label}
                </p>
              )}
              <h1 className="truncate text-sm font-bold tracking-wide text-white uppercase leading-tight sm:text-base">
                {e.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode === 'volunteer' && (volunteer || volunteerAccount) && (
              <div className="flex items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-3 py-1.5">
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
                <span className="truncate text-sm font-medium text-white max-w-[120px]">
                  {volunteer?.name.split(' ')[0] ?? volunteerAccount?.name.split(' ')[0]}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExit}
              title="Trocar evento"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#2a2a3d] px-3 py-2 text-[10px] font-bold tracking-wide text-slate-400 hover:text-white uppercase"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Evento</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#2a2a3d] px-3 py-2 text-[10px] font-bold tracking-wide text-slate-400 hover:text-white uppercase"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>

            <button
              type="button"
              onClick={exitToEntry}
              className="text-[10px] text-slate-600 hover:text-slate-400 uppercase sm:hidden"
            >
              Início
            </button>
          </div>
        </div>

        <div className="mt-3 hidden gap-6 text-xs text-slate-400 md:flex">
          <span>
            <span className="text-slate-500">DATA:</span>{' '}
            <span className="font-medium capitalize text-white">{e.day_label ?? 'Sábado'}</span>
          </span>
          <span className="min-w-0">
            <span className="text-slate-500">LOCAL:</span>{' '}
            <span className="font-medium text-white">{e.venue}</span>
          </span>
          <span>
            <span className="text-slate-500">PARES:</span>{' '}
            <span className="font-medium text-white">{pairsDisplay}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[#2a2a3d]/60 px-4 py-2 text-[10px] text-slate-400 md:hidden sm:text-xs">
        <span className="truncate">
          <span className="text-slate-500">DATA </span>
          {e.day_label ?? 'Sábado'}
        </span>
        <span className="truncate text-center">
          <span className="text-slate-500">PARES </span>
          {pairsDisplay}
        </span>
        <span className="truncate text-right" title={e.venue ?? undefined}>
          <span className="text-slate-500">LOCAL </span>
          {e.venue}
        </span>
      </div>
    </header>
  )
}
