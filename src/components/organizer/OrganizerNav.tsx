import { AnimatedNav, type NavTab } from '../ui/AnimatedNav'

export type OrganizerTab = 'horario' | 'logistica' | 'equipa' | 'salao' | 'admin'

const tabs: readonly NavTab<OrganizerTab>[] = [
  { id: 'horario', label: 'HORÁRIO' },
  { id: 'logistica', label: 'LOGÍSTICA' },
  { id: 'equipa', label: 'EQUIPA' },
  { id: 'salao', label: 'SALÃO' },
  { id: 'admin', label: 'ADMIN' },
]

export const ORGANIZER_TAB_ORDER: readonly OrganizerTab[] = tabs.map((t) => t.id)

interface Props {
  active: OrganizerTab
  onChange: (tab: OrganizerTab) => void
}

export function OrganizerNav({ active, onChange }: Props) {
  return <AnimatedNav tabs={tabs} active={active} onChange={onChange} />
}
