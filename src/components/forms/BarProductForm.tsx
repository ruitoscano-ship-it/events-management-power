import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { newId } from '../../lib/datetime'
import { darkBtnPrimary, darkInput, darkLabel } from '../ui/darkForm'
import type { BarProduct } from '../../types'

interface Props {
  initial?: BarProduct
  onDone: () => void
}

export function BarProductForm({ initial, onDone }: Props) {
  const { data, saveBarProduct } = useEvent()
  const [name, setName] = useState(initial?.name ?? '')
  const [unitPrice, setUnitPrice] = useState(
    initial?.unit_price != null ? String(initial.unit_price) : '',
  )
  const [collected, setCollected] = useState(
    initial?.quantity_collected != null ? String(initial.quantity_collected) : '0',
  )
  const [allocated, setAllocated] = useState(
    initial?.quantity_allocated != null ? String(initial.quantity_allocated) : '0',
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const price = parseFloat(unitPrice.replace(',', '.')) || 0
    const qtyCollected = parseFloat(collected.replace(',', '.')) || 0
    const qtyAllocated = parseFloat(allocated.replace(',', '.')) || 0
    if (qtyAllocated > qtyCollected) {
      window.alert('A quantidade alocada não pode exceder a recolhida.')
      return
    }
    setSaving(true)
    try {
      await saveBarProduct(
        {
          id: initial?.id ?? newId(),
          event_id: data.event.id,
          name: name.trim(),
          unit_price: price,
          quantity_collected: qtyCollected,
          quantity_allocated: qtyAllocated,
          sort_order: initial?.sort_order ?? data.barProducts.length,
          active: initial?.active ?? true,
        },
        !initial,
      )
      onDone()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={darkLabel}>Produto</span>
        <input
          className={darkInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex.: Água 50cl, Cerveja, Café"
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
          required
        />
      </label>
      <div className="form-grid-2">
        <label className="block">
          <span className={darkLabel}>Qtd. recolhida</span>
          <input
            type="number"
            min={0}
            step="1"
            className={darkInput}
            value={collected}
            onChange={(e) => setCollected(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={darkLabel}>Qtd. alocada (à venda)</span>
          <input
            type="number"
            min={0}
            step="1"
            className={darkInput}
            value={allocated}
            onChange={(e) => setAllocated(e.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className={darkBtnPrimary}
      >
        {saving ? 'A guardar…' : initial ? 'Atualizar produto' : 'Adicionar produto'}
      </button>
    </form>
  )
}
