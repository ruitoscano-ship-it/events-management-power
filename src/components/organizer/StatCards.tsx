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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
        >
          <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            {s.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#ff2d6a]">{s.value}</p>
          {s.hint && (
            <p className="text-xs text-slate-500">{s.hint}</p>
          )}
        </div>
      ))}
    </div>
  )
}
