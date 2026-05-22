import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  bootstrapDataSync,
  EMPTY_CATALOG,
  ensureVolunteerInEvent,
  isEventArchived,
  resetCatalogCacheForSync,
  saveCatalog,
  patchCatalogEventMetadata,
  setEventArchivedInCatalog,
} from '../lib/catalog'
import {
  closeEventData,
  reopenEventData,
  validateReopenJustification,
} from '../lib/eventLifecycle'
import { newId } from '../lib/datetime'
import { dayLabelFromDate } from '../lib/normalize'
import { syncEvent, syncEventArchivedAt } from '../lib/persistence'
import { fetchCatalogFromSupabase } from '../lib/supabaseData'
import { readSyncMeta } from '../lib/syncMeta'
import { isSupabaseConfigured } from '../lib/supabase'
import { loginOrganizerAccount } from '../lib/organizerAuth'
import {
  loginVolunteerAccount,
  registerVolunteerAccount,
} from '../lib/volunteerAuth'
import type { Event, EventCatalog, EventData, PortalMode, VolunteerAccount } from '../types'

const AUTH_KEY = 'eventflow-auth-v1'

interface AuthPersist {
  mode: PortalMode | null
  organizerLoggedIn: boolean
  organizerId: string | null
  organizerUsername: string | null
  volunteerAccountId: string | null
  volunteerAccountName: string | null
  volunteerAccountPhone: string | null
  activeEventId: string | null
  volunteerIdInEvent: string | null
}

function readAuth(): AuthPersist {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return defaultAuth()
    return { ...defaultAuth(), ...JSON.parse(raw) }
  } catch {
    return defaultAuth()
  }
}

function defaultAuth(): AuthPersist {
  return {
    mode: null,
    organizerLoggedIn: false,
    organizerId: null,
    organizerUsername: null,
    volunteerAccountId: null,
    volunteerAccountName: null,
    volunteerAccountPhone: null,
    activeEventId: null,
    volunteerIdInEvent: null,
  }
}

function writeAuth(state: AuthPersist) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state))
}

function accountFromAuth(auth: AuthPersist): VolunteerAccount | null {
  if (!auth.volunteerAccountId || !auth.volunteerAccountName || !auth.volunteerAccountPhone) {
    return null
  }
  return {
    id: auth.volunteerAccountId,
    name: auth.volunteerAccountName,
    phone: auth.volunteerAccountPhone,
    created_at: new Date().toISOString(),
  }
}

export type CreateEventInput = {
  name: string
  event_date: string
  venue: string
  sport_type?: string
  pairs_count?: number | null
  edition_label?: string | null
  description?: string | null
  day_label?: string | null
}

interface AuthContextValue {
  catalog: EventCatalog
  dataSource: 'supabase' | 'unconfigured'
  catalogLoading: boolean
  catalogSyncError: string | null
  refreshCatalog: () => Promise<void>
  forceSyncFromServer: () => Promise<void>
  lastSyncedAt: string | null
  volunteerAccount: VolunteerAccount | null
  mode: PortalMode | null
  organizerLoggedIn: boolean
  volunteerAccountId: string | null
  activeEventId: string | null
  volunteerIdInEvent: string | null
  startOrganizer: () => void
  startVolunteer: () => void
  loginOrganizer: (username: string, password: string) => Promise<string | null>
  logoutOrganizer: () => void
  registerVolunteer: (
    name: string,
    phone: string,
    pin: string,
  ) => Promise<string | null>
  loginVolunteer: (phone: string, pin: string) => Promise<string | null>
  logoutVolunteer: () => void
  selectEvent: (eventId: string) => Promise<void>
  createEvent: (
    input: CreateEventInput,
  ) => Promise<{ eventId: string } | { error: string }>
  closeEvent: (eventId: string) => Promise<string | null>
  reopenEvent: (eventId: string, justification: string) => Promise<string | null>
  /** @deprecated Use closeEvent */
  archiveEvent: (eventId: string) => Promise<string | null>
  /** @deprecated Use reopenEvent */
  restoreEvent: (eventId: string, justification: string) => Promise<string | null>
  patchCatalogEvent: (event: Event) => void
  clearActiveEvent: () => void
  exitToEntry: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<EventCatalog>(EMPTY_CATALOG)
  const [dataSource, setDataSource] = useState<'supabase' | 'unconfigured'>(
    isSupabaseConfigured ? 'supabase' : 'unconfigured',
  )
  const [catalogSyncError, setCatalogSyncError] = useState<string | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(isSupabaseConfigured)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    readSyncMeta().hydratedAt,
  )
  const [auth, setAuth] = useState<AuthPersist>(readAuth)

  const volunteerAccount = useMemo(() => accountFromAuth(auth), [auth])

  const persist = useCallback((next: AuthPersist) => {
    setAuth(next)
    writeAuth(next)
  }, [])

  const refreshCatalog = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCatalog(EMPTY_CATALOG)
      setDataSource('unconfigured')
      setCatalogSyncError(
        'Supabase não configurado neste ambiente (variáveis VITE no deploy).',
      )
      setLastSyncedAt(null)
      setCatalogLoading(false)
      return
    }

    setCatalogLoading(true)
    setCatalogSyncError(null)
    const { catalog: next, ok, error } = await fetchCatalogFromSupabase()
    setCatalog(next)
    setDataSource('supabase')
    setCatalogSyncError(ok ? null : error)
    setLastSyncedAt(ok ? readSyncMeta().hydratedAt : null)
    setCatalogLoading(false)
  }, [])

  const forceSyncFromServer = useCallback(async () => {
    resetCatalogCacheForSync()
    await refreshCatalog()
  }, [refreshCatalog])

  useEffect(() => {
    bootstrapDataSync()
    void refreshCatalog()
  }, [refreshCatalog])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshCatalog()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshCatalog])

  const setVolunteerSession = useCallback(
    (account: VolunteerAccount) => {
      persist({
        ...auth,
        mode: 'volunteer',
        volunteerAccountId: account.id,
        volunteerAccountName: account.name,
        volunteerAccountPhone: account.phone,
        activeEventId: null,
        volunteerIdInEvent: null,
        organizerLoggedIn: false,
      })
    },
    [auth, persist],
  )

  const startOrganizer = useCallback(() => {
    persist({
      ...defaultAuth(),
      mode: 'organizer',
    })
  }, [persist])

  const startVolunteer = useCallback(() => {
    persist({
      ...defaultAuth(),
      mode: 'volunteer',
    })
  }, [persist])

  const loginOrganizer = useCallback(
    async (username: string, password: string) => {
      const result = await loginOrganizerAccount(username, password)
      if (!result.ok) return result.error
      persist({
        ...auth,
        mode: 'organizer',
        organizerLoggedIn: true,
        organizerId: result.organizerId,
        organizerUsername: result.username,
        volunteerAccountId: null,
        volunteerAccountName: null,
        volunteerAccountPhone: null,
        volunteerIdInEvent: null,
        activeEventId: null,
      })
      return null
    },
    [auth, persist],
  )

  const logoutOrganizer = useCallback(() => {
    persist({
      ...defaultAuth(),
      mode: 'organizer',
    })
  }, [persist])

  const registerVolunteer = useCallback(
    async (name: string, phone: string, pin: string) => {
      const { result } = await registerVolunteerAccount(catalog, name, phone, pin)
      if (result.ok) {
        setVolunteerSession(result.account)
        return null
      }
      return result.error
    },
    [catalog, setVolunteerSession],
  )

  const loginVolunteer = useCallback(
    async (phone: string, pin: string) => {
      const result = await loginVolunteerAccount(catalog, phone, pin)
      if (result.ok) {
        setVolunteerSession(result.account)
        return null
      }
      return result.error
    },
    [catalog, setVolunteerSession],
  )

  const logoutVolunteer = useCallback(() => {
    persist({
      ...defaultAuth(),
      mode: 'volunteer',
    })
  }, [persist])

  const setCatalogClosed = useCallback(
    async (
      eventId: string,
      closed: boolean,
      mutate?: (data: EventData) => EventData,
    ) => {
      const entry = catalog.events[eventId]
      if (!entry) return 'Evento não encontrado.'
      if (closed && isEventArchived(entry.event)) {
        return 'Este evento já está encerrado.'
      }
      if (!closed && !isEventArchived(entry.event)) {
        return 'Este evento não está encerrado.'
      }
      const next = setEventArchivedInCatalog(catalog, eventId, closed, mutate)
      const updated = next.events[eventId].event
      try {
        if (isSupabaseConfigured) {
          await syncEvent(updated, true)
          await syncEventArchivedAt(updated, true)
        }
        saveCatalog(next, isSupabaseConfigured ? 'supabase' : 'local')
        setCatalog(next)
        return null
      } catch (e) {
        console.error('[close/reopen event]', e)
        return 'Não foi possível guardar no servidor. Tenta novamente.'
      }
    },
    [catalog],
  )

  const closeEvent = useCallback(
    (eventId: string) =>
      setCatalogClosed(eventId, true, (data) => closeEventData(data)),
    [setCatalogClosed],
  )

  const reopenEvent = useCallback(
    async (eventId: string, justification: string) => {
      const err = validateReopenJustification(justification)
      if (err) return err
      return setCatalogClosed(eventId, false, (data) =>
        reopenEventData(data, justification),
      )
    },
    [setCatalogClosed],
  )

  const archiveEvent = useCallback(
    (eventId: string) => closeEvent(eventId),
    [closeEvent],
  )

  const restoreEvent = useCallback(
    (eventId: string, justification: string) => reopenEvent(eventId, justification),
    [reopenEvent],
  )

  const createEvent = useCallback(
    async (
      input: CreateEventInput,
    ): Promise<{ eventId: string } | { error: string }> => {
      if (!isSupabaseConfigured) {
        return {
          error:
            'Supabase não configurado. Define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
        }
      }
      const trimmedName = input.name.trim()
      if (!trimmedName) {
        return { error: 'O nome do evento é obrigatório.' }
      }
      const event: Event = {
        id: newId(),
        name: trimmedName,
        description: input.description ?? null,
        venue: input.venue.trim() || null,
        event_date: input.event_date,
        sport_type: input.sport_type ?? 'danca_salao',
        pairs_count: input.pairs_count ?? null,
        day_label: input.day_label ?? dayLabelFromDate(input.event_date),
        edition_label: input.edition_label ?? null,
        archived_at: null,
      }
      try {
        await syncEvent(event, true)
        setCatalog((prev) => {
          const next = patchCatalogEventMetadata(prev, event)
          saveCatalog(next, 'supabase')
          return next
        })
        return { eventId: event.id }
      } catch (e) {
        console.error('[AuthContext] createEvent:', e)
        return {
          error:
            e instanceof Error
              ? e.message
              : 'Não foi possível criar o evento no servidor.',
        }
      }
    },
    [],
  )

  const selectEvent = useCallback(
    async (eventId: string) => {
      const entry = catalog.events[eventId]
      if (
        entry &&
        isEventArchived(entry.event) &&
        auth.mode !== 'organizer'
      ) {
        return
      }

      if (auth.mode === 'volunteer' && volunteerAccount) {
        const { catalog: next, volunteerId } = await ensureVolunteerInEvent(
          catalog,
          eventId,
          volunteerAccount,
        )
        setCatalog(next)
        persist({
          ...auth,
          activeEventId: eventId,
          volunteerIdInEvent: volunteerId,
        })
        return
      }
      persist({
        ...auth,
        activeEventId: eventId,
        volunteerIdInEvent: null,
      })
    },
    [auth, catalog, persist, volunteerAccount],
  )

  const clearActiveEvent = useCallback(() => {
    persist({
      ...auth,
      activeEventId: null,
      volunteerIdInEvent: null,
    })
  }, [auth, persist])

  const exitToEntry = useCallback(() => {
    persist(defaultAuth())
  }, [persist])

  const patchCatalogEvent = useCallback((event: Event) => {
    setCatalog((prev) => {
      const next = patchCatalogEventMetadata(prev, event)
      saveCatalog(next, isSupabaseConfigured ? 'supabase' : 'local')
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      catalog,
      dataSource,
      catalogLoading,
      catalogSyncError,
      refreshCatalog,
      forceSyncFromServer,
      lastSyncedAt,
      volunteerAccount,
      mode: auth.mode,
      organizerLoggedIn: auth.organizerLoggedIn,
      volunteerAccountId: auth.volunteerAccountId,
      activeEventId: auth.activeEventId,
      volunteerIdInEvent: auth.volunteerIdInEvent,
      startOrganizer,
      startVolunteer,
      loginOrganizer,
      logoutOrganizer,
      registerVolunteer,
      loginVolunteer,
      logoutVolunteer,
      selectEvent,
      createEvent,
      closeEvent,
      reopenEvent,
      archiveEvent,
      restoreEvent,
      patchCatalogEvent,
      clearActiveEvent,
      exitToEntry,
    }),
    [
      catalog,
      dataSource,
      catalogLoading,
      catalogSyncError,
      refreshCatalog,
      forceSyncFromServer,
      lastSyncedAt,
      volunteerAccount,
      auth,
      startOrganizer,
      startVolunteer,
      loginOrganizer,
      logoutOrganizer,
      registerVolunteer,
      loginVolunteer,
      logoutVolunteer,
      selectEvent,
      createEvent,
      closeEvent,
      reopenEvent,
      archiveEvent,
      restoreEvent,
      patchCatalogEvent,
      clearActiveEvent,
      exitToEntry,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
