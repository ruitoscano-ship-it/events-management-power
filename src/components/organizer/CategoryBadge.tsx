import { categoryLabels } from '../../lib/schedule'
import type { ScheduleCategory } from '../../types'

const styles: Record<ScheduleCategory, string> = {
  setup: 'border-slate-500 text-slate-300 bg-transparent',
  logistics: 'border-cyan-400/70 text-cyan-300 bg-cyan-400/10',
  standard: 'border-purple-400/80 text-purple-200 bg-purple-500/20',
  latinas: 'border-[#ff2d6a]/80 text-pink-200 bg-[#ff2d6a]/15',
  break: 'border-transparent text-slate-400 bg-transparent font-normal',
  ceremony: 'border-rose-400/70 text-rose-200 bg-rose-500/15',
  activity: 'border-slate-500 text-slate-300 bg-transparent',
}

interface Props {
  category: ScheduleCategory
}

export function CategoryBadge({ category }: Props) {
  const isBreak = category === 'break'
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
        isBreak ? '' : 'border'
      } ${styles[category]}`}
    >
      {categoryLabels[category]}
    </span>
  )
}
