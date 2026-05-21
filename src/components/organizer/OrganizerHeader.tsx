import { Users } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'

export function OrganizerHeader() {
  const { data } = useEvent()
  const { role, setRole } = useRole()
  const e = data.event
  const pairsDisplay = 96

  return (
    <header className="border-b border-[#2a2a3d] bg-[#0a0a12]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff2d6a]/20 text-[#ff2d6a]">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-bold tracking-wide text-white uppercase leading-tight md:text-base">
            {e.name}
          </h1>
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
      </div>

      <div className="flex md:hidden gap-4 px-4 pb-3 text-xs text-slate-400">
        <span>DATA: {e.day_label ?? 'Sábado'}</span>
        <span>LOCAL: {e.venue}</span>
        <span>PARES: {pairsDisplay}</span>
      </div>
    </header>
  )
}
