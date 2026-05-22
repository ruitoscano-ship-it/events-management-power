import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { dayLabelFromDate } from '../../lib/normalize'
import { darkBtnPrimary, darkInput, darkLabel } from '../ui/darkForm'
import type { Event } from '../../types'

export function EventSettingsForm() {
  const { data, saveEvent } = useEvent()
  const e = data.event
  const [name, setName] = useState(e.name)
  const [eventDate, setEventDate] = useState(e.event_date)
  const [venue, setVenue] = useState(e.venue ?? '')
  const [pairsCount, setPairsCount] = useState(String(e.pairs_count ?? ''))
  const [editionLabel, setEditionLabel] = useState(e.edition_label ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    setSaving(true)
    const pairs = pairsCount ? parseInt(pairsCount, 10) : null
    const updated: Event = {
      ...e,
      name: trimmedName,
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
      <label className="block">
        <span className={darkLabel}>Nome do evento</span>
        <input
          className={darkInput}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="Campeonato Nacional…"
          required
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Data do evento</span>
        <input
          type="date"
          className={darkInput}
          value={eventDate}
          onChange={(ev) => setEventDate(ev.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Local</span>
        <input
          className={darkInput}
          value={venue}
          onChange={(ev) => setVenue(ev.target.value)}
          placeholder="Cascais, Porto…"
          required
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Número de pares / participantes</span>
        <input
          type="number"
          min={0}
          className={darkInput}
          value={pairsCount}
          onChange={(ev) => setPairsCount(ev.target.value)}
          placeholder="192"
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Edição (opcional)</span>
        <input
          className={darkInput}
          value={editionLabel}
          onChange={(ev) => setEditionLabel(ev.target.value)}
          placeholder="FPDD — EDIÇÃO 2026"
        />
      </label>
      <p className="text-xs text-slate-500">
        Dia da semana (cabeçalho):{' '}
        <span className="text-slate-300 capitalize">{dayLabelFromDate(eventDate)}</span>
      </p>
      <button type="submit" disabled={saving || !name.trim()} className={darkBtnPrimary}>
        {saving ? 'A guardar…' : 'Guardar configuração'}
      </button>
    </form>
  )
}
