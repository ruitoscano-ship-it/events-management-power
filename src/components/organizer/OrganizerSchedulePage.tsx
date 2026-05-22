import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { scheduleStats } from '../../lib/schedule'
import type { ScheduleBlock } from '../../types'
import { ScheduleForm } from '../forms/ScheduleForm'
import { ScheduleTable } from '../shared/ScheduleTable'
import { ActionBar } from '../ui/ActionBar'
import { Modal } from '../ui/Modal'
import { StatCards } from './StatCards'

export function OrganizerSchedulePage() {
  const { data, deleteSchedule } = useEvent()
  const [selected, setSelected] = useState<ScheduleBlock | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const stats = scheduleStats(data.schedule, data.event.pairs_count)

  async function handleDelete() {
    if (!selected || !confirm('Apagar este bloco do horário?')) return
    await deleteSchedule(selected.id)
    setSelected(null)
  }

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <p className="text-sm text-slate-400 max-w-xl">
          Define o cronograma do dia. Este horário é visível para organizadores e voluntários.
        </p>
        <ActionBar
          onAdd={() => { setSelected(null); setModal('add') }}
          addLabel="Novo bloco"
          onEdit={selected ? () => setModal('edit') : undefined}
          onDelete={selected ? handleDelete : undefined}
        />
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

      <p className="mb-3 text-xs text-slate-500">
        <span className="hidden lg:inline">Clica numa linha para editar ou apagar.</span>
        <span className="lg:hidden">Toca num bloco para editar ou apagar.</span>
      </p>
      <ScheduleTable
        showTitle
        selectedId={selected?.id ?? null}
        onSelectBlock={(id) => {
          const block = data.schedule.find((s) => s.id === id)
          setSelected(block ?? null)
        }}
      />

      <Modal
        title={modal === 'add' ? 'Novo bloco no horário' : 'Editar bloco'}
        open={modal !== null}
        onClose={() => setModal(null)}
      >
        <ScheduleForm
          initial={modal === 'edit' ? selected ?? undefined : undefined}
          onDone={() => { setModal(null); setSelected(null) }}
        />
      </Modal>
    </div>
  )
}
