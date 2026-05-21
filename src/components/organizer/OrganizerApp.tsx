import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { OrganizerHeader } from './OrganizerHeader'
import { OrganizerLogisticsTab } from './OrganizerLogisticsTab'
import { OrganizerNav, type OrganizerTab } from './OrganizerNav'
import { OrganizerVolunteersTab } from './OrganizerVolunteersTab'
import { ScheduleHomePage } from './ScheduleHomePage'

export function OrganizerApp() {
  const [tab, setTab] = useState<OrganizerTab>('horario')
  const { saving } = useEvent()

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <OrganizerHeader />
      <OrganizerNav active={tab} onChange={setTab} />
      {saving && (
        <p className="text-center text-xs text-[#ff2d6a] py-1">A guardar…</p>
      )}
      {tab === 'horario' && <ScheduleHomePage />}
      {tab === 'voluntarios' && <OrganizerVolunteersTab />}
      {tab === 'logistica' && <OrganizerLogisticsTab />}
    </div>
  )
}
