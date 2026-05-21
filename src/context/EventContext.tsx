import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { LoadingState } from '../components/LoadingState'
import { saveLocalData } from '../data/demoData'
import { useEventData } from '../hooks/useEventData'
import {
  patchData,
  removeAvailability,
  removeContribution,
  removeSchedule,
  removeTask,
  removeVolunteer,
  syncAvailability,
  syncContribution,
  syncSchedule,
  syncTask,
  syncVolunteer,
} from '../lib/persistence'
import type {
  Contribution,
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
  saveSchedule: (block: ScheduleBlock) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  saveVolunteer: (volunteer: Volunteer) => Promise<void>
  deleteVolunteer: (id: string) => Promise<void>
  saveAvailability: (slot: VolunteerAvailability) => Promise<void>
  deleteAvailability: (id: string) => Promise<void>
  saveContribution: (item: Contribution) => Promise<void>
  deleteContribution: (id: string) => Promise<void>
  saveTask: (task: VolunteerTask) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

const EventContext = createContext<EventContextValue | null>(null)

export function EventProvider({ children }: { children: ReactNode }) {
  const { data, source, persist, isSupabaseConfigured, state } = useEventData()
  const [saving, setSaving] = useState(false)
  const useDb = source === 'supabase'

  const apply = useCallback(
    async (next: EventData, sync?: () => Promise<void>) => {
      if (!data) return
      setSaving(true)
      try {
        if (sync) await sync()
        persist(next)
        if (!useDb) saveLocalData(next)
      } finally {
        setSaving(false)
      }
    },
    [data, persist, useDb],
  )

  const saveSchedule = useCallback(
    async (block: ScheduleBlock) => {
      if (!data) return
      const exists = data.schedule.some((s) => s.id === block.id)
      const schedule = exists
        ? data.schedule.map((s) => (s.id === block.id ? block : s))
        : [...data.schedule, block]
      await apply(patchData(data, { schedule }), () => syncSchedule(block, useDb))
    },
    [apply, data, useDb],
  )

  const deleteSchedule = useCallback(
    async (id: string) => {
      if (!data) return
      const schedule = data.schedule.filter((s) => s.id !== id)
      await apply(patchData(data, { schedule }), () => removeSchedule(id, useDb))
    },
    [apply, data, useDb],
  )

  const saveVolunteer = useCallback(
    async (volunteer: Volunteer) => {
      if (!data) return
      const exists = data.volunteers.some((v) => v.id === volunteer.id)
      const volunteers = exists
        ? data.volunteers.map((v) => (v.id === volunteer.id ? volunteer : v))
        : [...data.volunteers, volunteer]
      await apply(patchData(data, { volunteers }), () =>
        syncVolunteer(volunteer, useDb),
      )
    },
    [apply, data, useDb],
  )

  const deleteVolunteer = useCallback(
    async (id: string) => {
      if (!data) return
      const volunteers = data.volunteers.filter((v) => v.id !== id)
      const availability = data.availability.filter((a) => a.volunteer_id !== id)
      const contributions = data.contributions.map((c) =>
        c.volunteer_id === id ? { ...c, volunteer_id: null } : c,
      )
      const tasks = data.tasks.map((t) =>
        t.volunteer_id === id ? { ...t, volunteer_id: null } : t,
      )
      await apply(
        patchData(data, { volunteers, availability, contributions, tasks }),
        () => removeVolunteer(id, useDb),
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
      await apply(patchData(data, { availability }), () =>
        syncAvailability(slot, useDb),
      )
    },
    [apply, data, useDb],
  )

  const deleteAvailability = useCallback(
    async (id: string) => {
      if (!data) return
      const availability = data.availability.filter((a) => a.id !== id)
      await apply(patchData(data, { availability }), () =>
        removeAvailability(id, useDb),
      )
    },
    [apply, data, useDb],
  )

  const saveContribution = useCallback(
    async (item: Contribution) => {
      if (!data) return
      const exists = data.contributions.some((c) => c.id === item.id)
      const contributions = exists
        ? data.contributions.map((c) => (c.id === item.id ? item : c))
        : [...data.contributions, item]
      await apply(patchData(data, { contributions }), () =>
        syncContribution(item, useDb),
      )
    },
    [apply, data, useDb],
  )

  const deleteContribution = useCallback(
    async (id: string) => {
      if (!data) return
      const contributions = data.contributions.filter((c) => c.id !== id)
      await apply(patchData(data, { contributions }), () =>
        removeContribution(id, useDb),
      )
    },
    [apply, data, useDb],
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
            saveSchedule,
            deleteSchedule,
            saveVolunteer,
            deleteVolunteer,
            saveAvailability,
            deleteAvailability,
            saveContribution,
            deleteContribution,
            saveTask,
            deleteTask,
          }
        : null,
    [
      data,
      source,
      saving,
      isSupabaseConfigured,
      saveSchedule,
      deleteSchedule,
      saveVolunteer,
      deleteVolunteer,
      saveAvailability,
      deleteAvailability,
      saveContribution,
      deleteContribution,
      saveTask,
      deleteTask,
    ],
  )

  if (state === 'loading' || !value) return <LoadingState />

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  )
}

export function useEvent() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvent must be used within EventProvider')
  return ctx
}
