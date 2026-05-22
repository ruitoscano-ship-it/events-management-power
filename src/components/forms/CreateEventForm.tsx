import { useState } from 'react'
import { formatEventDateLine } from '../../lib/eventDate'
import { dayLabelFromDate } from '../../lib/normalize'
import { useAuth } from '../../context/AuthContext'
import {
  FormField,
  inputClass,
  submitButtonClass,
  cancelButtonClass,
} from '../ui/FormField'

function defaultEventDate(): string {
  return new Date().toISOString().slice(0, 10)
}

interface Props {
  onCreated: (eventId: string) => void
  onCancel: () => void
}

export function CreateEventForm({ onCreated, onCancel }: Props) {
  const { createEvent } = useAuth()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState(defaultEventDate)
  const [venue, setVenue] = useState('')
  const [pairsCount, setPairsCount] = useState('')
  const [editionLabel, setEditionLabel] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    if (!venue.trim()) {
      setError('Indica o local do evento.')
      return
    }

    setSaving(true)
    setError(null)
    const pairs = pairsCount.trim() ? parseInt(pairsCount, 10) : null
    const result = await createEvent({
      name: trimmedName,
      event_date: eventDate,
      venue: venue.trim(),
      pairs_count:
        pairs != null && !Number.isNaN(pairs) && pairs >= 0 ? pairs : null,
      edition_label: editionLabel.trim() || null,
      description: description.trim() || null,
      sport_type: 'danca_salao',
      day_label: dayLabelFromDate(eventDate),
    })
    setSaving(false)

    if ('error' in result) {
      setError(result.error)
      return
    }
    onCreated(result.eventId)
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="grid min-h-0 h-full grid-rows-[minmax(0,1fr)_auto]"
    >
      <div className="modal-dialog-scroll min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
        <div className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <FormField label="Nome do evento">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="Campeonato Regional…"
              required
            />
          </FormField>

          <FormField label="Data do evento">
            <input
              type="date"
              className={inputClass}
              value={eventDate}
              onChange={(e) => {
                setEventDate(e.target.value)
                setError(null)
              }}
              required
            />
          </FormField>

          <FormField label="Local">
            <input
              className={inputClass}
              value={venue}
              onChange={(e) => {
                setVenue(e.target.value)
                setError(null)
              }}
              placeholder="Seixal, PCR…"
              required
            />
          </FormField>

          <FormField label="Número de pares (opcional)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={pairsCount}
              onChange={(e) => setPairsCount(e.target.value)}
              placeholder="192"
            />
          </FormField>

          <FormField label="Edição (opcional)">
            <input
              className={inputClass}
              value={editionLabel}
              onChange={(e) => setEditionLabel(e.target.value)}
              placeholder="FPDD — EDIÇÃO 2026"
            />
          </FormField>

          <FormField label="Descrição (opcional)">
            <textarea
              className={inputClass}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <p className="text-xs text-slate-500">
            Aparecerá como:{' '}
            <span className="text-slate-700 capitalize">
              {eventDate ? formatEventDateLine({ event_date: eventDate }) : '—'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`${cancelButtonClass} sm:min-w-[7.5rem]`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim() || !venue.trim()}
          className={`${submitButtonClass} sm:min-w-[7.5rem]`}
        >
          {saving ? 'A criar…' : 'Criar evento'}
        </button>
      </div>
    </form>
  )
}
