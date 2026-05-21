import { Package } from 'lucide-react'
import { useState } from 'react'
import { useEvent } from '../context/EventContext'
import { contributionStatusLabels, formatTime } from '../lib/format'
import type { Contribution } from '../types'
import { ContributionForm } from './forms/ContributionForm'
import { ActionBar } from './ui/ActionBar'
import { Modal } from './ui/Modal'

export function ContributionsView() {
  const { data, deleteContribution } = useEvent()
  const [selected, setSelected] = useState<Contribution | null>(null)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const byName = Object.fromEntries(data.volunteers.map((v) => [v.id, v.name]))

  async function handleDelete() {
    if (!selected || !confirm('Apagar esta contribuição?')) return
    await deleteContribution(selected.id)
    setSelected(null)
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Quem leva o quê</h2>
          <p className="mt-1 text-sm text-slate-500">Materiais e catering por voluntário.</p>
        </div>
        <ActionBar
          onAdd={() => { setSelected(null); setModal('add') }}
          onEdit={selected ? () => setModal('edit') : undefined}
          onDelete={selected ? handleDelete : undefined}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {data.contributions.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setSelected(c)}
              className={`flex w-full flex-col gap-3 rounded-2xl border p-4 text-left shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${
                selected?.id === c.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{c.item_name}</p>
                  <p className="text-sm text-brand-700">
                    {c.volunteer_id ? byName[c.volunteer_id] ?? '—' : 'Por atribuir'}
                  </p>
                  {c.quantity && <p className="text-sm text-slate-500">{c.quantity}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                {c.needed_by && (
                  <span className="font-mono text-sm text-slate-600">até {formatTime(c.needed_by)}</span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {contributionStatusLabels[c.status]}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Modal title={modal === 'add' ? 'Nova contribuição' : 'Editar contribuição'} open={modal !== null} onClose={() => setModal(null)}>
        <ContributionForm
          initial={modal === 'edit' ? selected ?? undefined : undefined}
          onDone={() => { setModal(null); setSelected(null) }}
        />
      </Modal>
    </section>
  )
}
