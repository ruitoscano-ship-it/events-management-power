import { Plus, X } from 'lucide-react'
import { useMemo } from 'react'
import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'
import { formatTimeRange } from '../../lib/format'
import {
  buildMyDayRows,
  countContributionUnits,
  parseDisplayQuantity,
  shiftLabels,
} from '../../lib/volunteerDashboard'
import { avatarColor, volunteerInitials } from '../../lib/volunteers'
import { CategoryBadge } from '../organizer/CategoryBadge'

const MARIA_AVATAR = '#f97316'
const DEFAULT_VOLUNTEER = 'v-ma'

export function VolunteerHomePage() {
  const { data, saveContribution } = useEvent()
  const { volunteerId, setVolunteerId } = useRole()
  const vid = volunteerId ?? DEFAULT_VOLUNTEER

  const volunteer = data.volunteers.find((v) => v.id === vid)!
  const myDay = useMemo(() => buildMyDayRows(data, vid), [data, vid])
  const shifts = useMemo(() => shiftLabels(data.availability, vid), [data, vid, data.availability])
  const myItems = useMemo(
    () => data.contributions.filter((c) => c.volunteer_id === vid),
    [data.contributions, vid],
  )
  const openItems = useMemo(
    () => data.contributions.filter((c) => !c.volunteer_id),
    [data.contributions],
  )
  const taskCount = data.tasks.filter((t) => t.volunteer_id === vid).length
  const unitCount = countContributionUnits(myItems)

  async function claimItem(id: string) {
    const item = data.contributions.find((c) => c.id === id)
    if (!item) return
    await saveContribution({
      ...item,
      volunteer_id: vid,
      status: 'confirmed',
    })
  }

  async function releaseItem(id: string) {
    const item = data.contributions.find((c) => c.id === id)
    if (!item) return
    await saveContribution({
      ...item,
      volunteer_id: null,
      status: 'pending',
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Profile bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-[#2a2a3d] pb-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{
              backgroundColor: vid === 'v-ma' ? MARIA_AVATAR : avatarColor(vid),
            }}
          >
            {volunteerInitials(volunteer.name)}
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              Bom dia, voluntário
            </p>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase md:text-3xl">
              {volunteer.name}
            </h2>
            {volunteer.role && (
              <p className="mt-1 text-sm font-bold tracking-wide text-[#ff2d6a] uppercase">
                {volunteer.role}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            Ver como
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.volunteers.slice(0, 10).map((v) => (
              <button
                key={v.id}
                type="button"
                title={v.name}
                onClick={() => setVolunteerId(v.id)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white transition-transform hover:scale-110 ${
                  vid === v.id ? 'border-[#ff2d6a] ring-2 ring-[#ff2d6a]/40' : 'border-[#0a0a12]'
                }`}
                style={{
                  backgroundColor:
                    v.id === 'v-ma' ? MARIA_AVATAR : avatarColor(v.id),
                }}
              >
                {volunteerInitials(v.name)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-[320px]">
          <StatMini
            label="Turnos"
            value={String(shifts.length || 2)}
            hint={shifts.length ? shifts.join(' · ') : '07:30-13:00 · 14:30-19:00'}
          />
          <StatMini label="Tarefas" value={String(taskCount)} hint="atribuídas" />
          <StatMini
            label="Itens"
            value={String(myItems.length)}
            hint={`${unitCount} unidades`}
          />
        </div>
      </div>

      {/* Two columns */}
      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
            O meu dia
          </h3>
          <ul className="divide-y divide-[#2a2a3d] rounded-xl border border-[#2a2a3d] bg-[#12121c]">
            {myDay.length === 0 ? (
              <li className="px-4 py-8 text-sm text-slate-500">
                Sem tarefas atribuídas para hoje.
              </li>
            ) : (
              myDay.map((row) => (
                <li
                  key={row.taskId}
                  className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap"
                >
                  <span className="w-28 shrink-0 font-mono text-xs text-slate-400">
                    {formatTimeRange(row.startsAt, row.endsAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white uppercase text-sm tracking-wide">
                      {row.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 uppercase">
                      {row.location}
                      {row.othersCount > 0
                        ? ` — com ${row.othersCount} outro${row.othersCount > 1 ? 's' : ''}`
                        : ''}
                    </p>
                  </div>
                  <CategoryBadge category={row.category} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
            Eu trago
          </h3>

          <ul className="space-y-3 mb-8">
            {myItems.map((c) => (
              <li
                key={c.id}
                className="relative rounded-xl border border-[#ff2d6a]/40 bg-[#12121c] p-4 pr-10"
              >
                <span className="absolute left-3 top-3 rounded bg-[#ff2d6a]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#ff2d6a]">
                  {parseDisplayQuantity(c.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => releaseItem(c.id)}
                  className="absolute right-2 top-2 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white"
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="pt-5">
                  <p className="font-medium text-white text-sm">{c.item_name}</p>
                  {c.destination && (
                    <p className="mt-1 text-[11px] font-medium text-[#ff2d6a] uppercase tracking-wide">
                      P/ {c.destination}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {myItems.length === 0 && (
              <p className="text-sm text-slate-500">Ainda não tens itens atribuídos.</p>
            )}
          </ul>

          <div>
            <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Ainda em aberto — {openItems.length} itens
            </p>
            <div className="flex flex-wrap gap-2">
              {openItems.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => claimItem(c.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#2a2a3d] bg-[#1a1a28] px-2.5 py-1.5 text-left text-[11px] text-slate-300 hover:border-[#ff2d6a]/50 hover:text-white transition-colors max-w-full"
                >
                  <Plus className="h-3 w-3 shrink-0 text-[#ff2d6a]" />
                  <span>
                    {c.item_name}
                    {c.needed_count != null && c.needed_count > 1
                      ? ` (${c.needed_count} faltam)`
                      : c.quantity?.includes('faltam')
                        ? ` (${c.quantity})`
                        : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatMini({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-[#2a2a3d] bg-[#12121c] px-3 py-2.5 text-center">
      <p className="text-[9px] font-semibold tracking-widest text-slate-500 uppercase">
        {label}
      </p>
      <p className="text-xl font-bold text-[#ff2d6a]">{value}</p>
      {hint && (
        <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{hint}</p>
      )}
    </div>
  )
}
