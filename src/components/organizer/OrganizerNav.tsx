import { AnimatedNav, type NavTab } from '../ui/AnimatedNav'

export type OrganizerTab =
  | 'horario'
  | 'logistica'
  | 'terceiros'
  | 'equipa'
  | 'salao'
  | 'sponsors'
  | 'financials'
  | 'bar'
  | 'admin'

const tabs: readonly NavTab<OrganizerTab>[] = [
  { id: 'horario', label: 'HORÁRIO' },
  { id: 'logistica', label: 'LOGÍSTICA' },
  { id: 'terceiros', label: 'TERCEIROS' },
  { id: 'equipa', label: 'EQUIPA' },
  { id: 'salao', label: 'SALÃO' },
  { id: 'sponsors', label: 'SPONSORS' },
  { id: 'financials', label: 'FINANCEIRO' },
  { id: 'bar', label: 'BAR' },
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
