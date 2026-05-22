import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { formatEventDateLine } from '../../lib/eventDate'
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
  const [savedNotice, setSavedNotice] = useState(false)

  useEffect(() => {
    setName(e.name)
    setEventDate(e.event_date)
    setVenue(e.venue ?? '')
    setPairsCount(String(e.pairs_count ?? ''))
    setEditionLabel(e.edition_label ?? '')
  }, [
    e.id,
    e.name,
    e.event_date,
    e.venue,
    e.pairs_count,
    e.edition_label,
    e.day_label,
  ])

  useEffect(() => {
    if (!savedNotice) return
    const t = window.setTimeout(() => setSavedNotice(false), 4000)
    return () => window.clearTimeout(t)
  }, [savedNotice])

  function clearSavedNotice() {
    setSavedNotice(false)
  }

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
    try {
      await saveEvent(updated)
      setSavedNotice(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <label className="block">
        <span className={darkLabel}>Nome do evento</span>
        <input
          className={darkInput}
          value={name}
          onChange={(ev) => {
            clearSavedNotice()
            setName(ev.target.value)
          }}
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
          onChange={(ev) => {
            clearSavedNotice()
            setEventDate(ev.target.value)
          }}
          required
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Local</span>
        <input
          className={darkInput}
          value={venue}
          onChange={(ev) => {
            clearSavedNotice()
            setVenue(ev.target.value)
          }}
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
          onChange={(ev) => {
            clearSavedNotice()
            setPairsCount(ev.target.value)
          }}
          placeholder="192"
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Edição (opcional)</span>
        <input
          className={darkInput}
          value={editionLabel}
          onChange={(ev) => {
            clearSavedNotice()
            setEditionLabel(ev.target.value)
          }}
          placeholder="FPDD — EDIÇÃO 2026"
        />
      </label>
      <p className="text-xs text-slate-500">
        Data no cabeçalho:{' '}
        <span className="text-slate-300 capitalize">
          {formatEventDateLine({
            event_date: eventDate,
            day_label: dayLabelFromDate(eventDate),
          })}
        </span>
      </p>

      {savedNotice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300 motion-fade"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          <span>Configuração guardada com sucesso.</span>
        </div>
      )}

      <button type="submit" disabled={saving || !name.trim()} className={darkBtnPrimary}>
        {saving ? 'A guardar…' : 'Guardar configuração'}
      </button>
    </form>
  )
}
