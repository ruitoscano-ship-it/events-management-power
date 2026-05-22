import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Lock, LockOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { isEventOngoing } from '../../lib/catalog'
import { isActiveVolunteer } from '../../lib/volunteers'
import { EventSettingsForm } from '../forms/EventSettingsForm'
import { VolunteerForm } from '../forms/VolunteerForm'
import { Modal } from '../ui/Modal'
import { ReopenJustificationModal } from './ReopenJustificationModal'
import type { Volunteer } from '../../types'

export function OrganizerAdminPage() {
  const { data, setVolunteerActive, eventClosed, closeEvent, reopenEvent } = useEvent()
  const [userTab, setUserTab] = useState<'active' | 'inactive'>('active')
  const [editVolunteer, setEditVolunteer] = useState<Volunteer | null>(null)
  const [closing, setClosing] = useState(false)
  const [reopenOpen, setReopenOpen] = useState(false)
  const [reopening, setReopening] = useState(false)

  const canClose = !eventClosed && !isEventOngoing(data.event.event_date)

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

  async function handleClose() {
    if (
      !window.confirm(
        `Encerrar «${data.event.name}»?\n\nO evento fica marcado como passado e apenas disponível para consulta. A edição fica bloqueada até reabrires com justificação no registo de auditoria.`,
      )
    ) {
      return
    }
    setClosing(true)
    const err = await closeEvent()
    setClosing(false)
    if (err) window.alert(err)
  }

  async function handleReopen(justification: string) {
    setReopening(true)
    const err = await reopenEvent(justification)
    setReopening(false)
    if (err) {
      window.alert(err)
      return
    }
    setReopenOpen(false)
  }

  return (
    <div className="page-container space-y-10 sm:space-y-12">
      {eventClosed && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-semibold text-amber-200">Evento encerrado</p>
          <p className="mt-1 text-amber-100/90">
            Modo apenas consulta. Para voltar a editar, reabre o evento abaixo com uma
            justificação registada em auditoria.
          </p>
        </div>
      )}

      <section className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4 sm:p-6">
        <h2 className="text-xl font-bold text-white uppercase">Configuração do evento</h2>
        <p className="mt-1 text-sm text-slate-400 mb-6">
          Nome, data, local e número de pares — visíveis no cabeçalho para toda a equipa.
        </p>
        {eventClosed ? (
          <p className="text-sm text-slate-500">
            Edição bloqueada enquanto o evento estiver encerrado.
          </p>
        ) : (
          <EventSettingsForm />
        )}
      </section>

      {(canClose || eventClosed) && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-white uppercase">
            {eventClosed ? 'Estado do evento' : 'Encerrar evento'}
          </h2>
          {eventClosed ? (
            <>
              <p className="mt-1 text-sm text-slate-400 mb-4">
                Este evento está encerrado. Organizadores podem consultar dados; voluntários
                deixam de o selecionar na lista. Para editar novamente, reabre com
                justificação.
              </p>
              <button
                type="button"
                onClick={() => setReopenOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-emerald-200 hover:bg-emerald-500/25"
              >
                <LockOpen className="h-4 w-4" />
                Reabrir evento
              </button>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-400 mb-4">
                Marca o evento como passado e disponível apenas para consulta. A equipa deixa
                de poder editar; o evento passa para a secção «Encerrados» no ecrã de eventos.
              </p>
              {!canClose && isEventOngoing(data.event.event_date) && (
                <p className="mb-4 text-xs text-amber-300/90">
                  Só podes encerrar depois da data do evento.
                </p>
              )}
              <button
                type="button"
                disabled={closing || !canClose}
                onClick={() => void handleClose()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-amber-200 hover:bg-amber-500/25 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {closing ? 'A encerrar…' : 'Encerrar evento'}
              </button>
            </>
          )}
        </section>
      )}

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
                {!eventClosed && (
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
                )}
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
        {logs.length === 0 ? (
          <p className="rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-6 text-sm text-slate-500">
            Sem entradas ainda.
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
                >
                  <p className="font-mono text-[10px] text-slate-500">
                    {format(parseISO(log.at), 'd MMM yyyy HH:mm', { locale: pt })}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#ff2d6a]">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-300 break-words">{log.summary}</p>
                </li>
              ))}
            </ul>
            <div className="hidden md:block rounded-xl border border-[#2a2a3d] bg-[#12121c] overflow-hidden max-h-[420px] overflow-y-auto">
              <div className="table-scroll overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="sticky top-0 bg-[#1a1a28] text-[10px] uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-4 py-2 whitespace-nowrap">Quando</th>
                      <th className="px-4 py-2">Ação</th>
                      <th className="px-4 py-2">Detalhe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-[#2a2a3d]/60">
                        <td className="px-4 py-2 font-mono text-xs text-slate-400 whitespace-nowrap">
                          {format(parseISO(log.at), 'd MMM HH:mm', { locale: pt })}
                        </td>
                        <td className="px-4 py-2 text-xs text-[#ff2d6a] whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="px-4 py-2 text-slate-300 break-words">{log.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        title="Editar utilizador"
        open={editVolunteer !== null}
        onClose={() => setEditVolunteer(null)}
        contentPadding={false}
      >
        {editVolunteer && (
          <VolunteerForm
            initial={editVolunteer}
            onDone={() => setEditVolunteer(null)}
            onCancel={() => setEditVolunteer(null)}
          />
        )}
      </Modal>

      <ReopenJustificationModal
        open={reopenOpen}
        eventName={data.event.name}
        busy={reopening}
        onClose={() => setReopenOpen(false)}
        onConfirm={handleReopen}
      />
    </div>
  )
}
