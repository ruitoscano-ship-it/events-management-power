import { useMemo } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatTimeRange } from '../../lib/format'
import { volunteersForBlock } from '../../lib/schedule'
import { CategoryBadge } from '../organizer/CategoryBadge'
import { VolunteerAvatars } from '../organizer/VolunteerAvatars'

export function VolunteerScheduleView() {
  const { data } = useEvent()
  const sorted = useMemo(
    () =>
      [...data.schedule].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [data.schedule],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-xl font-bold text-white uppercase mb-4">Horário geral</h2>
      <ul className="divide-y divide-[#2a2a3d] rounded-xl border border-[#2a2a3d] bg-[#12121c]">
        {sorted.map((block) => (
          <li key={block.id} className="flex flex-wrap gap-3 px-4 py-3 items-center">
            <span className="font-mono text-xs text-slate-400 w-28">
              {formatTimeRange(block.starts_at, block.ends_at)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{block.title}</p>
              <p className="text-xs text-slate-500 uppercase">{block.location}</p>
            </div>
            <CategoryBadge category={block.category} />
            <VolunteerAvatars volunteers={volunteersForBlock(data, block.id)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function VolunteerTeamView() {
  const { data } = useEvent()
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-xl font-bold text-white uppercase mb-4">Equipa</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.volunteers.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
          >
            <p className="font-semibold text-white">{v.name}</p>
            {v.role && (
              <p className="text-xs text-[#ff2d6a] mt-1 uppercase">{v.role}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function VolunteerLogisticsView() {
  const { data } = useEvent()
  const open = data.contributions.filter((c) => !c.volunteer_id)
  const taken = data.contributions.filter((c) => c.volunteer_id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-4">Em aberto</h2>
        <div className="flex flex-wrap gap-2">
          {open.map((c) => (
            <span
              key={c.id}
              className="rounded-lg border border-[#2a2a3d] bg-[#1a1a28] px-3 py-2 text-xs text-slate-300"
            >
              {c.item_name}
            </span>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-4">Atribuídos</h2>
        <ul className="space-y-2">
          {taken.map((c) => {
            const v = data.volunteers.find((x) => x.id === c.volunteer_id)
            return (
              <li
                key={c.id}
                className="rounded-lg border border-[#2a2a3d] bg-[#12121c] px-4 py-3 text-sm"
              >
                <span className="text-white">{c.item_name}</span>
                <span className="text-slate-500"> — {v?.name ?? '—'}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
