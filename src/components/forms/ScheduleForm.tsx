import { useState } from 'react'
import { newId, fromDatetimeLocal, toDatetimeLocal } from '../../lib/datetime'
import { FormField, inputClass, selectClass } from '../ui/FormField'
import { useEvent } from '../../context/EventContext'
import { defaultCategory } from '../../lib/schedule'
import type { BlockType, ScheduleBlock, ScheduleCategory } from '../../types'

const blockTypes: BlockType[] = [
  'competition',
  'ceremony',
  'break',
  'logistics',
  'activity',
]

interface Props {
  initial?: ScheduleBlock
  onDone: () => void
}

export function ScheduleForm({ initial, onDone }: Props) {
  const { data, saveSchedule } = useEvent()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [blockType, setBlockType] = useState<BlockType>(
    initial?.block_type ?? 'competition',
  )
  const [category, setCategory] = useState<ScheduleCategory>(
    initial?.category ?? 'standard',
  )
  const [startsAt, setStartsAt] = useState(
    initial ? toDatetimeLocal(initial.starts_at) : `${data.event.event_date}T09:00`,
  )
  const [endsAt, setEndsAt] = useState(
    initial ? toDatetimeLocal(initial.ends_at) : `${data.event.event_date}T10:00`,
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const block: ScheduleBlock = {
      id: initial?.id ?? newId(),
      event_id: data.event.id,
      title,
      description: description || null,
      location: location || null,
      block_type: blockType,
      category: category || defaultCategory(blockType, title),
      starts_at: fromDatetimeLocal(startsAt),
      ends_at: fromDatetimeLocal(endsAt),
      sort_order: initial?.sort_order ?? data.schedule.length + 1,
    }
    await saveSchedule(block, !initial)
    setSaving(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Título">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </FormField>
      <FormField label="Categoria (badge)">
        <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value as ScheduleCategory)}>
          {(['setup', 'logistics', 'standard', 'latinas', 'break', 'ceremony', 'activity'] as ScheduleCategory[]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Tipo interno">
        <select className={selectClass} value={blockType} onChange={(e) => setBlockType(e.target.value as BlockType)}>
          {blockTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>
      <div className="form-grid-2">
        <FormField label="Início">
          <input type="datetime-local" className={inputClass} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </FormField>
        <FormField label="Fim">
          <input type="datetime-local" className={inputClass} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
        </FormField>
      </div>
      <FormField label="Local">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormField>
      <FormField label="Descrição">
        <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <button type="submit" disabled={saving} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {saving ? 'A guardar…' : 'Guardar'}
      </button>
    </form>
  )
}
