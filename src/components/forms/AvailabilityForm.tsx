import { useState } from 'react'
import { newId, fromDatetimeLocal, toDatetimeLocal } from '../../lib/datetime'
import { useEvent } from '../../context/EventContext'
import { FormField, inputClass, selectClass } from '../ui/FormField'
import type { VolunteerAvailability } from '../../types'

interface Props {
  initial?: VolunteerAvailability
  defaultVolunteerId?: string
  onDone: () => void
}

export function AvailabilityForm({ initial, defaultVolunteerId, onDone }: Props) {
  const { data, saveAvailability } = useEvent()
  const [volunteerId, setVolunteerId] = useState(
    initial?.volunteer_id ?? defaultVolunteerId ?? data.volunteers[0]?.id ?? '',
  )
  const [from, setFrom] = useState(
    initial ? toDatetimeLocal(initial.available_from) : `${data.event.event_date}T08:00`,
  )
  const [until, setUntil] = useState(
    initial ? toDatetimeLocal(initial.available_until) : `${data.event.event_date}T14:00`,
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveAvailability({
      id: initial?.id ?? newId(),
      volunteer_id: volunteerId,
      available_from: fromDatetimeLocal(from),
      available_until: fromDatetimeLocal(until),
      notes: notes || null,
    })
    setSaving(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Voluntário">
        <select className={selectClass} value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required>
          {data.volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Disponível desde">
          <input type="datetime-local" className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} required />
        </FormField>
        <FormField label="Até">
          <input type="datetime-local" className={inputClass} value={until} onChange={(e) => setUntil(e.target.value)} required />
        </FormField>
      </div>
      <FormField label="Notas">
        <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <button type="submit" disabled={saving} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {saving ? 'A guardar…' : 'Guardar'}
      </button>
    </form>
  )
}
