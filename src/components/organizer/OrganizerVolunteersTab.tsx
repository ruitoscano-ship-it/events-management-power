import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatTimeRange } from '../../lib/format'
import { avatarColor, volunteerInitials } from '../../lib/volunteers'
import type { Volunteer, VolunteerAvailability } from '../../types'
import { AvailabilityForm } from '../forms/AvailabilityForm'
import { VolunteerForm } from '../forms/VolunteerForm'
import { ActionBar } from '../ui/ActionBar'
import { Modal } from '../ui/Modal'
import { GridView } from '../GridView'

export function OrganizerVolunteersTab() {
  const { data, deleteVolunteer, deleteAvailability } = useEvent()
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<VolunteerAvailability | null>(null)
  const [modal, setModal] = useState<'volunteer' | 'availability' | null>(null)
  const [editVolunteer, setEditVolunteer] = useState(false)

  const availByVolunteer = data.availability.reduce<Record<string, VolunteerAvailability[]>>(
    (acc, a) => { (acc[a.volunteer_id] ??= []).push(a); return acc },
    {},
  )

  return (
    <div className="organizer-panel mx-auto max-w-7xl px-4 py-6 space-y-8">
      <section>
        <div className="flex flex-wrap justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-white uppercase">Equipa</h2>
          <ActionBar
            onAdd={() => { setEditVolunteer(false); setModal('volunteer') }}
            addLabel="Novo voluntário"
            onEdit={selectedVolunteer ? () => { setEditVolunteer(true); setModal('volunteer') } : undefined}
            onDelete={selectedVolunteer ? async () => {
              if (confirm(`Apagar ${selectedVolunteer.name}?`)) {
                await deleteVolunteer(selectedVolunteer.id)
                setSelectedVolunteer(null)
              }
            } : undefined}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.volunteers.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => { setSelectedVolunteer(v); setSelectedSlot(null) }}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selectedVolunteer?.id === v.id
                  ? 'border-[#ff2d6a] bg-[#ff2d6a]/10'
                  : 'border-[#2a2a3d] bg-[#12121c] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: avatarColor(v.id) }}
                >
                  {volunteerInitials(v.name)}
                </span>
                <div>
                  <p className="font-semibold text-white">{v.name}</p>
                  {v.role && <p className="text-xs text-slate-400">{v.role}</p>}
                </div>
              </div>
              {(availByVolunteer[v.id] ?? []).map((s) => (
                <p key={s.id} className="mt-2 font-mono text-xs text-slate-500">
                  {formatTimeRange(s.available_from, s.available_until)}
                </p>
              ))}
            </button>
          ))}
        </div>
      </section>

      <section>
        <ActionBar
          onAdd={() => setModal('availability')}
          addLabel="Nova disponibilidade"
          onEdit={selectedSlot ? () => setModal('availability') : undefined}
          onDelete={selectedSlot ? async () => {
            if (confirm('Apagar disponibilidade?')) {
              await deleteAvailability(selectedSlot.id)
              setSelectedSlot(null)
            }
          } : undefined}
        />
        <div className="mt-6 organizer-grid">
          <GridView />
        </div>
      </section>

      <Modal
        title={modal === 'volunteer' ? (editVolunteer ? 'Editar voluntário' : 'Novo voluntário') : 'Disponibilidade'}
        open={modal !== null}
        onClose={() => setModal(null)}
      >
        {modal === 'volunteer' && (
          <VolunteerForm
            initial={editVolunteer ? selectedVolunteer ?? undefined : undefined}
            onDone={() => setModal(null)}
          />
        )}
        {modal === 'availability' && (
          <AvailabilityForm
            initial={selectedSlot ?? undefined}
            defaultVolunteerId={selectedVolunteer?.id}
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}
