import { AuthProvider, useAuth } from './context/AuthContext'
import { EventProvider } from './context/EventContext'
import { OrganizerApp } from './components/organizer/OrganizerApp'
import { VolunteerApp } from './components/volunteer/VolunteerApp'
import { EntryPage } from './pages/EntryPage'
import { EventPickerPage } from './pages/EventPickerPage'
import { OrganizerLoginPage } from './pages/OrganizerLoginPage'
import { VolunteerAuthPage } from './pages/VolunteerAuthPage'
import { PageTransition } from './components/ui/PageTransition'

function AppRouter() {
  const {
    mode,
    organizerLoggedIn,
    volunteerAccountId,
    activeEventId,
  } = useAuth()

  if (!mode) {
    return (
      <PageTransition pageKey="entry" variant="fade">
        <EntryPage />
      </PageTransition>
    )
  }

  if (mode === 'organizer') {
    if (!organizerLoggedIn) {
      return (
        <PageTransition pageKey="org-login" variant="fade">
          <OrganizerLoginPage />
        </PageTransition>
      )
    }
    if (!activeEventId) {
      return (
        <PageTransition pageKey="org-events" variant="fade">
          <EventPickerPage variant="organizer" />
        </PageTransition>
      )
    }
    return (
      <EventProvider>
        <OrganizerApp />
      </EventProvider>
    )
  }

  if (!volunteerAccountId) {
    return (
      <PageTransition pageKey="vol-auth" variant="fade">
        <VolunteerAuthPage />
      </PageTransition>
    )
  }
  if (!activeEventId) {
    return (
      <PageTransition pageKey="vol-events" variant="fade">
        <EventPickerPage variant="volunteer" />
      </PageTransition>
    )
  }

  return (
    <EventProvider>
      <VolunteerApp />
    </EventProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
