import { Users } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'
import { avatarColor, volunteerById, volunteerInitials } from '../../lib/volunteers'

const MARIA_AVATAR = '#f97316'

export function EventHeader() {
  const { data } = useEvent()
  const { role, setRole, volunteerId } = useRole()
  const e = data.event
  const volunteer = volunteerId ? volunteerById(data.volunteers, volunteerId) : null
  const pairsDisplay = 96

  return (
    <header className="border-b border-[#2a2a3d] bg-[#0a0a12]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff2d6a]/20 text-[#ff2d6a]">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            {e.edition_label && (
              <p className="text-[10px] font-semibold tracking-widest text-[#ff2d6a] uppercase">
                {e.edition_label}
              </p>
            )}
            <h1 className="text-sm font-bold tracking-wide text-white uppercase leading-tight md:text-base truncate">
              {e.name}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
          <span>
            <span className="text-slate-500">DATA:</span>{' '}
            <span className="text-white font-medium">{e.day_label ?? 'Sábado'}</span>
          </span>
          <span>
            <span className="text-slate-500">LOCAL:</span>{' '}
            <span className="text-white font-medium">{e.venue}</span>
          </span>
          <span>
            <span className="text-slate-500">PARES:</span>{' '}
            <span className="text-white font-medium">{pairsDisplay}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[#2a2a3d] p-0.5 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`rounded-md px-4 py-2 transition-colors ${
                role === 'organizer'
                  ? 'bg-[#ff2d6a] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ORGANIZADOR
            </button>
            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`rounded-md px-4 py-2 transition-colors ${
                role === 'volunteer'
                  ? 'bg-[#ff2d6a] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VOLUNTÁRIO
            </button>
          </div>

          {role === 'volunteer' && volunteer && (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#2a2a3d]">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  backgroundColor:
                    volunteer.id === 'v-ma' ? MARIA_AVATAR : avatarColor(volunteer.id),
                }}
              >
                {volunteerInitials(volunteer.name)}
              </span>
              <span className="text-sm font-medium text-white">
                {volunteer.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex md:hidden gap-4 px-4 pb-3 text-xs text-slate-400">
        <span>DATA: {e.day_label ?? 'Sábado'}</span>
        <span>LOCAL: {e.venue}</span>
        <span>PARES: {pairsDisplay}</span>
      </div>
    </header>
  )
}
