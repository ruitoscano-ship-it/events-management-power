import { CheckCircle2, Clock, Package } from 'lucide-react'
import { useMemo } from 'react'
import { useEvent } from '../../context/EventContext'
import { useRole } from '../../context/RoleContext'
import { contributionStatusLabels, formatTime, formatTimeRange } from '../../lib/format'
import { avatarColor, volunteerById, volunteerInitials } from '../../lib/volunteers'
import { OrganizerHeader } from '../organizer/OrganizerHeader'

export function VolunteerApp() {
  const { data } = useEvent()
  const { volunteerId, setVolunteerId } = useRole()

  const volunteer = volunteerId ? volunteerById(data.volunteers, volunteerId) : null

  const myTasks = useMemo(
    () => data.tasks.filter((t) => t.volunteer_id === volunteerId),
    [data.tasks, volunteerId],
  )
  const myContributions = useMemo(
    () => data.contributions.filter((c) => c.volunteer_id === volunteerId),
    [data.contributions, volunteerId],
  )
  const myAvailability = useMemo(
    () => data.availability.filter((a) => a.volunteer_id === volunteerId),
    [data.availability, volunteerId],
  )

  if (!volunteerId || !volunteer) {
    return (
      <div className="min-h-dvh bg-[#0a0a12]">
        <OrganizerHeader />
        <div className="mx-auto max-w-lg px-4 py-12">
          <h2 className="text-2xl font-bold text-white">Olá! Quem és?</h2>
          <p className="mt-2 text-slate-400 text-sm">
            Seleciona o teu nome para veres o teu horário, tarefas e o que deves trazer.
          </p>
          <ul className="mt-8 grid gap-2">
            {data.volunteers.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setVolunteerId(v.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-4 py-3 text-left hover:border-[#ff2d6a]/50"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: avatarColor(v.id) }}
                  >
                    {volunteerInitials(v.name)}
                  </span>
                  <div>
                    <p className="font-medium text-white">{v.name}</p>
                    {v.role && <p className="text-xs text-slate-400">{v.role}</p>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <OrganizerHeader />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: avatarColor(volunteer.id) }}
          >
            {volunteerInitials(volunteer.name)}
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">{volunteer.name}</h2>
            {volunteer.role && (
              <p className="text-sm text-[#ff2d6a]">{volunteer.role}</p>
            )}
            <button
              type="button"
              onClick={() => setVolunteerId(null)}
              className="mt-1 text-xs text-slate-500 hover:text-white"
            >
              Trocar perfil
            </button>
          </div>
        </div>

        <section className="mb-8">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-400 uppercase mb-3">
            <Clock className="h-4 w-4" /> Disponibilidade
          </h3>
          {myAvailability.length === 0 ? (
            <p className="text-sm text-slate-500">Sem janelas registadas.</p>
          ) : (
            <ul className="space-y-2">
              {myAvailability.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-[#2a2a3d] bg-[#12121c] px-4 py-3 font-mono text-sm text-white"
                >
                  {formatTimeRange(a.available_from, a.available_until)}
                  {a.notes && <span className="block text-xs text-slate-500 font-sans mt-1">{a.notes}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-8">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-400 uppercase mb-3">
            <CheckCircle2 className="h-4 w-4" /> As minhas atividades
          </h3>
          {myTasks.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma atividade atribuída.</p>
          ) : (
            <ul className="space-y-3">
              {myTasks.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
                >
                  <p className="font-medium text-white">{t.title}</p>
                  {t.starts_at && t.ends_at && (
                    <p className="mt-1 font-mono text-sm text-slate-400">
                      {formatTimeRange(t.starts_at, t.ends_at)}
                    </p>
                  )}
                  <span className="mt-2 inline-block text-xs text-[#ff2d6a]">{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-400 uppercase mb-3">
            <Package className="h-4 w-4" /> O que levo
          </h3>
          {myContributions.length === 0 ? (
            <p className="text-sm text-slate-500">Nada atribuído por agora.</p>
          ) : (
            <ul className="space-y-3">
              {myContributions.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4"
                >
                  <p className="font-medium text-white">{c.item_name}</p>
                  {c.quantity && <p className="text-sm text-slate-400">{c.quantity}</p>}
                  {c.needed_by && (
                    <p className="mt-1 text-xs text-slate-500">
                      Entregar até {formatTime(c.needed_by)}
                    </p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-[#ff2d6a]/20 px-2 py-0.5 text-xs text-[#ff2d6a]">
                    {contributionStatusLabels[c.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
