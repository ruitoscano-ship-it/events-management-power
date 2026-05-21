import { Plus, X } from 'lucide-react'
import { useMemo } from 'react'
import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'
import { parseDisplayQuantity } from '../../lib/volunteerDashboard'

const DEFAULT_VOLUNTEER = 'v-ma'

export function VolunteerEuTragoPage() {
  const { data, saveContribution } = useEvent()
  const { volunteerId } = useRole()
  const vid = volunteerId ?? DEFAULT_VOLUNTEER

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="text-2xl font-black text-white uppercase">
        Eu <span className="text-[#ff2d6a]">trago</span>
      </h2>
      <p className="mt-1 text-sm text-slate-400 mb-8">
        Vê o que o evento precisa e marca o que podes trazer. O organizador vê a tua lista automaticamente.
      </p>

      <section className="mb-10">
        <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-4">
          O que eu trago
        </h3>
        {myItems.length === 0 ? (
          <p className="text-sm text-slate-500 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6">
            Ainda não assumiste nenhum item. Escolhe abaixo «eu trago».
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
                  title="Deixar de trazer"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">
          Ainda em aberto — {openItems.length} {openItems.length === 1 ? 'item' : 'itens'}
        </h3>
        <div className="flex flex-wrap gap-2 motion-stagger">
          {openItems.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => claimItem(c.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2a2a3d] bg-[#1a1a28] px-4 py-3 text-left hover:border-[#ff2d6a]/60 transition-colors group"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff2d6a]/20 text-[#ff2d6a] group-hover:bg-[#ff2d6a] group-hover:text-white">
                <Plus className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-white">Eu trago</span>
                <span className="block text-xs text-slate-400">{c.item_name}</span>
                {(c.needed_count ?? 0) > 1 && (
                  <span className="text-[10px] text-slate-500">{c.needed_count} em falta</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
