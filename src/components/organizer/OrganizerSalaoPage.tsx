import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { createDefaultVenueLayout } from '../../lib/venueLayout'
import { darkBtnPrimary } from '../ui/darkForm'
import { VenueLayoutEditor } from './VenueLayoutEditor'
import type { VenueLayout } from '../../types'

export function OrganizerSalaoPage() {
  const { data, saveVenueLayout, saving } = useEvent()
  const [layout, setLayout] = useState<VenueLayout>(() =>
    data.venueLayout ?? createDefaultVenueLayout(data.event.id),
  )
  const [savedNotice, setSavedNotice] = useState(false)

  useEffect(() => {
    setLayout(data.venueLayout ?? createDefaultVenueLayout(data.event.id))
  }, [data.venueLayout, data.event.id])

  useEffect(() => {
    if (!savedNotice) return
    const t = window.setTimeout(() => setSavedNotice(false), 4000)
    return () => window.clearTimeout(t)
  }, [savedNotice])

  async function handleSave() {
    const payload: VenueLayout = {
      ...layout,
      event_id: data.event.id,
    }
    await saveVenueLayout(payload)
    setSavedNotice(true)
  }

  return (
    <div className="page-container space-y-6">
      <section>
        <h2 className="text-xl font-bold text-white uppercase">Planta do salão</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Define a pista de dança, júri, sponsors, postos de apoio (maquilhagem,
          cabeleireiro) e mesas junto à pista. Arrasta e redimensiona no canvas; guarda
          para sincronizar com a equipa.
        </p>
      </section>

      <VenueLayoutEditor layout={layout} onChange={setLayout} />

      {savedNotice && (
        <div
          role="status"
          className="flex max-w-lg items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300 motion-fade"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          <span>Planta do salão guardada com sucesso.</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className={darkBtnPrimary + ' max-w-xs'}
      >
        {saving ? 'A guardar…' : 'Guardar planta'}
      </button>
    </div>
  )
}
