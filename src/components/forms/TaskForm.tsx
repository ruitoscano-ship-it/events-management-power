import { useState } from 'react'
import { newId, fromDatetimeLocal, toDatetimeLocal } from '../../lib/datetime'
import { useEvent } from '../../context/EventContext'
import { FormField, inputClass, selectClass } from '../ui/FormField'
import type { TaskStatus, VolunteerTask } from '../../types'

const statuses: TaskStatus[] = ['assigned', 'in_progress', 'done']

interface Props {
  initial?: VolunteerTask
  onDone: () => void
}

export function TaskForm({ initial, onDone }: Props) {
  const { data, saveTask } = useEvent()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [volunteerId, setVolunteerId] = useState(initial?.volunteer_id ?? '')
  const [scheduleBlockId, setScheduleBlockId] = useState(initial?.schedule_block_id ?? '')
  const [startsAt, setStartsAt] = useState(
    initial?.starts_at ? toDatetimeLocal(initial.starts_at) : `${data.event.event_date}T08:00`,
  )
  const [endsAt, setEndsAt] = useState(
    initial?.ends_at ? toDatetimeLocal(initial.ends_at) : `${data.event.event_date}T10:00`,
  )
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'assigned')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveTask({
      id: initial?.id ?? newId(),
      event_id: data.event.id,
      volunteer_id: volunteerId || null,
      schedule_block_id: scheduleBlockId || null,
      title,
      starts_at: startsAt ? fromDatetimeLocal(startsAt) : null,
      ends_at: endsAt ? fromDatetimeLocal(endsAt) : null,
      status,
      notes: notes || null,
    })
    setSaving(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Atividade">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </FormField>
      <FormField label="Voluntário">
        <select className={selectClass} value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)}>
          <option value="">— Por atribuir —</option>
          {data.volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Bloco do cronograma (opcional)">
        <select className={selectClass} value={scheduleBlockId} onChange={(e) => setScheduleBlockId(e.target.value)}>
          <option value="">— Nenhum —</option>
          {data.schedule.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Início">
          <input type="datetime-local" className={inputClass} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </FormField>
        <FormField label="Fim">
          <input type="datetime-local" className={inputClass} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Estado">
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
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
