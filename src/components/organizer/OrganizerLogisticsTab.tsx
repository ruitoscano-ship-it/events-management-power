import { ContributionsView } from '../ContributionsView'
import { TasksView } from '../TasksView'

export function OrganizerLogisticsTab() {
  return (
    <div className="organizer-panel mx-auto max-w-7xl px-4 py-6 space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-bold text-white uppercase">Quem leva o quê</h2>
        <ContributionsView />
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold text-white uppercase">Atividades</h2>
        <TasksView />
      </section>
    </div>
  )
}
