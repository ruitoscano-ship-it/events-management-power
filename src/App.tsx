import { EventProvider } from './context/EventContext'
import { RoleProvider, useRole } from './context/RoleContext'
import { OrganizerApp } from './components/organizer/OrganizerApp'
import { VolunteerApp } from './components/volunteer/VolunteerApp'
import { PageTransition } from './components/ui/PageTransition'

function AppRouter() {
  const { role } = useRole()
  return (
    <PageTransition pageKey={role} variant="role">
      {role === 'organizer' ? <OrganizerApp /> : <VolunteerApp />}
    </PageTransition>
  )
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
