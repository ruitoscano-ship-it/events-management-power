import { useEffect, useState } from 'react'
import { EventHeader } from '../layout/EventHeader'
import { VolunteerHomePage } from './VolunteerHomePage'
import { VolunteerNav, type VolunteerTab } from './VolunteerNav'
import {
  VolunteerLogisticsView,
  VolunteerScheduleView,
  VolunteerTeamView,
} from './VolunteerSecondaryViews'
import { useRole } from '../../context/RoleContext'

const DEFAULT_VOLUNTEER = 'v-ma'

export function VolunteerApp() {
  const [tab, setTab] = useState<VolunteerTab>('meu-dia')
  const { volunteerId, setVolunteerId } = useRole()

  useEffect(() => {
    if (!volunteerId) setVolunteerId(DEFAULT_VOLUNTEER)
  }, [volunteerId, setVolunteerId])

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <VolunteerNav active={tab} onChange={setTab} />
      {tab === 'meu-dia' && <VolunteerHomePage />}
      {tab === 'horario' && <VolunteerScheduleView />}
      {tab === 'voluntarios' && <VolunteerTeamView />}
      {tab === 'logistica' && <VolunteerLogisticsView />}
    </div>
  )
}
