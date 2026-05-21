import { useState } from 'react'
import { useRole } from '../../context/RoleContext'
import { useTabDirection } from '../../hooks/useTabDirection'
import { EventHeader } from '../layout/EventHeader'
import { ScheduleTable } from '../shared/ScheduleTable'
import { PageTransition } from '../ui/PageTransition'
import { VolunteerAvailabilityPage } from './VolunteerAvailabilityPage'
import { VolunteerEuTragoPage } from './VolunteerEuTragoPage'
import { VolunteerNav, VOLUNTEER_TAB_ORDER, type VolunteerTab } from './VolunteerNav'
import { VolunteerPicker } from './VolunteerPicker'

export function VolunteerApp() {
  const { volunteerId } = useRole()
  const [tab, setTab] = useState<VolunteerTab>('eu-trago')
  const direction = useTabDirection(tab, VOLUNTEER_TAB_ORDER)

  if (!volunteerId) {
    return (
      <PageTransition pageKey="picker" variant="fade">
        <VolunteerPicker />
      </PageTransition>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <VolunteerNav active={tab} onChange={setTab} />
      <PageTransition pageKey={tab} direction={direction}>
        {tab === 'horario' && (
          <div className="mx-auto max-w-7xl px-4 py-6">
            <ScheduleTable />
          </div>
        )}
        {tab === 'eu-trago' && <VolunteerEuTragoPage />}
        {tab === 'disponibilidade' && <VolunteerAvailabilityPage />}
      </PageTransition>
    </div>
  )
}
