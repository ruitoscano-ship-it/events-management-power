import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTabDirection } from '../../hooks/useTabDirection'
import { EventHeader } from '../layout/EventHeader'
import { ScheduleTable } from '../shared/ScheduleTable'
import { PageTransition } from '../ui/PageTransition'
import { VolunteerAvailabilityPage } from './VolunteerAvailabilityPage'
import { VolunteerEuLevoPage } from './VolunteerEuLevoPage'
import { VolunteerNav, VOLUNTEER_TAB_ORDER, type VolunteerTab } from './VolunteerNav'

export function VolunteerApp() {
  const { volunteerIdInEvent } = useAuth()
  const [tab, setTab] = useState<VolunteerTab>('eu-levo')
  const direction = useTabDirection(tab, VOLUNTEER_TAB_ORDER)

  if (!volunteerIdInEvent) {
    return (
      <div className="min-h-dvh bg-[#0a0a12] flex items-center justify-center p-4">
        <p className="text-sm text-slate-500">A preparar o teu perfil no evento…</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <VolunteerNav active={tab} onChange={setTab} />
      <PageTransition pageKey={tab} direction={direction}>
        {tab === 'horario' && (
          <div className="page-container">
            <ScheduleTable />
          </div>
        )}
        {tab === 'eu-levo' && <VolunteerEuLevoPage />}
        {tab === 'disponibilidade' && <VolunteerAvailabilityPage />}
      </PageTransition>
    </div>
  )
}
