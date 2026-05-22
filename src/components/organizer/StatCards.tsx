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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-[#2a2a3d] bg-[#12121c] px-3.5 py-3 sm:px-4 sm:py-3"
        >
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            {s.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#ff2d6a] sm:mt-1 sm:text-2xl">{s.value}</p>
          {s.hint && (
            <p className="mt-0.5 text-sm leading-snug text-slate-400 sm:text-xs">{s.hint}</p>
          )}
        </div>
      ))}
    </div>
  )
}
