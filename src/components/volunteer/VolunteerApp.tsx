import { useState } from 'react'
import { useRole } from '../../context/RoleContext'
import { EventHeader } from '../layout/EventHeader'
import { ScheduleTable } from '../shared/ScheduleTable'
import { VolunteerAvailabilityPage } from './VolunteerAvailabilityPage'
import { VolunteerEuTragoPage } from './VolunteerEuTragoPage'
import { VolunteerNav, type VolunteerTab } from './VolunteerNav'
import { VolunteerPicker } from './VolunteerPicker'

export function VolunteerApp() {
  const { volunteerId } = useRole()
  const [tab, setTab] = useState<VolunteerTab>('eu-trago')

  if (!volunteerId) {
    return <VolunteerPicker />
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <VolunteerNav active={tab} onChange={setTab} />
      {tab === 'horario' && (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <ScheduleTable />
        </div>
      )}
      {tab === 'eu-trago' && <VolunteerEuTragoPage />}
      {tab === 'disponibilidade' && <VolunteerAvailabilityPage />}
    </div>
  )
}
