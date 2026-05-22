import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { scheduleStats } from '../../lib/schedule'
import { ScheduleForm } from '../forms/ScheduleForm'
import { ActionBar } from '../ui/ActionBar'
import { Modal } from '../ui/Modal'
import { ScheduleInlineTable } from './ScheduleInlineTable'
import { StatCards } from './StatCards'

export function OrganizerSchedulePage() {
  const { data, eventClosed } = useEvent()
  const [addOpen, setAddOpen] = useState(false)
  const stats = scheduleStats(data.schedule, data.event.pairs_count)

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-sm sm:text-slate-400">
          Define o cronograma do dia. Este horário é visível para organizadores e voluntários.
        </p>
        {!eventClosed && (
          <ActionBar
            variant="dark"
            onAdd={() => setAddOpen(true)}
            addLabel="Novo bloco"
          />
        )}
      </div>

      <div className="mb-6">
        <StatCards
          stats={[
            { label: 'PROVAS', value: String(stats.provas), hint: stats.provasHint },
            { label: 'PARES', value: String(stats.pares), hint: 'inscritos' },
            { label: 'INÍCIO', value: stats.inicio, hint: stats.inicioHint || undefined },
            { label: 'FIM', value: stats.fim, hint: stats.fimHint },
          ]}
        />
      </div>

      <ScheduleInlineTable />

      <Modal
        title="Novo bloco no horário"
        open={addOpen}
        onClose={() => setAddOpen(false)}
      >
        <ScheduleForm onDone={() => setAddOpen(false)} />
      </Modal>
    </div>
  )
}
