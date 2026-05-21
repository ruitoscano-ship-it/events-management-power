export type VolunteerTab = 'horario' | 'eu-trago' | 'disponibilidade'

const tabs: { id: VolunteerTab; label: string }[] = [
  { id: 'horario', label: 'HORÁRIO' },
  { id: 'eu-trago', label: 'EU TRAGO' },
  { id: 'disponibilidade', label: 'DISPONIBILIDADE' },
]

interface Props {
  active: VolunteerTab
  onChange: (tab: VolunteerTab) => void
}

export function VolunteerNav({ active, onChange }: Props) {
  return (
    <nav className="border-b border-[#2a2a3d] bg-[#0a0a12]">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 md:gap-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`relative shrink-0 py-3 text-xs font-bold tracking-widest transition-colors ${
              active === t.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
            {active === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2d6a]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
