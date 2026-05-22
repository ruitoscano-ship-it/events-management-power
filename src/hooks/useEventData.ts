import { useCallback, useEffect, useState } from 'react'
import { loadCatalog, saveCatalog } from '../lib/catalog'
import { fetchEventDataFromSupabase } from '../lib/supabaseData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { EventCatalog, EventData } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

export function useEventData(eventId: string | null) {
  const [catalog, setCatalog] = useState<EventCatalog | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const useDb = isSupabaseConfigured && !!supabase

  const load = useCallback(async () => {
    if (!eventId) {
      setCatalog(null)
      setState('ready')
      return
    }

    setState('loading')
    setError(null)

    let cat = loadCatalog()

    if (useDb) {
      try {
        const eventData = await fetchEventDataFromSupabase(eventId)
        if (eventData) {
          cat = {
            ...cat,
            events: { ...cat.events, [eventId]: eventData },
          }
          saveCatalog(cat)
        } else {
          setError('Evento não encontrado no Supabase.')
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar Supabase'
        setError(msg)
        console.error('[Supabase] load event:', e)
      }
    }

    if (!cat.events[eventId]) {
      cat = loadCatalog()
    }

    setCatalog(cat)
    setState('ready')
  }, [eventId, useDb])

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
      saveCatalog(updated)
    },
    [catalog, eventId],
  )

  return {
    data,
    catalog,
    state,
    error,
    source: useDb ? ('supabase' as const) : ('local' as const),
    reload: load,
    persist,
    isSupabaseConfigured,
    useDb,
  }
}
