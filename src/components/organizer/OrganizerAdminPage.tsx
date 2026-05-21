import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { isActiveVolunteer } from '../../lib/volunteers'
import { EventSettingsForm } from '../forms/EventSettingsForm'
import { VolunteerForm } from '../forms/VolunteerForm'
import { Modal } from '../ui/Modal'
import type { Volunteer } from '../../types'

export function OrganizerAdminPage() {
  const { data, setVolunteerActive } = useEvent()
  const [userTab, setUserTab] = useState<'active' | 'inactive'>('active')
  const [editVolunteer, setEditVolunteer] = useState<Volunteer | null>(null)

  const active = useMemo(
    () => data.volunteers.filter(isActiveVolunteer),
    [data.volunteers],
  )
  const inactive = useMemo(
    () => data.volunteers.filter((v) => !isActiveVolunteer(v)),
    [data.volunteers],
  )
  const list = userTab === 'active' ? active : inactive

  const logs = useMemo(
    () =>
      [...(data.auditLog ?? [])].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    [data.auditLog],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-12">
      <section className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-6">
        <h2 className="text-xl font-bold text-white uppercase">Configuração do evento</h2>
        <p className="mt-1 text-sm text-slate-400 mb-6">
          Data, local e número de pares — visíveis no cabeçalho para toda a equipa.
        </p>
        <EventSettingsForm />
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-4">Utilizadores</h2>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUserTab('active')}
            className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wide ${
              userTab === 'active'
                ? 'bg-[#ff2d6a] text-white'
                : 'bg-[#1a1a28] text-slate-400'
            }`}
          >
            Ativos ({active.length})
          </button>
          <button
            type="button"
            onClick={() => setUserTab('inactive')}
            className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wide ${
              userTab === 'inactive'
                ? 'bg-[#ff2d6a] text-white'
                : 'bg-[#1a1a28] text-slate-400'
            }`}
          >
            Inativos ({inactive.length})
          </button>
        </div>
        <ul className="space-y-2">
          {list.length === 0 ? (
            <li className="text-sm text-slate-500 p-4 border border-[#2a2a3d] rounded-xl">
              Nenhum utilizador nesta lista.
            </li>
          ) : (
            list.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{v.name}</p>
                  <p className="text-xs text-slate-500">
                    {v.role ?? '—'} · {v.email ?? 'sem email'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditVolunteer(v)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded border border-[#2a2a3d]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setVolunteerActive(v.id, !isActiveVolunteer(v))}
                    className={`text-xs px-2 py-1 rounded border ${
                      isActiveVolunteer(v)
                        ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                        : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {isActiveVolunteer(v) ? 'Inativar' : 'Reativar'}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white uppercase mb-2">Registo de auditoria</h2>
        <p className="text-sm text-slate-400 mb-4">
          Histórico de alterações no evento, voluntários e logística.
        </p>
        <div className="rounded-xl border border-[#2a2a3d] bg-[#12121c] overflow-hidden max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#1a1a28] text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-2">Quando</th>
                <th className="px-4 py-2">Ação</th>
                <th className="px-4 py-2">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-slate-500">
                    Sem entradas ainda.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-[#2a2a3d]/60">
                    <td className="px-4 py-2 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {format(parseISO(log.at), 'd MMM HH:mm', { locale: pt })}
                    </td>
                    <td className="px-4 py-2 text-xs text-[#ff2d6a]">{log.action}</td>
                    <td className="px-4 py-2 text-slate-300">{log.summary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title="Editar utilizador"
        open={editVolunteer !== null}
        onClose={() => setEditVolunteer(null)}
      >
        {editVolunteer && (
          <VolunteerForm
            initial={editVolunteer}
            onDone={() => setEditVolunteer(null)}
          />
        )}
      </Modal>
    </div>
  )
}
