import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { EventHeader } from '../layout/EventHeader'
import { OrganizerLogisticsPage } from './OrganizerLogisticsPage'
import { OrganizerNav, type OrganizerTab } from './OrganizerNav'
import { OrganizerSchedulePage } from './OrganizerSchedulePage'
import { OrganizerTeamPage } from './OrganizerTeamPage'

export function OrganizerApp() {
  const [tab, setTab] = useState<OrganizerTab>('horario')
  const { saving } = useEvent()

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <OrganizerNav active={tab} onChange={setTab} />
      {saving && (
        <p className="text-center text-xs text-[#ff2d6a] py-1">A guardar…</p>
      )}
      {tab === 'horario' && <OrganizerSchedulePage />}
      {tab === 'logistica' && <OrganizerLogisticsPage />}
      {tab === 'equipa' && <OrganizerTeamPage />}
    </div>
  )
}
