import { useCallback, useEffect, useState } from 'react'
import { loadCatalog, saveCatalog } from '../lib/catalog'
import {
  buildCatalogFromSupabase,
  fetchEventDataFromSupabase,
} from '../lib/supabaseData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { EventCatalog, EventData } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

export function useEventData(eventId: string | null) {
  const [catalog, setCatalog] = useState<EventCatalog | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const useDb = isSupabaseConfigured && !!supabase

  const load = useCallback(async () => {
    if (!eventId) {
      setCatalog(null)
      setState('ready')
      return
    }

    setState('loading')
    setError(null)

    if (useDb) {
      try {
        const eventData = await fetchEventDataFromSupabase(eventId)
        if (!eventData) {
          setError('Evento não encontrado no Supabase.')
          setCatalog({ accounts: [], events: {} })
          setState('ready')
          return
        }

        const { events: shells } = await buildCatalogFromSupabase()
        const cat: EventCatalog = {
          accounts: [],
          events: { ...shells, [eventId]: eventData },
        }
        saveCatalog(cat, 'supabase')
        setCatalog(cat)
        setFetchedAt(new Date().toISOString())
        setState('ready')
        return
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar Supabase'
        setError(msg)
        console.error('[Supabase] load event:', e)
        setCatalog({ accounts: [], events: {} })
        setState('ready')
        return
      }
    }

    const cat = loadCatalog()
    if (!cat.events[eventId]) {
      setError('Evento não encontrado.')
    }
    setCatalog(cat)
    setFetchedAt(null)
    setState('ready')
  }, [eventId, useDb])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!useDb || !eventId) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [useDb, eventId, load])

  const data =
    eventId && catalog && !error ? (catalog.events[eventId] ?? null) : null

  const persist = useCallback(
    (next: EventData) => {
      if (!eventId || !catalog) return
      const updated: EventCatalog = {
        ...catalog,
        events: { ...catalog.events, [eventId]: next },
      }
      setCatalog(updated)
      saveCatalog(updated, useDb ? 'supabase' : 'local')
    },
    [catalog, eventId, useDb],
  )

  return {
    data,
    catalog,
    state,
    error,
    fetchedAt,
    source: useDb ? ('supabase' as const) : ('local' as const),
    reload: load,
    persist,
    isSupabaseConfigured,
    useDb,
  }
}
