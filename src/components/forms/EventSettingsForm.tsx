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
  const [saveError, setSaveError] = useState<string | null>(null)

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

  function clearFeedback() {
    setSavedNotice(false)
    setSaveError(null)
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    setSaving(true)
    setSaveError(null)
    setSavedNotice(false)
    const pairs = pairsCount.trim() ? parseInt(pairsCount, 10) : null
    const updated: Event = {
      ...e,
      name: trimmedName,
      event_date: eventDate,
      venue: venue.trim() || null,
      pairs_count:
        pairs != null && !Number.isNaN(pairs) && pairs >= 0 ? pairs : null,
      day_label: dayLabelFromDate(eventDate),
      edition_label: editionLabel.trim() || null,
    }
    const err = await saveEvent(updated)
    setSaving(false)
    if (err) {
      setSaveError(err)
      return
    }
    setSavedNotice(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <label className="block">
        <span className={darkLabel}>Nome do evento</span>
        <input
          className={darkInput}
          value={name}
          onChange={(ev) => {
            clearFeedback()
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
            clearFeedback()
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
            clearFeedback()
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
            clearFeedback()
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
            clearFeedback()
            setEditionLabel(ev.target.value)
          }}
          placeholder="FPDD — EDIÇÃO 2026"
        />
      </label>
      <p className="text-xs text-slate-500">
        Data no cabeçalho:{' '}
        <span className="text-slate-300 capitalize">
          {formatEventDateLine({ event_date: eventDate })}
        </span>
      </p>

      {saveError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
        >
          <span>{saveError}</span>
        </div>
      )}

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
