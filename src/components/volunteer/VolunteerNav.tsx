import { AnimatedNav, type NavTab } from '../ui/AnimatedNav'

export type VolunteerTab = 'horario' | 'eu-levo' | 'disponibilidade'

const tabs: readonly NavTab<VolunteerTab>[] = [
  { id: 'horario', label: 'HORÁRIO' },
  { id: 'eu-levo', label: 'EU LEVO' },
  { id: 'disponibilidade', label: 'DISPONIBILIDADE' },
]

export const VOLUNTEER_TAB_ORDER: readonly VolunteerTab[] = tabs.map((t) => t.id)

interface Props {
  active: VolunteerTab
  onChange: (tab: VolunteerTab) => void
}

export function VolunteerNav({ active, onChange }: Props) {
  return <AnimatedNav tabs={tabs} active={active} onChange={onChange} />
}
