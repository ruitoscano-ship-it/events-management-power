import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { useTabDirection } from '../../hooks/useTabDirection'
import { EventHeader } from '../layout/EventHeader'
import { PageTransition } from '../ui/PageTransition'
import { OrganizerLogisticsPage } from './OrganizerLogisticsPage'
import { OrganizerNav, ORGANIZER_TAB_ORDER, type OrganizerTab } from './OrganizerNav'
import { OrganizerSchedulePage } from './OrganizerSchedulePage'
import { OrganizerAdminPage } from './OrganizerAdminPage'
import { OrganizerFinancialsPage } from './OrganizerFinancialsPage'
import { OrganizerSalaoPage } from './OrganizerSalaoPage'
import { OrganizerSponsorsPage } from './OrganizerSponsorsPage'
import { OrganizerTeamPage } from './OrganizerTeamPage'
import { OrganizerThirdPartiesPage } from './OrganizerThirdPartiesPage'

export function OrganizerApp() {
  const [tab, setTab] = useState<OrganizerTab>('horario')
  const { saving, eventClosed } = useEvent()
  const direction = useTabDirection(tab, ORGANIZER_TAB_ORDER)

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <EventHeader />
      {eventClosed && (
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-amber-300/90 bg-amber-500/10 border-b border-amber-500/20 py-2 px-4">
          Evento encerrado — apenas consulta
        </p>
      )}
      <OrganizerNav active={tab} onChange={setTab} />
      {saving && (
        <p className="text-center text-sm text-[#ff2d6a] py-1.5 motion-fade">A guardar…</p>
      )}
      <PageTransition pageKey={tab} direction={direction}>
        {tab === 'horario' && <OrganizerSchedulePage />}
        {tab === 'logistica' && <OrganizerLogisticsPage />}
        {tab === 'terceiros' && <OrganizerThirdPartiesPage />}
        {tab === 'equipa' && <OrganizerTeamPage />}
        {tab === 'salao' && <OrganizerSalaoPage />}
        {tab === 'sponsors' && <OrganizerSponsorsPage />}
        {tab === 'financials' && <OrganizerFinancialsPage />}
        {tab === 'admin' && <OrganizerAdminPage />}
      </PageTransition>
    </div>
  )
}
