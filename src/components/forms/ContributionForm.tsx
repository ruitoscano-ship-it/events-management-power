import { useState } from 'react'
import { newId, fromDatetimeLocal, toDatetimeLocal } from '../../lib/datetime'
import { useEvent } from '../../context/EventContext'
import { FormField, inputClass, selectClass } from '../ui/FormField'
import type { Contribution, ContributionStatus } from '../../types'

const statuses: ContributionStatus[] = ['pending', 'confirmed', 'delivered']

interface Props {
  initial?: Contribution
  onDone: () => void
}

export function ContributionForm({ initial, onDone }: Props) {
  const { data, saveContribution } = useEvent()
  const [itemName, setItemName] = useState(initial?.item_name ?? '')
  const [volunteerId, setVolunteerId] = useState(initial?.volunteer_id ?? '')
  const [quantity, setQuantity] = useState(initial?.quantity ?? '')
  const [neededBy, setNeededBy] = useState(
    initial?.needed_by ? toDatetimeLocal(initial.needed_by) : `${data.event.event_date}T12:00`,
  )
  const [status, setStatus] = useState<ContributionStatus>(initial?.status ?? 'pending')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveContribution({
      id: initial?.id ?? newId(),
      event_id: data.event.id,
      volunteer_id: volunteerId || null,
      item_name: itemName,
      quantity: quantity || null,
      needed_by: neededBy ? fromDatetimeLocal(neededBy) : null,
      status,
      notes: notes || null,
    })
    setSaving(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Item">
        <input className={inputClass} value={itemName} onChange={(e) => setItemName(e.target.value)} required placeholder="Bolo, quiche…" />
      </FormField>
      <FormField label="Quem leva">
        <select className={selectClass} value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)}>
          <option value="">— Por atribuir —</option>
          {data.volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Quantidade">
        <input className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </FormField>
      <FormField label="Necessário até">
        <input type="datetime-local" className={inputClass} value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
      </FormField>
      <FormField label="Estado">
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as ContributionStatus)}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Notas">
        <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      <button type="submit" disabled={saving} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {saving ? 'A guardar…' : 'Guardar'}
      </button>
    </form>
  )
}
