import { Clock, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { useEvent } from '../context/EventContext'
import { formatTimeRange } from '../lib/format'
import type { Volunteer, VolunteerAvailability } from '../types'
import { AvailabilityForm } from './forms/AvailabilityForm'
import { VolunteerForm } from './forms/VolunteerForm'
import { ActionBar } from './ui/ActionBar'
import { Modal } from './ui/Modal'

export function VolunteersView() {
  const { data, setVolunteerActive, deleteAvailability } = useEvent()
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<VolunteerAvailability | null>(null)
  const [modal, setModal] = useState<'volunteer' | 'availability' | null>(null)
  const [editVolunteer, setEditVolunteer] = useState(false)

  const availByVolunteer = data.availability.reduce<Record<string, VolunteerAvailability[]>>(
    (acc, a) => { (acc[a.volunteer_id] ??= []).push(a); return acc },
    {},
  )

  async function handleDeleteVolunteer() {
    if (!selectedVolunteer || !confirm(`Apagar ${selectedVolunteer.name}?`)) return
    await setVolunteerActive(selectedVolunteer.id, false)
    setSelectedVolunteer(null)
  }

  async function handleDeleteSlot() {
    if (!selectedSlot || !confirm('Apagar esta disponibilidade?')) return
    await deleteAvailability(selectedSlot.id)
    setSelectedSlot(null)
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Equipa de voluntários</h2>
          <p className="mt-1 text-sm text-slate-500">Seleciona um voluntário ou uma janela horária.</p>
        </div>
        <ActionBar
          onAdd={() => { setEditVolunteer(false); setModal('volunteer') }}
          addLabel="Novo voluntário"
          onEdit={selectedVolunteer ? () => { setEditVolunteer(true); setModal('volunteer') } : undefined}
          onDelete={selectedVolunteer ? handleDeleteVolunteer : undefined}
        />
      </div>

      <div className="mt-3">
        <ActionBar
          onAdd={() => { setSelectedSlot(null); setModal('availability') }}
          addLabel="Nova disponibilidade"
          onEdit={selectedSlot ? () => setModal('availability') : undefined}
          onDelete={selectedSlot ? handleDeleteSlot : undefined}
        />
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.volunteers.map((v) => {
          const slots = availByVolunteer[v.id] ?? []
          return (
            <li
              key={v.id}
              className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                selectedVolunteer?.id === v.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'
              }`}
            >
              <button type="button" className="w-full text-left" onClick={() => { setSelectedVolunteer(v); setSelectedSlot(null) }}>
                <h3 className="font-semibold text-slate-900">{v.name}</h3>
                {v.role && (
                  <span className="mt-1 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{v.role}</span>
                )}
              </button>
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                {v.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{v.email}</p>}
                {v.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{v.phone}</p>}
              </div>
              {slots.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <Clock className="h-3.5 w-3.5" /> Disponibilidade
                  </p>
                  <ul className="mt-2 space-y-2">
                    {slots.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => { setSelectedSlot(s); setSelectedVolunteer(v) }}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                            selectedSlot?.id === s.id ? 'bg-brand-100 ring-1 ring-brand-300' : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-mono font-medium text-slate-800">
                            {formatTimeRange(s.available_from, s.available_until)}
                          </span>
                          {s.notes && <span className="mt-0.5 block text-slate-500">{s.notes}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>

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
    </section>
  )
}
