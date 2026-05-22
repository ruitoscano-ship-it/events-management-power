import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { newId } from '../../lib/datetime'
import { darkBtnPrimary, darkInput, darkLabel } from '../ui/darkForm'
import type { EventSponsor, SponsorStatus, SponsorshipKind } from '../../types'

interface Props {
  initial?: EventSponsor
  onDone: () => void
}

export function SponsorForm({ initial, onDone }: Props) {
  const { data, saveSponsor } = useEvent()
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<SponsorshipKind>(
    initial?.sponsorship_kind ?? 'cash',
  )
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : '',
  )
  const [inKind, setInKind] = useState(initial?.in_kind_description ?? '')
  const [status, setStatus] = useState<SponsorStatus>(initial?.status ?? 'promised')
  const [contactName, setContactName] = useState(initial?.contact_name ?? '')
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? '')
  const [promisedAt, setPromisedAt] = useState(initial?.promised_at ?? '')
  const [receivedAt, setReceivedAt] = useState(initial?.received_at ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const parsedAmount = amount ? parseFloat(amount.replace(',', '.')) : null
    await saveSponsor(
      {
        id: initial?.id ?? newId(),
        event_id: data.event.id,
        name: name.trim(),
        sponsorship_kind: kind,
        amount: Number.isFinite(parsedAmount as number) ? parsedAmount : null,
        in_kind_description: inKind.trim() || null,
        status,
        contact_name: contactName.trim() || null,
        contact_email: contactEmail.trim() || null,
        promised_at: promisedAt || null,
        received_at: receivedAt || null,
        notes: notes.trim() || null,
      },
      !initial,
    )
    setSaving(false)
    onDone()
  }

  const selectClass = darkInput

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={darkLabel}>Patrocinador</span>
        <input
          className={darkInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome da empresa / marca"
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Espécie</span>
        <select
          className={selectClass}
          value={kind}
          onChange={(e) => setKind(e.target.value as SponsorshipKind)}
        >
          <option value="cash">Monetário</option>
          <option value="in_kind">Em espécie (bens/serviços)</option>
          <option value="mixed">Misto</option>
        </select>
      </label>
      {(kind === 'cash' || kind === 'mixed') && (
        <label className="block">
          <span className={darkLabel}>Valor (EUR)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={darkInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1500"
          />
        </label>
      )}
      {(kind === 'in_kind' || kind === 'mixed') && (
        <label className="block">
          <span className={darkLabel}>Descrição em espécie</span>
          <textarea
            className={darkInput}
            rows={2}
            value={inKind}
            onChange={(e) => setInKind(e.target.value)}
            placeholder="Banner, catering, prémios…"
          />
        </label>
      )}
      <label className="block">
        <span className={darkLabel}>Estado</span>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as SponsorStatus)}
        >
          <option value="promised">Prometido</option>
          <option value="confirmed">Confirmado</option>
          <option value="received">Recebido</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </label>
      <div className="form-grid-2">
        <label className="block">
          <span className={darkLabel}>Contacto</span>
          <input
            className={darkInput}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={darkLabel}>Email</span>
          <input
            type="email"
            className={darkInput}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>
      </div>
      <div className="form-grid-2">
        <label className="block">
          <span className={darkLabel}>Data promessa</span>
          <input
            type="date"
            className={darkInput}
            value={promisedAt}
            onChange={(e) => setPromisedAt(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={darkLabel}>Data receção</span>
          <input
            type="date"
            className={darkInput}
            value={receivedAt}
            onChange={(e) => setReceivedAt(e.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className={darkLabel}>Notas</span>
        <input className={darkInput} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button type="submit" disabled={saving || !name.trim()} className={darkBtnPrimary}>
        {saving ? 'A guardar…' : initial ? 'Atualizar' : 'Registar patrocinador'}
      </button>
    </form>
  )
}
