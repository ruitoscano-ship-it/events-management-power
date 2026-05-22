interface Stat {
  label: string
  value: string
  hint?: string
}

interface Props {
  stats: Stat[]
}

export function StatCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-[#2a2a3d] bg-[#12121c] px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <p className="text-[9px] font-semibold tracking-widest text-slate-500 uppercase sm:text-[10px]">
            {s.label}
          </p>
          <p className="mt-0.5 text-xl font-bold text-[#ff2d6a] sm:mt-1 sm:text-2xl">{s.value}</p>
          {s.hint && (
            <p className="text-[10px] text-slate-500 sm:text-xs">{s.hint}</p>
          )}
        </div>
      ))}
    </div>
  )
}
