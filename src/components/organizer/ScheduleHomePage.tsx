import { useMemo } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatDate, formatTimeRange } from '../../lib/format'
import { scheduleStats, volunteersForBlock } from '../../lib/schedule'
import { CategoryBadge } from './CategoryBadge'
import { StatCards } from './StatCards'
import { VolunteerAvatars } from './VolunteerAvatars'

export function ScheduleHomePage() {
  const { data } = useEvent()

  const sorted = useMemo(
    () =>
      [...data.schedule].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [data.schedule],
  )

  const stats = scheduleStats(data.schedule, data.event.pairs_count)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
            <span className="text-white">HORÁRIO </span>
            <span className="text-[#ff2d6a]">OFICIAL</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 capitalize">
            {formatDate(data.event.event_date + 'T12:00:00')}
          </p>
        </div>
        <StatCards
          stats={[
            { label: 'PROVAS', value: String(stats.provas), hint: stats.provasHint },
            { label: 'PARES', value: String(stats.pares), hint: 'inscritos' },
            { label: 'INÍCIO', value: stats.inicio, hint: stats.inicioHint || undefined },
            { label: 'FIM', value: stats.fim, hint: stats.fimHint },
          ]}
        />
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#2a2a3d] bg-[#12121c]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2a2a3d] text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              <th className="px-4 py-3 w-28">Hora</th>
              <th className="px-4 py-3 w-28">Categoria</th>
              <th className="px-4 py-3">Prova / Atividade</th>
              <th className="px-4 py-3 w-24">Espaço</th>
              <th className="px-4 py-3 w-36">Voluntários</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((block) => {
              const assigned = volunteersForBlock(data, block.id)
              return (
                <tr
                  key={block.id}
                  className="border-b border-[#2a2a3d]/60 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                    {formatTimeRange(block.starts_at, block.ends_at)}
                  </td>
                  <td className="px-4 py-4">
                    <CategoryBadge category={block.category} />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{block.title}</p>
                    {block.description && (
                      <p className="mt-0.5 text-xs text-slate-500">{block.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-400 uppercase">
                    {block.location ?? '—'}
                  </td>
                  <td className="px-4 py-4">
                    <VolunteerAvatars volunteers={assigned} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 md:hidden space-y-3">
        {sorted.map((block) => (
          <article
            key={block.id}
            className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                {formatTimeRange(block.starts_at, block.ends_at)}
              </span>
              <CategoryBadge category={block.category} />
            </div>
            <h3 className="mt-2 font-medium text-white">{block.title}</h3>
            {block.description && (
              <p className="text-xs text-slate-500">{block.description}</p>
            )}
            <p className="mt-2 text-xs text-slate-500 uppercase">{block.location}</p>
            <div className="mt-3">
              <VolunteerAvatars volunteers={volunteersForBlock(data, block.id)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
