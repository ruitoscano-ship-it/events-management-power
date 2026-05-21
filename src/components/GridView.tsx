import { parseISO } from 'date-fns'
import { useMemo } from 'react'
import { useEvent } from '../context/EventContext'
import { formatTime } from '../lib/format'

const HOUR_START = 6
const HOUR_END = 21

function hourLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

function minutesFromMidnight(iso: string): number {
  const d = parseISO(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function pctInDay(minutes: number): number {
  const start = HOUR_START * 60
  const end = (HOUR_END + 1) * 60
  const span = end - start
  return Math.max(0, Math.min(100, ((minutes - start) / span) * 100))
}

function barStyle(from: string, until: string, color: string) {
  const left = pctInDay(minutesFromMidnight(from))
  const right = pctInDay(minutesFromMidnight(until))
  const width = Math.max(2, right - left)
  return { left: `${left}%`, width: `${width}%`, backgroundColor: color }
}

export function GridView() {
  const { data } = useEvent()
  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i),
    [],
  )

  const availByVolunteer = useMemo(() => {
    const map: Record<string, typeof data.availability> = {}
    for (const a of data.availability) {
      ;(map[a.volunteer_id] ??= []).push(a)
    }
    return map
  }, [data.availability])

  const tasksByVolunteer = useMemo(() => {
    const map: Record<string, typeof data.tasks> = {}
    for (const t of data.tasks) {
      if (!t.volunteer_id || !t.starts_at || !t.ends_at) continue
      ;(map[t.volunteer_id] ??= []).push(t)
    }
    return map
  }, [data.tasks])

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Grelha horária</h2>
      <p className="mt-1 text-sm text-slate-500">
        Disponibilidade (azul) e atividades (violeta) por voluntário — {HOUR_START}:00 a {HOUR_END}:00.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-brand-400" /> Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-violet-400" /> Atividade
        </span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="min-w-[640px]">
          <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: '120px 1fr' }}>
            <div className="p-2 text-xs font-medium text-slate-400" />
            <div className="relative flex border-l border-slate-100">
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex-1 border-l border-slate-50 px-0.5 py-2 text-center text-[10px] font-mono text-slate-400 first:border-l-0"
                >
                  {hourLabel(h)}
                </div>
              ))}
            </div>
          </div>

          {data.volunteers.map((v) => {
            const slots = availByVolunteer[v.id] ?? []
            const tasks = tasksByVolunteer[v.id] ?? []
            return (
              <div
                key={v.id}
                className="grid border-b border-slate-50 last:border-b-0"
                style={{ gridTemplateColumns: '120px 1fr' }}
              >
                <div className="flex flex-col justify-center p-2">
                  <span className="text-sm font-medium text-slate-800 leading-tight">{v.name}</span>
                  {v.role && (
                    <span className="text-[10px] text-slate-400">{v.role}</span>
                  )}
                </div>
                <div className="relative h-14 border-l border-slate-100">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l border-slate-50"
                      style={{ left: `${pctInDay(h * 60)}%` }}
                    />
                  ))}
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      className="absolute top-2 h-4 rounded opacity-90"
                      style={barStyle(s.available_from, s.available_until, '#60a5fa')}
                      title={`Disponível ${formatTime(s.available_from)} – ${formatTime(s.available_until)}`}
                    />
                  ))}
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="absolute bottom-2 h-4 rounded opacity-90"
                      style={barStyle(t.starts_at!, t.ends_at!, '#a78bfa')}
                      title={`${t.title}: ${formatTime(t.starts_at!)} – ${formatTime(t.ends_at!)}`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
