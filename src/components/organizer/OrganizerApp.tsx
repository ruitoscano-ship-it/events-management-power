import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { useTabDirection } from '../../hooks/useTabDirection'
import { EventHeader } from '../layout/EventHeader'
import { PageTransition } from '../ui/PageTransition'
import { OrganizerLogisticsPage } from './OrganizerLogisticsPage'
import { OrganizerNav, ORGANIZER_TAB_ORDER, type OrganizerTab } from './OrganizerNav'
import { OrganizerSchedulePage } from './OrganizerSchedulePage'
import { OrganizerAdminPage } from './OrganizerAdminPage'
import { OrganizerTeamPage } from './OrganizerTeamPage'

export function OrganizerApp() {
  const [tab, setTab] = useState<OrganizerTab>('horario')
  const { saving } = useEvent()
  const direction = useTabDirection(tab, ORGANIZER_TAB_ORDER)

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      <OrganizerNav active={tab} onChange={setTab} />
      {saving && (
        <p className="text-center text-xs text-[#ff2d6a] py-1 motion-fade">A guardar…</p>
      )}
      <PageTransition pageKey={tab} direction={direction}>
        {tab === 'horario' && <OrganizerSchedulePage />}
        {tab === 'logistica' && <OrganizerLogisticsPage />}
        {tab === 'equipa' && <OrganizerTeamPage />}
        {tab === 'admin' && <OrganizerAdminPage />}
      </PageTransition>
    </div>
  )
}
