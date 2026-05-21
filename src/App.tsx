import { useState } from 'react'
import { ContributionsView } from './components/ContributionsView'
import { GridView } from './components/GridView'
import { Header } from './components/Header'
import { Layout, type TabId } from './components/Layout'
import { TasksView } from './components/TasksView'
import { TimelineView } from './components/TimelineView'
import { VolunteersView } from './components/VolunteersView'
import { EventProvider, useEvent } from './context/EventContext'

function AppContent() {
  const [tab, setTab] = useState<TabId>('timeline')
  const { data, source, isSupabaseConfigured, saving } = useEvent()

  return (
    <Layout activeTab={tab} onTabChange={setTab} saving={saving}>
      <Header event={data.event} source={source} isSupabaseConfigured={isSupabaseConfigured} />
      {tab === 'timeline' && <TimelineView />}
      {tab === 'grid' && <GridView />}
      {tab === 'volunteers' && <VolunteersView />}
      {tab === 'contributions' && <ContributionsView />}
      {tab === 'tasks' && <TasksView />}
    </Layout>
  )
}

function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  )
}

export default App
