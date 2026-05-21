import { CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'
import { useEvent } from '../context/EventContext'
import { formatTimeRange, taskStatusLabels } from '../lib/format'
import type { VolunteerTask } from '../types'
import { TaskForm } from './forms/TaskForm'
import { ActionBar } from './ui/ActionBar'
import { Modal } from './ui/Modal'

export function TasksView() {
  const { data, deleteTask } = useEvent()
  const [selected, setSelected] = useState<VolunteerTask | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const byName = Object.fromEntries(data.volunteers.map((v) => [v.id, v.name]))

  const sorted = [...data.tasks].sort((a, b) => {
    const ta = a.starts_at ? new Date(a.starts_at).getTime() : 0
    const tb = b.starts_at ? new Date(b.starts_at).getTime() : 0
    return ta - tb
  })

  async function handleDelete() {
    if (!selected || !confirm('Apagar esta atividade?')) return
    await deleteTask(selected.id)
    setSelected(null)
  }

  const statusIcon = { assigned: Circle, in_progress: Circle, done: CheckCircle2 }
  const statusColor = { assigned: 'text-slate-400', in_progress: 'text-amber-500', done: 'text-emerald-500' }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Atividades dos voluntários</h2>
          <p className="mt-1 text-sm text-slate-500">Tarefas ligadas ao cronograma.</p>
        </div>
        <ActionBar
          onAdd={() => { setSelected(null); setModal('add') }}
          onEdit={selected ? () => setModal('edit') : undefined}
          onDelete={selected ? handleDelete : undefined}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {sorted.map((t) => {
          const Icon = statusIcon[t.status]
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelected(t)}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                  selected?.id === t.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex gap-3">
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${statusColor[t.status]}`} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{t.title}</h3>
                    <p className="text-sm text-brand-700">
                      {t.volunteer_id ? byName[t.volunteer_id] : 'Por atribuir'}
                    </p>
                    {t.starts_at && t.ends_at && (
                      <p className="mt-1 font-mono text-sm text-slate-600">
                        {formatTimeRange(t.starts_at, t.ends_at)}
                      </p>
                    )}
                    {t.notes && <p className="mt-2 text-sm text-slate-500">{t.notes}</p>}
                    <span className="mt-2 inline-block text-xs text-slate-400">
                      {taskStatusLabels[t.status]}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <Modal title={modal === 'add' ? 'Nova atividade' : 'Editar atividade'} open={modal !== null} onClose={() => setModal(null)}>
        <TaskForm
          initial={modal === 'edit' ? selected ?? undefined : undefined}
          onDone={() => { setModal(null); setSelected(null) }}
        />
      </Modal>
    </section>
  )
}
