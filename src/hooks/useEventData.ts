import { useCallback, useEffect, useState } from 'react'
import { loadCatalog, saveCatalog } from '../lib/catalog'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { normalizeEventData } from '../lib/normalize'
import type { EventCatalog, EventData } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

export function useEventData(eventId: string | null) {
  const [catalog, setCatalog] = useState<EventCatalog | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'supabase' | 'local'>('local')

  const load = useCallback(async () => {
    if (!eventId) {
      setCatalog(null)
      setState('ready')
      return
    }

    setState('loading')
    setError(null)

    let cat = loadCatalog()

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: event, error: evErr } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle()

        if (evErr) throw evErr
        if (event) {
          const [schedule, volunteers, contributions, tasks] = await Promise.all([
            supabase
              .from('schedule_blocks')
              .select('*')
              .eq('event_id', eventId)
              .order('starts_at'),
            supabase
              .from('volunteers')
              .select('*')
              .eq('event_id', eventId)
              .order('name'),
            supabase.from('contributions').select('*').eq('event_id', eventId),
            supabase.from('volunteer_tasks').select('*').eq('event_id', eventId),
          ])

          const volunteerIds = (volunteers.data ?? []).map((v) => v.id)
          let availability: EventData['availability'] = []
          if (volunteerIds.length > 0) {
            const { data: avail } = await supabase
              .from('volunteer_availability')
              .select('*')
              .in('volunteer_id', volunteerIds)
            availability = avail ?? []
          }

          const eventData = normalizeEventData({
            event,
            schedule: schedule.data ?? [],
            volunteers: volunteers.data ?? [],
            availability,
            contributions: contributions.data ?? [],
            tasks: tasks.data ?? [],
            auditLog: cat.events[eventId]?.auditLog ?? [],
          })

          cat = {
            ...cat,
            events: { ...cat.events, [eventId]: eventData },
          }
          saveCatalog(cat)
          setSource('supabase')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar Supabase')
        setSource('local')
      }
    }

    setCatalog(cat)
    setState('ready')
  }, [eventId])

  useEffect(() => {
    load()
  }, [load])

  const data =
    eventId && catalog ? (catalog.events[eventId] ?? null) : null

  const persist = useCallback(
    (next: EventData) => {
      if (!eventId || !catalog) return
      const updated: EventCatalog = {
        ...catalog,
        events: { ...catalog.events, [eventId]: next },
      }
      setCatalog(updated)
      if (source === 'local' || !isSupabaseConfigured) {
        saveCatalog(updated)
      }
    },
    [catalog, eventId, source],
  )

  return {
    data,
    catalog,
    state,
    error,
    source,
    reload: load,
    persist,
    isSupabaseConfigured,
  }
}
