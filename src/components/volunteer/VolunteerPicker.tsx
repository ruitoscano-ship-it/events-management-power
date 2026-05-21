import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'
import { avatarColor, volunteerInitials } from '../../lib/volunteers'
import { EventHeader } from '../layout/EventHeader'

export function VolunteerPicker() {
  const { data } = useEvent()
  const { setVolunteerId } = useRole()

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <div className="mx-auto max-w-lg px-4 py-12">
        <h2 className="text-2xl font-bold text-white uppercase">Quem és?</h2>
        <p className="mt-2 text-sm text-slate-400">
          Escolhe o teu nome para veres o horário, marcares o que trazes e indicares a tua disponibilidade.
        </p>
        <ul className="mt-8 grid gap-2">
          {data.volunteers.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setVolunteerId(v.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3 text-left hover:border-[#ff2d6a]/50"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: avatarColor(v.id) }}
                >
                  {volunteerInitials(v.name)}
                </span>
                <div>
                  <p className="font-medium text-white">{v.name}</p>
                  {v.role && <p className="text-xs text-slate-400">{v.role}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
