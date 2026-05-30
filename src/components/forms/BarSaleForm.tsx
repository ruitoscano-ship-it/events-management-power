import { useMemo, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { availableQuantity } from '../../lib/barManagement'
import { newId } from '../../lib/datetime'
import { darkBtnPrimary, darkInput, darkLabel } from '../ui/darkForm'
import type { BarSale } from '../../types'

interface Props {
  onDone: () => void
}

export function BarSaleForm({ onDone }: Props) {
  const { data, saveBarSale } = useEvent()
  const products = useMemo(
    () => data.barProducts.filter((p) => p.active && p.quantity_allocated > 0),
    [data.barProducts],
  )
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const product = products.find((p) => p.id === productId)
  const avail = product ? availableQuantity(product, data.barSales) : 0
  const unitPrice = product?.unit_price ?? 0
  const qty = parseFloat(quantity.replace(',', '.')) || 0
  const total = Math.round(qty * unitPrice * 100) / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product || qty <= 0) return
    setSaving(true)
    const sale: BarSale = {
      id: newId(),
      event_id: data.event.id,
      product_id: product.id,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: total,
      sold_at: new Date().toISOString(),
      notes: notes.trim() || null,
    }
    const err = await saveBarSale(sale)
    setSaving(false)
    if (err) {
      window.alert(err)
      return
    }
    onDone()
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Adiciona produtos com stock alocado antes de registar vendas.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={darkLabel}>Produto</span>
        <select
          className={darkInput}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => {
            const a = availableQuantity(p, data.barSales)
            return (
              <option key={p.id} value={p.id} disabled={a <= 0}>
                {p.name} — {a} disp. · {p.unit_price.toFixed(2)} €
              </option>
            )
          })}
        </select>
      </label>
      <label className="block">
        <span className={darkLabel}>Quantidade</span>
        <input
          type="number"
          min={0.01}
          step="1"
          max={avail}
          className={darkInput}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <span className="mt-1 block text-xs text-slate-500">
          Disponível: {avail} · Total: {total.toFixed(2)} €
        </span>
      </label>
      <label className="block">
        <span className={darkLabel}>Notas (opcional)</span>
        <input className={darkInput} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button
        type="submit"
        disabled={saving || qty <= 0 || qty > avail || !product}
        className={darkBtnPrimary}
      >
        {saving ? 'A registar…' : 'Registar venda'}
      </button>
    </form>
  )
}
