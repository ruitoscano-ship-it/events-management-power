import { useMemo } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatDate, formatTimeRange } from '../../lib/format'
import { volunteersForBlock } from '../../lib/schedule'
import { CategoryBadge } from '../organizer/CategoryBadge'
import { VolunteerAvatars } from '../organizer/VolunteerAvatars'

interface Props {
  showTitle?: boolean
  selectedId?: string | null
  onSelectBlock?: (id: string) => void
}

export function ScheduleTable({
  showTitle = true,
  selectedId,
  onSelectBlock,
}: Props) {
  const { data } = useEvent()
  const sorted = useMemo(
    () =>
      [...data.schedule].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [data.schedule],
  )

  return (
    <div>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
            <span className="text-white">Horário </span>
            <span className="text-[#ff2d6a]">oficial</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 capitalize">
            {formatDate(data.event.event_date + 'T12:00:00')} — visível para toda a equipa
          </p>
        </div>
      )}

      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#2a2a3d] bg-[#12121c]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2a2a3d] text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              <th className="px-4 py-3 w-28">Hora</th>
              <th className="px-4 py-3 w-28">Categoria</th>
              <th className="px-4 py-3">Prova / Atividade</th>
              <th className="px-4 py-3 w-24">Espaço</th>
              <th className="px-4 py-3 w-36">Equipa</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((block) => (
              <tr
                key={block.id}
                data-schedule-id={block.id}
                onClick={() => onSelectBlock?.(block.id)}
                className={`border-b border-[#2a2a3d]/60 last:border-0 ${
                  onSelectBlock ? 'cursor-pointer hover:bg-white/[0.03]' : ''
                } ${selectedId === block.id ? 'bg-[#ff2d6a]/10' : ''}`}
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
                  <VolunteerAvatars volunteers={volunteersForBlock(data, block.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
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
          </article>
        ))}
      </div>
    </div>
  )
}
