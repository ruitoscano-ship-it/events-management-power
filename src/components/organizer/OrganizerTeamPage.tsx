import { useMemo, useState } from 'react'
import { UserPlus, UserX } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
import { activeVolunteers, avatarColor, volunteerInitials } from '../../lib/volunteers'
import { VolunteerForm } from '../forms/VolunteerForm'
import { Modal } from '../ui/Modal'
import type { Volunteer } from '../../types'
import { OrganizerTeamOverview } from './OrganizerTeamOverview'

export function OrganizerTeamPage() {
  const { data, setVolunteerActive } = useEvent()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Volunteer | null>(null)

  const team = useMemo(() => activeVolunteers(data.volunteers), [data.volunteers])

  return (
    <div className="page-container space-y-8 sm:space-y-10">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white uppercase">Gerir voluntários</h2>
            <p className="mt-1.5 text-base leading-relaxed text-slate-300 sm:text-sm sm:text-slate-400">
              Seleciona um voluntário para editar ou inativar. Inativos ficam na tab Admin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSelected(null); setModal('add') }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-3 text-sm font-bold text-white sm:min-h-0 sm:w-auto sm:py-2"
          >
            <UserPlus className="h-4 w-4" />
            Novo voluntário
          </button>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 motion-stagger">
          {team.map((v) => {
            const isSelected = selected?.id === v.id
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : v)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#ff2d6a] bg-[#ff2d6a]/10'
                      : 'border-[#2a2a3d] bg-[#12121c] hover:border-[#ff2d6a]/40'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: avatarColor(v.id) }}
                    >
                      {volunteerInitials(v.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{v.name}</p>
                      {v.role && <p className="text-xs text-[#ff2d6a]">{v.role}</p>}
                    </div>
                  </div>
                </button>
                {isSelected && (
                  <div className="mt-2 flex flex-wrap gap-2 pl-1">
                    <button
                      type="button"
                      onClick={() => setModal('edit')}
                      className="min-h-10 text-xs font-medium text-slate-300 hover:text-white border border-[#2a2a3d] rounded-lg px-3 py-2"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Inativar ${v.name}?`)) {
                          void setVolunteerActive(v.id, false).then(() =>
                            setSelected(null),
                          )
                        }
                      }}
                      className="inline-flex min-h-10 items-center gap-1 text-xs font-medium text-amber-400 border border-amber-500/40 rounded-lg px-3 py-2 hover:bg-amber-500/10"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Inativar
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <OrganizerTeamOverview volunteers={team} />

      <Modal
        title={modal === 'add' ? 'Novo voluntário' : 'Editar voluntário'}
        open={modal !== null}
        onClose={() => setModal(null)}
        contentPadding={false}
      >
        {modal === 'add' && (
          <VolunteerForm
            isNew
            onDone={() => setModal(null)}
            onCancel={() => setModal(null)}
          />
        )}
        {modal === 'edit' && selected && (
          <VolunteerForm
            initial={selected}
            onDone={() => setModal(null)}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}
