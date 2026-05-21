import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'
import { formatTimeRange } from '../../lib/format'
import { AvailabilityForm } from '../forms/AvailabilityForm'
import { Modal } from '../ui/Modal'

const DEFAULT_VOLUNTEER = 'v-ma'

export function VolunteerAvailabilityPage() {
  const { data, deleteAvailability } = useEvent()
  const { volunteerId } = useRole()
  const vid = volunteerId ?? DEFAULT_VOLUNTEER
  const [showAdd, setShowAdd] = useState(false)

  const volunteer = data.volunteers.find((v) => v.id === vid)
  const mySlots = useMemo(
    () =>
      data.availability
        .filter((a) => a.volunteer_id === vid)
        .sort(
          (a, b) =>
            new Date(a.available_from).getTime() -
            new Date(b.available_from).getTime(),
        ),
    [data.availability, vid],
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h2 className="text-2xl font-black text-white uppercase">
        A minha <span className="text-[#ff2d6a]">disponibilidade</span>
      </h2>
      <p className="mt-1 text-sm text-slate-400 mb-6">
        Indica quando estás disponível para apoiar o evento. O organizador vê estas janelas na equipa.
      </p>

      {volunteer && (
        <p className="mb-6 text-sm text-white">
          A registar como <span className="font-semibold text-[#ff2d6a]">{volunteer.name}</span>
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e0265d]"
      >
        <Plus className="h-4 w-4" />
        Adicionar janela horária
      </button>

      {mySlots.length === 0 ? (
        <p className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6 text-sm text-slate-500">
          Ainda não indicaste disponibilidade. Adiciona pelo menos um turno em que podes ajudar.
        </p>
      ) : (
        <ul className="space-y-3">
          {mySlots.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-4"
            >
              <div>
                <p className="font-mono text-sm font-medium text-white">
                  {formatTimeRange(s.available_from, s.available_until)}
                </p>
                {s.notes && (
                  <p className="text-xs text-slate-500 mt-1">{s.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Remover esta disponibilidade?')) deleteAvailability(s.id)
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal title="Nova disponibilidade" open={showAdd} onClose={() => setShowAdd(false)}>
        <AvailabilityForm
          defaultVolunteerId={vid}
          lockVolunteer
          onDone={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
