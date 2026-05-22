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
  ensureVolunteerInEvent,
  loadCatalog,
  saveCatalog,
} from '../lib/catalog'
import { hydrateCatalogFromSupabase } from '../lib/supabaseData'
import { readSyncMeta } from '../lib/syncMeta'
import { isSupabaseConfigured } from '../lib/supabase'
import { loginOrganizerAccount } from '../lib/organizerAuth'
import {
  loginVolunteerAccount,
  registerVolunteerAccount,
} from '../lib/volunteerAuth'
import type { EventCatalog, PortalMode, VolunteerAccount } from '../types'

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

interface AuthContextValue {
  catalog: EventCatalog
  dataSource: 'local' | 'supabase'
  catalogLoading: boolean
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
  clearActiveEvent: () => void
  exitToEntry: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<EventCatalog>(() =>
    isSupabaseConfigured ? { accounts: [], events: {} } : loadCatalog(),
  )
  const [dataSource, setDataSource] = useState<'local' | 'supabase'>(
    isSupabaseConfigured ? 'supabase' : 'local',
  )
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
    if (isSupabaseConfigured) {
      setCatalogLoading(true)
      const ok = await hydrateCatalogFromSupabase()
      setDataSource(ok ? 'supabase' : 'local')
      setCatalog(loadCatalog())
      setLastSyncedAt(readSyncMeta().hydratedAt)
      setCatalogLoading(false)
      return
    }
    setCatalog(loadCatalog())
    setDataSource('local')
    setLastSyncedAt(null)
  }, [])

  const forceSyncFromServer = useCallback(async () => {
    bootstrapDataSync()
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
      const { catalog: nextCat, result } = await registerVolunteerAccount(
        catalog,
        name,
        phone,
        pin,
      )
      if (result.ok) {
        if (!isSupabaseConfigured) {
          const merged = {
            ...nextCat,
            accounts: upsertAccount(nextCat.accounts, result.account),
          }
          setCatalog(merged)
          saveCatalog(merged)
        }
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

  const selectEvent = useCallback(
    async (eventId: string) => {
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

  const value = useMemo(
    () => ({
      catalog,
      dataSource,
      catalogLoading,
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
      clearActiveEvent,
      exitToEntry,
    }),
    [
      catalog,
      dataSource,
      catalogLoading,
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
      clearActiveEvent,
      exitToEntry,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function upsertAccount(
  accounts: VolunteerAccount[],
  account: VolunteerAccount,
): VolunteerAccount[] {
  const i = accounts.findIndex((a) => a.id === account.id)
  if (i >= 0) {
    const next = [...accounts]
    next[i] = account
    return next
  }
  return [...accounts, account]
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
