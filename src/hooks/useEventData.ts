import { useCallback, useEffect, useRef, useState } from 'react'
import { EMPTY_CATALOG, saveCatalog } from '../lib/catalog'
import { normalizeEventData } from '../lib/normalize'
import {
  buildCatalogFromSupabase,
  fetchEventDataFromSupabase,
} from '../lib/supabaseData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { EventCatalog, EventData } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

const EDIT_GUARD_MS = 10_000

function mergeCatalogFromServer(
  prev: EventCatalog | null,
  eventId: string,
  eventData: EventData,
  shells: Record<string, EventData>,
  keepLocalActive: boolean,
): EventCatalog {
  const base = prev ?? EMPTY_CATALOG
  const merged: Record<string, EventData> = { ...base.events }

  for (const [id, shell] of Object.entries(shells)) {
    if (id === eventId && keepLocalActive && merged[eventId]) {
      continue
    }
    if (id === eventId) {
      merged[eventId] = eventData
      continue
    }
    merged[id] = merged[id]
      ? normalizeEventData({ ...merged[id], event: shell.event })
      : shell
  }

  if (!merged[eventId]) {
    merged[eventId] = eventData
  } else if (!keepLocalActive) {
    merged[eventId] = eventData
  }

  return { accounts: [], events: merged }
}

export function useEventData(eventId: string | null) {
  const [catalog, setCatalog] = useState<EventCatalog | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const lastLocalEditRef = useRef(0)
  const useDb = isSupabaseConfigured && !!supabase

  const markLocalEdit = useCallback(() => {
    lastLocalEditRef.current = Date.now()
  }, [])

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
          setCatalog(EMPTY_CATALOG)
          setState('ready')
          return
        }

        const { events: shells } = await buildCatalogFromSupabase()
        const keepLocalActive =
          Date.now() - lastLocalEditRef.current < EDIT_GUARD_MS

        setCatalog((prev) => {
          const next = mergeCatalogFromServer(
            prev,
            eventId,
            eventData,
            shells,
            keepLocalActive,
          )
          saveCatalog(next, 'supabase')
          return next
        })

        setFetchedAt(new Date().toISOString())
        setState('ready')
        return
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar Supabase'
        setError(msg)
        console.error('[Supabase] load event:', e)
        setCatalog(EMPTY_CATALOG)
        setState('ready')
        return
      }
    }

    setError(
      'Ligação ao Supabase em falta. Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no deploy.',
    )
    setCatalog(EMPTY_CATALOG)
    setFetchedAt(null)
    setState('ready')
  }, [eventId, useDb])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!useDb || !eventId) return
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastLocalEditRef.current < EDIT_GUARD_MS) return
      void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [useDb, eventId, load])

  const data =
    eventId && catalog && !error ? (catalog.events[eventId] ?? null) : null

  const persist = useCallback(
    (next: EventData) => {
      if (!eventId) return
      markLocalEdit()
      setCatalog((prev) => {
        if (!prev) return prev
        const updated: EventCatalog = {
          ...prev,
          events: { ...prev.events, [eventId]: next },
        }
        saveCatalog(updated, useDb ? 'supabase' : 'local')
        return updated
      })
    },
    [eventId, useDb, markLocalEdit],
  )

  return {
    data,
    catalog,
    state,
    error,
    fetchedAt,
    source: useDb ? ('supabase' as const) : ('unconfigured' as const),
    reload: load,
    persist,
    markLocalEdit,
    isSupabaseConfigured,
    useDb,
  }
}
