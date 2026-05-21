import { EventProvider } from './context/EventContext'
import { RoleProvider, useRole } from './context/RoleContext'
import { OrganizerApp } from './components/organizer/OrganizerApp'
import { VolunteerApp } from './components/volunteer/VolunteerApp'

function AppRouter() {
  const { role } = useRole()
  return role === 'organizer' ? <OrganizerApp /> : <VolunteerApp />
}

function App() {
  return (
    <RoleProvider>
      <EventProvider>
        <AppRouter />
      </EventProvider>
    </RoleProvider>
  )
}

export default App
