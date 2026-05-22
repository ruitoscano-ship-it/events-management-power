import { useEffect, useMemo, useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { formatEventDateLong } from '../../lib/eventDate'
import { categoryLabels } from '../../lib/schedule'
import {
  blockFromDraft,
  draftFromBlock,
  draftsEqual,
  type ScheduleRowDraft,
} from '../../lib/scheduleInline'
import { activeVolunteers } from '../../lib/volunteers'
import type { ScheduleBlock, ScheduleCategory } from '../../types'
import { ScheduleTable } from '../shared/ScheduleTable'
import { darkInput } from '../ui/darkForm'
import { VolunteerAssignField } from './VolunteerAssignField'

const categories: ScheduleCategory[] = [
  'setup',
  'logistics',
  'standard',
  'latinas',
  'break',
  'ceremony',
  'activity',
]

const inlineInput = `${darkInput} min-h-11 text-base sm:text-sm`
const inlineSelect = `${inlineInput} cursor-pointer`
const timeInput = `${inlineInput} min-w-[5.5rem] font-mono`

interface RowProps {
  block: ScheduleBlock
  eventDate: string
  volunteers: { id: string; name: string }[]
  onDelete: (block: ScheduleBlock) => void
}

function ScheduleInlineRow({ block, eventDate, volunteers, onDelete }: RowProps) {
  const { data, saveScheduleInline, saving: globalSaving } = useEvent()
  const baseline = useMemo(
    () => draftFromBlock(data, block),
    [data, block],
  )
  const [draft, setDraft] = useState<ScheduleRowDraft>(baseline)
  const [rowSaving, setRowSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(draftFromBlock(data, block))
    setError(null)
  }, [data, block])

  const dirty = !draftsEqual(draft, baseline)

  function patch(partial: Partial<ScheduleRowDraft>) {
    setDraft((d) => ({ ...d, ...partial }))
    setError(null)
  }

  async function handleSave() {
    if (!dirty) return
    setRowSaving(true)
    setError(null)
    const updated = blockFromDraft(block, draft, eventDate)
    const err = await saveScheduleInline(updated, draft.volunteerIds)
    setRowSaving(false)
    if (err) setError(err)
  }

  const busy = rowSaving || globalSaving
  const saveDisabled = !dirty || busy

  const actions = (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        disabled={saveDisabled}
        onClick={() => void handleSave()}
        className="min-h-11 rounded-lg bg-[#ff2d6a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e0265d] disabled:opacity-40"
      >
        {rowSaving ? 'A guardar…' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={() => onDelete(block)}
        className="min-h-11 rounded-lg border border-[#2a2a3d] px-3 py-2 text-sm text-slate-400 hover:border-red-500/50 hover:text-red-300"
      >
        Apagar
      </button>
    </div>
  )

  return (
    <>
      <tr className="border-b border-[#2a2a3d]/60 last:border-0 align-top">
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <input
              type="time"
              value={draft.startTime}
              onChange={(e) => patch({ startTime: e.target.value })}
              className={timeInput}
              aria-label="Hora de início"
            />
            <span className="hidden text-slate-600 sm:inline">–</span>
            <input
              type="time"
              value={draft.endTime}
              onChange={(e) => patch({ endTime: e.target.value })}
              className={timeInput}
              aria-label="Hora de fim"
            />
          </div>
        </td>
        <td className="px-3 py-3">
          <select
            value={draft.category}
            onChange={(e) => patch({ category: e.target.value as ScheduleCategory })}
            className={inlineSelect}
            aria-label="Categoria"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-3 py-3 min-w-[12rem]">
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            className={`${inlineInput} font-medium`}
            placeholder="Título"
            required
          />
          <textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className={`${inlineInput} mt-1.5 resize-y`}
            placeholder="Descrição (opcional)"
          />
        </td>
        <td className="px-3 py-3">
          <input
            value={draft.location}
            onChange={(e) => patch({ location: e.target.value })}
            className={`${inlineInput} uppercase`}
            placeholder="Espaço"
          />
        </td>
        <td className="px-3 py-3 min-w-[10rem]">
          <VolunteerAssignField
            volunteers={volunteers}
            selectedIds={draft.volunteerIds}
            onChange={(volunteerIds) => patch({ volunteerIds })}
          />
        </td>
        <td className="px-3 py-3 w-32">{actions}</td>
      </tr>
      {error && (
        <tr className="border-b border-[#2a2a3d]/60">
          <td colSpan={6} className="px-3 pb-3 text-sm text-red-400">
            {error}
          </td>
        </tr>
      )}
    </>
  )
}

function ScheduleInlineCard({ block, eventDate, volunteers, onDelete }: RowProps) {
  const { data, saveScheduleInline, saving: globalSaving } = useEvent()
  const baseline = useMemo(() => draftFromBlock(data, block), [data, block])
  const [draft, setDraft] = useState<ScheduleRowDraft>(baseline)
  const [rowSaving, setRowSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(draftFromBlock(data, block))
    setError(null)
  }, [data, block])

  const dirty = !draftsEqual(draft, baseline)

  function patch(partial: Partial<ScheduleRowDraft>) {
    setDraft((d) => ({ ...d, ...partial }))
    setError(null)
  }

  async function handleSave() {
    if (!dirty) return
    setRowSaving(true)
    setError(null)
    const updated = blockFromDraft(block, draft, eventDate)
    const err = await saveScheduleInline(updated, draft.volunteerIds)
    setRowSaving(false)
    if (err) setError(err)
  }

  const busy = rowSaving || globalSaving

  return (
    <article
      className={`rounded-xl border bg-[#12121c] p-4 ${
        dirty ? 'border-[#ff2d6a]/40' : 'border-[#2a2a3d]'
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <input
          type="time"
          value={draft.startTime}
          onChange={(e) => patch({ startTime: e.target.value })}
          className={timeInput}
          aria-label="Início"
        />
        <span className="self-center text-slate-500">–</span>
        <input
          type="time"
          value={draft.endTime}
          onChange={(e) => patch({ endTime: e.target.value })}
          className={timeInput}
          aria-label="Fim"
        />
        <select
          value={draft.category}
          onChange={(e) => patch({ category: e.target.value as ScheduleCategory })}
          className={`${inlineSelect} flex-1 min-w-[8rem]`}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      <label className="mt-3 block text-xs font-medium text-slate-500 uppercase tracking-wide">
        Prova / atividade
      </label>
      <input
        value={draft.title}
        onChange={(e) => patch({ title: e.target.value })}
        className={`${inlineInput} mt-1 font-semibold`}
        placeholder="Título"
      />
      <textarea
        value={draft.description}
        onChange={(e) => patch({ description: e.target.value })}
        rows={2}
        className={`${inlineInput} mt-2`}
        placeholder="Descrição"
      />

      <label className="mt-3 block text-xs font-medium text-slate-500 uppercase tracking-wide">
        Espaço
      </label>
      <input
        value={draft.location}
        onChange={(e) => patch({ location: e.target.value })}
        className={`${inlineInput} mt-1 uppercase`}
        placeholder="Local"
      />

      <label className="mt-3 block text-xs font-medium text-slate-500 uppercase tracking-wide">
        Equipa
      </label>
      <div className="mt-1">
        <VolunteerAssignField
          volunteers={volunteers}
          selectedIds={draft.volunteerIds}
          onChange={(volunteerIds) => patch({ volunteerIds })}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={() => void handleSave()}
          className="min-h-11 flex-1 rounded-lg bg-[#ff2d6a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {rowSaving ? 'A guardar…' : 'Guardar bloco'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(block)}
          className="min-h-11 rounded-lg border border-[#2a2a3d] px-4 py-2.5 text-sm text-slate-400"
        >
          Apagar
        </button>
      </div>
    </article>
  )
}

export function ScheduleInlineTable() {
  const { data, deleteSchedule } = useEvent()
  const [editing, setEditing] = useState(false)
  const sorted = useMemo(
    () =>
      [...data.schedule].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [data.schedule],
  )
  const volunteers = useMemo(
    () => activeVolunteers(data.volunteers).map((v) => ({ id: v.id, name: v.name })),
    [data.volunteers],
  )

  async function handleDelete(block: ScheduleBlock) {
    if (!confirm(`Apagar «${block.title}» do horário?`)) return
    await deleteSchedule(block.id)
  }

  const rowProps = { eventDate: data.event.event_date, volunteers, onDelete: handleDelete }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase sm:text-2xl md:text-3xl">
            <span className="text-white">Horário </span>
            <span className="text-[#ff2d6a]">oficial</span>
          </h2>
          <p className="mt-1.5 text-base text-slate-300 capitalize sm:text-sm sm:text-slate-400">
            {formatEventDateLong(data.event.event_date)} — visível para toda a equipa
          </p>
        </div>

        <div
          className="flex shrink-0 rounded-lg border border-[#2a2a3d] bg-[#0a0a12] p-1"
          role="group"
          aria-label="Modo do horário"
        >
          <button
            type="button"
            onClick={() => setEditing(false)}
            className={`min-h-11 rounded-md px-5 text-sm font-semibold transition-colors ${
              !editing
                ? 'bg-[#ff2d6a] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={!editing}
          >
            Ver
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`min-h-11 rounded-md px-5 text-sm font-semibold transition-colors ${
              editing
                ? 'bg-[#ff2d6a] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={editing}
          >
            Editar
          </button>
        </div>
      </div>

      {!editing ? (
        <ScheduleTable showTitle={false} breakpoint="md" />
      ) : (
        <>
      <p className="mb-3 text-sm text-slate-400">
        Edita cada bloco e atribui voluntários. Usa <strong className="font-medium text-slate-300">Guardar</strong> em cada linha para sincronizar com o servidor.
      </p>

      <div className="md:hidden space-y-3">
        {sorted.map((block) => (
          <ScheduleInlineCard key={block.id} block={block} {...rowProps} />
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">Ainda não há blocos no horário.</p>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#2a2a3d] bg-[#12121c]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2a2a3d] text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
              <th className="px-3 py-3 w-36">Hora</th>
              <th className="px-3 py-3 w-32">Categoria</th>
              <th className="px-3 py-3">Prova / atividade</th>
              <th className="px-3 py-3 w-36">Espaço</th>
              <th className="px-3 py-3 w-44">Equipa</th>
              <th className="px-3 py-3 w-36" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((block) => (
              <ScheduleInlineRow key={block.id} block={block} {...rowProps} />
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">Ainda não há blocos no horário.</p>
        )}
      </div>
        </>
      )}
    </div>
  )
}
