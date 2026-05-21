import { useState } from 'react'
import { newId } from '../../lib/datetime'
import { useEvent } from '../../context/EventContext'
import { FormField, inputClass } from '../ui/FormField'
import type { Volunteer } from '../../types'

interface Props {
  initial?: Volunteer
  onDone: () => void
}

export function VolunteerForm({ initial, onDone }: Props) {
  const { data, saveVolunteer } = useEvent()
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveVolunteer({
      id: initial?.id ?? newId(),
      event_id: data.event.id,
      name,
      email: email || null,
      phone: phone || null,
      role: role || null,
      notes: notes || null,
    })
    setSaving(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nome">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label="Função">
        <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Catering, Logística…" />
      </FormField>
      <FormField label="Email">
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <FormField label="Telefone">
        <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>
      <FormField label="Notas">
        <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <button type="submit" disabled={saving} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {saving ? 'A guardar…' : 'Guardar'}
      </button>
    </form>
  )
}
