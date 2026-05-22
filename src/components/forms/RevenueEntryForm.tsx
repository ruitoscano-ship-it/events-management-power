import { useMemo, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { newId } from '../../lib/datetime'
import { formatEur } from '../../lib/currency'
import { REVENUE_SOURCE_LABELS } from '../../lib/financials'
import { darkBtnPrimary, darkInput, darkLabel } from '../ui/darkForm'
import type { RevenueEntry, RevenueEntryType, RevenueSource } from '../../types'

interface Props {
  source: RevenueSource
  entryType: RevenueEntryType
  initial?: RevenueEntry
  onDone: () => void
}

export function RevenueEntryForm({
  source,
  entryType,
  initial,
  onDone,
}: Props) {
  const { data, saveRevenueEntry } = useEvent()
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : '',
  )
  const [quantity, setQuantity] = useState(
    initial?.quantity != null ? String(initial.quantity) : '',
  )
  const [unitPrice, setUnitPrice] = useState(
    initial?.unit_price != null ? String(initial.unit_price) : '',
  )
  const [recordedAt, setRecordedAt] = useState(
    initial?.recorded_at ?? data.event.event_date,
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const computedTotal = useMemo(() => {
    const q = quantity ? parseFloat(quantity.replace(',', '.')) : null
    const p = unitPrice ? parseFloat(unitPrice.replace(',', '.')) : null
    if (q != null && p != null && Number.isFinite(q) && Number.isFinite(p)) {
      return q * p
    }
    const a = amount ? parseFloat(amount.replace(',', '.')) : null
    return a != null && Number.isFinite(a) ? a : null
  }, [quantity, unitPrice, amount])

  const useQtyMode = source === 'tickets'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalAmount =
      computedTotal ??
      (amount ? parseFloat(amount.replace(',', '.')) : null)
    if (finalAmount == null || !Number.isFinite(finalAmount)) return

    setSaving(true)
    const q = quantity ? parseFloat(quantity.replace(',', '.')) : null
    const p = unitPrice ? parseFloat(unitPrice.replace(',', '.')) : null

    await saveRevenueEntry(
      {
        id: initial?.id ?? newId(),
        event_id: data.event.id,
        source,
        entry_type: entryType,
        description: description.trim() || null,
        amount: finalAmount,
        quantity: Number.isFinite(q as number) ? q : null,
        unit_price: Number.isFinite(p as number) ? p : null,
        recorded_at: recordedAt,
        notes: notes.trim() || null,
      },
      !initial,
    )
    setSaving(false)
    onDone()
  }

  const title =
    entryType === 'forecast'
      ? `Previsão — ${REVENUE_SOURCE_LABELS[source]}`
      : `Registo — ${REVENUE_SOURCE_LABELS[source]}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-semibold text-white">{title}</p>

      <label className="block">
        <span className={darkLabel}>Descrição</span>
        <input
          className={darkInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            source === 'bar'
              ? 'Vendas de bar — dia do evento'
              : source === 'tickets'
                ? 'Bilhetes público geral'
                : 'Outra receita'
          }
        />
      </label>

      {useQtyMode ? (
        <div className="form-grid-2">
          <label className="block">
            <span className={darkLabel}>Quantidade (bilhetes)</span>
            <input
              type="number"
              min={0}
              className={darkInput}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="200"
            />
          </label>
          <label className="block">
            <span className={darkLabel}>Preço unitário (EUR)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={darkInput}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="15"
            />
          </label>
        </div>
      ) : (
        <label className="block">
          <span className={darkLabel}>Valor (EUR)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={darkInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required={!useQtyMode}
          />
        </label>
      )}

      {computedTotal != null && (
        <p className="text-sm text-emerald-400">
          Total: <span className="font-semibold">{formatEur(computedTotal)}</span>
        </p>
      )}

      <label className="block">
        <span className={darkLabel}>Data</span>
        <input
          type="date"
          className={darkInput}
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Notas</span>
        <input className={darkInput} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button
        type="submit"
        disabled={saving || computedTotal == null}
        className={darkBtnPrimary}
      >
        {saving ? 'A guardar…' : 'Guardar'}
      </button>
    </form>
  )
}
