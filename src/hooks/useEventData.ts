import { useCallback, useEffect, useState } from 'react'
import { demoEventData, loadLocalData, saveLocalData } from '../data/demoData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { normalizeEventData } from '../lib/normalize'
import type { EventData } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

export function useEventData() {
  const [data, setData] = useState<EventData | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'supabase' | 'local'>('local')

  const load = useCallback(async () => {
    setState('loading')
    setError(null)

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: events, error: evErr } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false })
          .limit(1)

        if (evErr) throw evErr
        const event = events?.[0]
        if (!event) {
          setData(normalizeEventData(structuredClone(demoEventData)))
          setSource('local')
          setState('ready')
          return
        }

        const eventId = event.id
        const [schedule, volunteers, contributions, tasks] = await Promise.all([
          supabase.from('schedule_blocks').select('*').eq('event_id', eventId).order('starts_at'),
          supabase.from('volunteers').select('*').eq('event_id', eventId).order('name'),
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

        setData(
          normalizeEventData({
            event,
            schedule: schedule.data ?? [],
            volunteers: volunteers.data ?? [],
            availability,
            contributions: contributions.data ?? [],
            tasks: tasks.data ?? [],
          }),
        )
        setSource('supabase')
        setState('ready')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar Supabase')
        setData(loadLocalData())
        setSource('local')
        setState('ready')
      }
      return
    }

    setData(loadLocalData())
    setSource('local')
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const persist = useCallback(
    (next: EventData) => {
      setData(next)
      if (source === 'local' || !isSupabaseConfigured) {
        saveLocalData(next)
      }
    },
    [source],
  )

  return { data, state, error, source, reload: load, persist, isSupabaseConfigured }
}
