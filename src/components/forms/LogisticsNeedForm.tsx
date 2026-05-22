import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { newId } from '../../lib/datetime'
import { FormField, inputClass } from '../ui/FormField'

interface Props {
  onDone: () => void
}

/** Organizador: criar necessidade logística em aberto */
export function LogisticsNeedForm({ onDone }: Props) {
  const { data, saveContribution } = useEvent()
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [neededCount, setNeededCount] = useState('1')
  const [destination, setDestination] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const count = parseInt(neededCount, 10) || 1
    await saveContribution({
      id: newId(),
      event_id: data.event.id,
      volunteer_id: null,
      item_name: itemName,
      quantity: quantity || `${count} un.`,
      needed_by: null,
      status: 'pending',
      notes: null,
      destination: destination || null,
      needed_count: count,
    })
    setSaving(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="O que é preciso?">
        <input
          className={inputClass}
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
          placeholder="Quiche, garrafão de água…"
        />
      </FormField>
      <div className="form-grid-2">
        <FormField label="Quantidade em falta">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={neededCount}
            onChange={(e) => setNeededCount(e.target.value)}
          />
        </FormField>
        <FormField label="Notas (opcional)">
          <input
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="ex. 2 tabuleiros"
          />
        </FormField>
      </div>
      <FormField label="Destino (opcional)">
        <input
          className={inputClass}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="BAR, MESA JURADOS…"
        />
      </FormField>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-[#ff2d6a] py-2.5 text-sm font-medium text-white hover:bg-[#e0265d] disabled:opacity-60"
      >
        {saving ? 'A guardar…' : 'Publicar necessidade'}
      </button>
    </form>
  )
}
