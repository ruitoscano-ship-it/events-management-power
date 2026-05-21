import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { dayLabelFromDate } from '../../lib/normalize'
import { FormField, inputClass } from '../ui/FormField'
import type { Event } from '../../types'

export function EventSettingsForm() {
  const { data, saveEvent } = useEvent()
  const e = data.event
  const [eventDate, setEventDate] = useState(e.event_date)
  const [venue, setVenue] = useState(e.venue ?? '')
  const [pairsCount, setPairsCount] = useState(String(e.pairs_count ?? ''))
  const [editionLabel, setEditionLabel] = useState(e.edition_label ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setSaving(true)
    const pairs = pairsCount ? parseInt(pairsCount, 10) : null
    const updated: Event = {
      ...e,
      event_date: eventDate,
      venue: venue || null,
      pairs_count: Number.isNaN(pairs as number) ? null : pairs,
      day_label: dayLabelFromDate(eventDate),
      edition_label: editionLabel || null,
    }
    await saveEvent(updated)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <FormField label="Data do evento">
        <input
          type="date"
          className={inputClass}
          value={eventDate}
          onChange={(ev) => setEventDate(ev.target.value)}
          required
        />
      </FormField>
      <FormField label="Local">
        <input
          className={inputClass}
          value={venue}
          onChange={(ev) => setVenue(ev.target.value)}
          placeholder="Cascais, Porto…"
          required
        />
      </FormField>
      <FormField label="Número de pares / participantes">
        <input
          type="number"
          min={0}
          className={inputClass}
          value={pairsCount}
          onChange={(ev) => setPairsCount(ev.target.value)}
          placeholder="192"
        />
      </FormField>
      <FormField label="Edição (opcional)">
        <input
          className={inputClass}
          value={editionLabel}
          onChange={(ev) => setEditionLabel(ev.target.value)}
          placeholder="FPDD — EDIÇÃO 2026"
        />
      </FormField>
      <p className="text-xs text-slate-500">
        Dia da semana (cabeçalho):{' '}
        <span className="text-slate-300 capitalize">{dayLabelFromDate(eventDate)}</span>
      </p>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[#ff2d6a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e0265d] disabled:opacity-60"
      >
        {saving ? 'A guardar…' : 'Guardar configuração'}
      </button>
    </form>
  )
}
