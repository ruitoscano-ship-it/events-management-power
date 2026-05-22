import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { appendAuditLog, type AuditInput } from '../lib/audit'
import { LoadingState } from '../components/LoadingState'
import { useAuth } from './AuthContext'
import { useEventData } from '../hooks/useEventData'
import {
  patchData,
  removeAvailability,
  removeContribution,
  removeSchedule,
  removeTask,
  syncAvailability,
  syncTask,
  syncContribution,
  syncEvent,
  syncSchedule,
  syncVolunteer,
} from '../lib/persistence'
import type {
  Contribution,
  Event,
  EventData,
  ScheduleBlock,
  Volunteer,
  VolunteerAvailability,
  VolunteerTask,
} from '../types'

interface EventContextValue {
  data: EventData
  source: 'supabase' | 'local'
  saving: boolean
  isSupabaseConfigured: boolean
  saveEvent: (event: Event) => Promise<void>
  saveSchedule: (block: ScheduleBlock, isNew?: boolean) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  saveVolunteer: (volunteer: Volunteer, isNew?: boolean) => Promise<void>
  setVolunteerActive: (id: string, active: boolean) => Promise<void>
  saveAvailability: (slot: VolunteerAvailability) => Promise<void>
  deleteAvailability: (id: string) => Promise<void>
  saveContribution: (item: Contribution, audit?: AuditInput) => Promise<void>
  deleteContribution: (id: string) => Promise<void>
  markContributionComplete: (id: string) => Promise<void>
  saveTask: (task: VolunteerTask) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

const EventContext = createContext<EventContextValue | null>(null)

export function EventProvider({ children }: { children: ReactNode }) {
  const { activeEventId } = useAuth()
  const { data, source, persist, isSupabaseConfigured, state, error, reload, useDb } =
    useEventData(activeEventId)
  const [saving, setSaving] = useState(false)

  const apply = useCallback(
    async (next: EventData, sync?: () => Promise<void>, audit?: AuditInput) => {
      if (!data) return
      setSaving(true)
      try {
        const payload = audit ? appendAuditLog(next, audit) : next
        if (sync) await sync()
        persist(payload)
      } finally {
        setSaving(false)
      }
    },
    [data, persist],
  )

  const saveEvent = useCallback(
    async (event: Event) => {
      if (!data) return
      await apply(
        patchData(data, { event }),
        () => syncEvent(event, useDb),
        {
          action: 'event.updated',
          summary: `Evento atualizado: ${event.venue}, ${event.event_date}, ${event.pairs_count ?? 0} pares`,
          entity_type: 'event',
          entity_id: event.id,
        },
      )
    },
    [apply, data, useDb],
  )

  const saveSchedule = useCallback(
    async (block: ScheduleBlock, isNew = false) => {
      if (!data) return
      const exists = data.schedule.some((s) => s.id === block.id)
      const schedule = exists
        ? data.schedule.map((s) => (s.id === block.id ? block : s))
        : [...data.schedule, block]
      await apply(
        patchData(data, { schedule }),
        () => syncSchedule(block, useDb),
        {
          action: isNew ? 'schedule.created' : 'schedule.updated',
          summary: `${isNew ? 'Bloco criado' : 'Bloco atualizado'}: ${block.title}`,
          entity_type: 'schedule',
          entity_id: block.id,
        },
      )
    },
    [apply, data, useDb],
  )

  const deleteSchedule = useCallback(
    async (id: string) => {
      if (!data) return
      const block = data.schedule.find((s) => s.id === id)
      const schedule = data.schedule.filter((s) => s.id !== id)
      await apply(
        patchData(data, { schedule }),
        () => removeSchedule(id, useDb),
        {
          action: 'schedule.deleted',
          summary: `Bloco removido: ${block?.title ?? id}`,
          entity_type: 'schedule',
          entity_id: id,
        },
      )
    },
    [apply, data, useDb],
  )

  const saveVolunteer = useCallback(
    async (volunteer: Volunteer, isNew = false) => {
      if (!data) return
      const exists = data.volunteers.some((v) => v.id === volunteer.id)
      const volunteers = exists
        ? data.volunteers.map((v) => (v.id === volunteer.id ? volunteer : v))
        : [...data.volunteers, volunteer]
      await apply(
        patchData(data, { volunteers }),
        () => syncVolunteer(volunteer, useDb),
        {
          action: isNew ? 'volunteer.created' : 'volunteer.updated',
          summary: `${isNew ? 'Voluntário criado' : 'Voluntário atualizado'}: ${volunteer.name}`,
          entity_type: 'volunteer',
          entity_id: volunteer.id,
        },
      )
    },
    [apply, data, useDb],
  )

  const setVolunteerActive = useCallback(
    async (id: string, active: boolean) => {
      if (!data) return
      const v = data.volunteers.find((x) => x.id === id)
      if (!v) return
      const volunteer = { ...v, active }
      const volunteers = data.volunteers.map((x) =>
        x.id === id ? volunteer : x,
      )
      await apply(
        patchData(data, { volunteers }),
        () => syncVolunteer(volunteer, useDb),
        {
          action: active ? 'volunteer.reactivated' : 'volunteer.deactivated',
          summary: `${active ? 'Reativado' : 'Inativado'}: ${volunteer.name}`,
          entity_type: 'volunteer',
          entity_id: id,
        },
      )
    },
    [apply, data, useDb],
  )

  const saveAvailability = useCallback(
    async (slot: VolunteerAvailability) => {
      if (!data) return
      const exists = data.availability.some((a) => a.id === slot.id)
      const availability = exists
        ? data.availability.map((a) => (a.id === slot.id ? slot : a))
        : [...data.availability, slot]
      const vol = data.volunteers.find((v) => v.id === slot.volunteer_id)
      await apply(
        patchData(data, { availability }),
        () => syncAvailability(slot, useDb),
        {
          action: 'availability.created',
          summary: `Disponibilidade: ${vol?.name ?? 'voluntário'}`,
          entity_type: 'availability',
          entity_id: slot.id,
        },
      )
    },
    [apply, data, useDb],
  )

  const deleteAvailability = useCallback(
    async (id: string) => {
      if (!data) return
      const availability = data.availability.filter((a) => a.id !== id)
      await apply(
        patchData(data, { availability }),
        () => removeAvailability(id, useDb),
        {
          action: 'availability.deleted',
          summary: 'Disponibilidade removida',
          entity_type: 'availability',
          entity_id: id,
        },
      )
    },
    [apply, data, useDb],
  )

  const saveContribution = useCallback(
    async (item: Contribution, audit?: AuditInput) => {
      if (!data) return
      const exists = data.contributions.some((c) => c.id === item.id)
      const contributions = exists
        ? data.contributions.map((c) => (c.id === item.id ? item : c))
        : [...data.contributions, item]
      await apply(
        patchData(data, { contributions }),
        () => syncContribution(item, useDb),
        audit ?? {
          action: exists ? 'contribution.updated' : 'contribution.created',
          summary: `${exists ? 'Logística atualizada' : 'Necessidade criada'}: ${item.item_name}`,
          entity_type: 'contribution',
          entity_id: item.id,
        },
      )
    },
    [apply, data, useDb],
  )

  const deleteContribution = useCallback(
    async (id: string) => {
      if (!data) return
      const item = data.contributions.find((c) => c.id === id)
      const contributions = data.contributions.filter((c) => c.id !== id)
      await apply(
        patchData(data, { contributions }),
        () => removeContribution(id, useDb),
        {
          action: 'contribution.deleted',
          summary: `Necessidade removida: ${item?.item_name ?? id}`,
          entity_type: 'contribution',
          entity_id: id,
        },
      )
    },
    [apply, data, useDb],
  )

  const markContributionComplete = useCallback(
    async (id: string) => {
      if (!data) return
      const item = data.contributions.find((c) => c.id === id)
      if (!item) return
      await saveContribution(
        { ...item, status: 'delivered' },
        {
          action: 'contribution.completed',
          summary: `Concluído: ${item.item_name}`,
          entity_type: 'contribution',
          entity_id: id,
        },
      )
    },
    [saveContribution, data],
  )

  const saveTask = useCallback(
    async (task: VolunteerTask) => {
      if (!data) return
      const exists = data.tasks.some((t) => t.id === task.id)
      const tasks = exists
        ? data.tasks.map((t) => (t.id === task.id ? task : t))
        : [...data.tasks, task]
      await apply(patchData(data, { tasks }), () => syncTask(task, useDb))
    },
    [apply, data, useDb],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      if (!data) return
      const tasks = data.tasks.filter((t) => t.id !== id)
      await apply(patchData(data, { tasks }), () => removeTask(id, useDb))
    },
    [apply, data, useDb],
  )

  const value = useMemo(
    () =>
      data
        ? {
            data,
            source,
            saving,
            isSupabaseConfigured,
            saveEvent,
            saveSchedule,
            deleteSchedule,
            saveVolunteer,
            setVolunteerActive,
            saveAvailability,
            deleteAvailability,
            saveContribution,
            deleteContribution,
            markContributionComplete,
            saveTask,
            deleteTask,
          }
        : null,
    [
      data,
      source,
      saving,
      isSupabaseConfigured,
      saveEvent,
      saveSchedule,
      deleteSchedule,
      saveVolunteer,
      setVolunteerActive,
      saveAvailability,
      deleteAvailability,
      saveContribution,
      deleteContribution,
      markContributionComplete,
      saveTask,
      deleteTask,
    ],
  )

  if (state === 'loading' || !value) {
    return <LoadingState message={state === 'loading' ? 'A carregar evento…' : undefined} />
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="rounded-lg bg-[#ff2d6a] px-4 py-2 text-sm font-medium text-white"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  )
}

export function useEvent() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvent must be used within EventProvider')
  return ctx
}
