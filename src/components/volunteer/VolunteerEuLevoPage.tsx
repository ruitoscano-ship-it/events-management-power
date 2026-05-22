import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { useAuth } from '../../context/AuthContext'
import { newId } from '../../lib/datetime'
import { parseDisplayQuantity } from '../../lib/volunteerDashboard'
import { Modal } from '../ui/Modal'
import { FormField, inputClass, submitButtonClass } from '../ui/FormField'

export function VolunteerEuLevoPage() {
  const { data, saveContribution } = useEvent()
  const { volunteerIdInEvent } = useAuth()
  const vid = volunteerIdInEvent!

  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customQty, setCustomQty] = useState('')
  const [customDest, setCustomDest] = useState('')
  const [savingCustom, setSavingCustom] = useState(false)

  const myItems = useMemo(
    () => data.contributions.filter((c) => c.volunteer_id === vid),
    [data.contributions, vid],
  )
  const openItems = useMemo(
    () => data.contributions.filter((c) => !c.volunteer_id),
    [data.contributions],
  )

  async function claimItem(id: string) {
    const item = data.contributions.find((c) => c.id === id)
    if (!item) return
    await saveContribution({ ...item, volunteer_id: vid, status: 'confirmed' })
  }

  async function releaseItem(id: string) {
    const item = data.contributions.find((c) => c.id === id)
    if (!item) return
    await saveContribution({ ...item, volunteer_id: null, status: 'pending' })
  }

  async function addCustomItem(e: React.FormEvent) {
    e.preventDefault()
    const name = customName.trim()
    if (!name) return
    setSavingCustom(true)
    await saveContribution({
      id: newId(),
      event_id: data.event.id,
      volunteer_id: vid,
      item_name: name,
      quantity: customQty.trim() || null,
      needed_by: null,
      status: 'confirmed',
      notes: 'Adicionado pelo voluntário',
      destination: customDest.trim() || null,
      needed_count: null,
    })
    setSavingCustom(false)
    setCustomName('')
    setCustomQty('')
    setCustomDest('')
    setShowAddCustom(false)
  }

  return (
    <div className="page-container-narrow max-w-3xl">
      <h2 className="text-2xl font-black text-white uppercase">
        Eu <span className="text-[#ff2d6a]">levo</span>
      </h2>
      <p className="mt-1 text-sm text-slate-400 mb-8">
        Vê o que o evento precisa e marca o que podes levar. O organizador vê a tua lista automaticamente.
      </p>

      <section className="mb-10">
        <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-4">
          O que eu levo
        </h3>
        {myItems.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6">
            Ainda não assumiste nenhum item. Escolhe abaixo «Eu levo» ou adiciona um item novo.
          </p>
        ) : (
          <ul className="space-y-3">
            {myItems.map((c) => (
              <li
                key={c.id}
                className="relative rounded-xl border border-[#ff2d6a]/50 bg-[#12121c] p-4 pr-12"
              >
                <span className="rounded bg-[#ff2d6a]/20 px-2 py-0.5 text-[10px] font-bold text-[#ff2d6a]">
                  {parseDisplayQuantity(c.quantity)}
                </span>
                <p className="mt-2 font-medium text-white">{c.item_name}</p>
                {c.destination && (
                  <p className="text-xs text-slate-400 mt-1 uppercase">P/ {c.destination}</p>
                )}
                <button
                  type="button"
                  onClick={() => releaseItem(c.id)}
                  className="absolute right-3 top-3 rounded p-1 text-slate-500 hover:text-white hover:bg-white/10"
                  title="Deixar de levar"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
            Ainda em aberto — {openItems.length} {openItems.length === 1 ? 'item' : 'itens'}
          </h3>
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#ff2d6a]/50 px-3 py-2 text-xs font-bold tracking-wide text-[#ff2d6a] hover:bg-[#ff2d6a]/10"
          >
            <Plus className="h-4 w-4" />
            Item que não está na lista
          </button>
        </div>
        {openItems.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6">
            Nada em aberto — podes adicionar um item novo com o botão acima.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 motion-stagger sm:grid-cols-2">
            {openItems.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => claimItem(c.id)}
                className="flex w-full min-h-11 items-center gap-2 rounded-xl border border-[#2a2a3d] bg-[#1a1a28] px-4 py-3 text-left hover:border-[#ff2d6a]/60 transition-colors group"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff2d6a]/20 text-[#ff2d6a] group-hover:bg-[#ff2d6a] group-hover:text-white">
                  <Plus className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">Eu levo</span>
                  <span className="block text-xs text-slate-400">{c.item_name}</span>
                  {(c.needed_count ?? 0) > 1 && (
                    <span className="text-[10px] text-slate-500">{c.needed_count} em falta</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <Modal
        title="Adicionar item que levo"
        open={showAddCustom}
        onClose={() => setShowAddCustom(false)}
      >
        <form onSubmit={addCustomItem} className="space-y-4">
          <FormField label="O que vais levar?">
            <input
              className={inputClass}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ex.: Travessas de sobremesa"
              required
            />
          </FormField>
          <FormField label="Quantidade (opcional)">
            <input
              className={inputClass}
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              placeholder="Ex.: x2, 3 caixas"
            />
          </FormField>
          <FormField label="Destino (opcional)">
            <input
              className={inputClass}
              value={customDest}
              onChange={(e) => setCustomDest(e.target.value)}
              placeholder="Ex.: CAFETARIA, BAR"
            />
          </FormField>
          <button type="submit" disabled={savingCustom} className={submitButtonClass}>
            {savingCustom ? 'A guardar…' : 'Adicionar e assumir'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
