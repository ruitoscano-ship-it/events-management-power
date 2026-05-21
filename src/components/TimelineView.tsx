import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useEvent } from '../context/EventContext'
import { blockTypeColors, blockTypeLabels, formatTimeRange } from '../lib/format'
import type { ScheduleBlock } from '../types'
import { ScheduleForm } from './forms/ScheduleForm'
import { ActionBar } from './ui/ActionBar'
import { Modal } from './ui/Modal'

export function TimelineView() {
  const { data, deleteSchedule } = useEvent()
  const [selected, setSelected] = useState<ScheduleBlock | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)

  const sorted = [...data.schedule].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  )

  async function handleDelete() {
    if (!selected || !confirm('Apagar este bloco do cronograma?')) return
    await deleteSchedule(selected.id)
    setSelected(null)
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cronograma do dia</h2>
          <p className="mt-1 text-sm text-slate-500">
            Provas, pausas e cerimónias — toca num bloco para editar.
          </p>
        </div>
        <ActionBar
          onAdd={() => { setSelected(null); setModal('add') }}
          onEdit={selected ? () => setModal('edit') : undefined}
          onDelete={selected ? handleDelete : undefined}
        />
      </div>

      <ol className="mt-6 relative space-y-0">
        {sorted.map((block, i) => (
          <li key={block.id} className="relative flex gap-4 pb-8 last:pb-0">
            {i < sorted.length - 1 && (
              <span className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200" aria-hidden />
            )}
            <span
              className={`relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-white shadow-sm ${
                block.block_type === 'competition' ? 'bg-violet-500'
                  : block.block_type === 'break' ? 'bg-amber-400'
                  : block.block_type === 'ceremony' ? 'bg-rose-500' : 'bg-brand-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setSelected(block)}
              className={`min-w-0 flex-1 rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                selected?.id === block.id
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-brand-700">
                  {formatTimeRange(block.starts_at, block.ends_at)}
                </span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${blockTypeColors[block.block_type]}`}>
                  {blockTypeLabels[block.block_type]}
                </span>
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">{block.title}</h3>
              {block.description && <p className="mt-1 text-sm text-slate-600">{block.description}</p>}
              {block.location && (
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {block.location}
                </p>
              )}
            </button>
          </li>
        ))}
      </ol>

      <Modal title={modal === 'add' ? 'Novo bloco' : 'Editar bloco'} open={modal !== null} onClose={() => setModal(null)}>
        <ScheduleForm
          initial={modal === 'edit' ? selected ?? undefined : undefined}
          onDone={() => { setModal(null); setSelected(null) }}
        />
      </Modal>
    </section>
  )
}
