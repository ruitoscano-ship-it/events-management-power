import { normalizeEventData } from './normalize'
import { newId } from './datetime'
import { normalizePhone } from './phone'
import { isSupabaseConfigured, supabase } from './supabase'
import {
  CATALOG_SCHEMA_VERSION,
  CATALOG_STORAGE_KEY,
  clearCatalogCache,
  isSupabaseCacheValid,
  markCatalogSynced,
  purgeObsoleteCaches,
  readSyncMeta,
  type DataSourceTag,
} from './syncMeta'
import type {
  Event,
  EventCatalog,
  EventData,
  Volunteer,
  VolunteerAccount,
} from '../types'

/** Legacy demo event IDs — never treat as production data. */
const LEGACY_DEMO_EVENT_IDS = new Set([
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
])

export const EMPTY_CATALOG: EventCatalog = { accounts: [], events: {} }

export function catalogHasLegacyDemoEvents(catalog: EventCatalog): boolean {
  return Object.keys(catalog.events).some((id) => LEGACY_DEMO_EVENT_IDS.has(id))
}

function parseStoredCatalog(raw: string): EventCatalog {
  const parsed = JSON.parse(raw) as EventCatalog
  const events: Record<string, EventData> = {}
  for (const [id, data] of Object.entries(parsed.events ?? {})) {
    if (isSupabaseConfigured && LEGACY_DEMO_EVENT_IDS.has(id)) continue
    events[id] = normalizeEventData(data)
  }
  const accounts = isSupabaseConfigured ? [] : (parsed.accounts ?? [])
  return { accounts, events }
}

/**
 * Remove legacy demo caches so new browsers/devices always load from Supabase.
 */
export function bootstrapDataSync(): void {
  purgeObsoleteCaches()
  if (!isSupabaseConfigured) return

  const meta = localStorage.getItem(CATALOG_STORAGE_KEY)
  if (meta) {
    try {
      const catalog = parseStoredCatalog(meta)
      if (catalogHasLegacyDemoEvents(catalog)) {
        clearCatalogCache()
        return
      }
    } catch {
      clearCatalogCache()
    }
  }

  if (readSyncMeta().dataSource === 'local') {
    clearCatalogCache()
  }
}

/** Wipes catalog cache before a forced server sync. */
export function resetCatalogCacheForSync(): void {
  purgeObsoleteCaches()
  clearCatalogCache()
}

export function loadCatalog(): EventCatalog {
  if (!isSupabaseConfigured) {
    return EMPTY_CATALOG
  }

  if (!isSupabaseCacheValid()) {
    return EMPTY_CATALOG
  }

  const raw = localStorage.getItem(CATALOG_STORAGE_KEY)
  if (!raw) {
    return EMPTY_CATALOG
  }

  const catalog = parseStoredCatalog(raw)
  if (catalogHasLegacyDemoEvents(catalog)) {
    clearCatalogCache()
    return EMPTY_CATALOG
  }

  return catalog
}

export function saveCatalog(
  catalog: EventCatalog,
  source: DataSourceTag = isSupabaseConfigured ? 'supabase' : 'local',
): void {
  if (isSupabaseConfigured && catalogHasLegacyDemoEvents(catalog)) {
    return
  }
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog))
  markCatalogSynced(isSupabaseConfigured ? 'supabase' : source)
}

export function isEventArchived(event: Event): boolean {
  return Boolean(event.archived_at)
}

/** Evento encerrado — apenas consulta (mesmo campo `archived_at`). */
export function isEventClosed(event: Event): boolean {
  return isEventArchived(event)
}

export function listEventSummaries(
  catalog: EventCatalog,
  options?: { includeArchived?: boolean },
) {
  return Object.values(catalog.events)
    .map((d) => d.event)
    .filter((e) => options?.includeArchived || !isEventArchived(e))
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
}

/** Atualiza metadados do evento no catálogo (lista + cache) sem perder schedule/volunteers. */
export function patchCatalogEventMetadata(
  catalog: EventCatalog,
  event: Event,
): EventCatalog {
  const existing = catalog.events[event.id]
  if (!existing) {
    return {
      ...catalog,
      events: {
        ...catalog.events,
        [event.id]: normalizeEventData({
          event,
          schedule: [],
          volunteers: [],
          availability: [],
          contributions: [],
          tasks: [],
          venueLayout: null,
          sponsors: [],
          revenueEntries: [],
          thirdPartyRequests: [],
          auditLog: [],
        }),
      },
    }
  }
  return {
    ...catalog,
    events: {
      ...catalog.events,
      [event.id]: normalizeEventData({ ...existing, event }),
    },
  }
}

export function setEventArchivedInCatalog(
  catalog: EventCatalog,
  eventId: string,
  archived: boolean,
  mutate?: (data: EventData) => EventData,
): EventCatalog {
  const data = catalog.events[eventId]
  if (!data) throw new Error('Evento não encontrado')
  let nextData = normalizeEventData({
    ...data,
    event: {
      ...data.event,
      archived_at: archived ? new Date().toISOString() : null,
    },
  })
  if (mutate) {
    nextData = normalizeEventData(mutate(nextData))
  }
  return {
    ...catalog,
    events: { ...catalog.events, [eventId]: nextData },
  }
}

export function isEventOngoing(eventDate: string, today = new Date()): boolean {
  const d = new Date(eventDate + 'T23:59:59')
  return d >= new Date(today.toISOString().slice(0, 10) + 'T00:00:00')
}

export function findAccountByPhone(
  catalog: EventCatalog,
  phone: string,
): VolunteerAccount | undefined {
  const normalized = normalizePhone(phone)
  return catalog.accounts.find((a) => a.phone === normalized)
}

export async function ensureVolunteerInEvent(
  catalog: EventCatalog,
  eventId: string,
  account: VolunteerAccount,
): Promise<{ catalog: EventCatalog; volunteerId: string }> {
  const data = catalog.events[eventId]
  if (!data) throw new Error('Evento não encontrado')

  const existing = data.volunteers.find(
    (v) => v.account_id === account.id || v.phone === account.phone,
  )
  if (existing) {
    const updated: Volunteer = {
      ...existing,
      account_id: account.id,
      name: account.name,
      phone: account.phone,
      active: true,
    }
    const volunteers = data.volunteers.map((v) =>
      v.id === existing.id ? updated : v,
    )
    const nextData = normalizeEventData({ ...data, volunteers })
    const next = {
      ...catalog,
      events: { ...catalog.events, [eventId]: nextData },
    }
    saveCatalog(next)
    if (isSupabaseConfigured && supabase) {
      await supabase.from('volunteers').upsert(updated)
    }
    return { catalog: next, volunteerId: existing.id }
  }

  const volunteer: Volunteer = {
    id: newId(),
    event_id: eventId,
    account_id: account.id,
    name: account.name,
    email: null,
    phone: account.phone,
    role: null,
    notes: null,
    active: true,
  }
  const nextData = normalizeEventData({
    ...data,
    volunteers: [...data.volunteers, volunteer],
  })
  const next = {
    ...catalog,
    events: { ...catalog.events, [eventId]: nextData },
  }
  saveCatalog(next)
  if (isSupabaseConfigured && supabase) {
    await supabase.from('volunteers').upsert(volunteer)
  }
  return { catalog: next, volunteerId: volunteer.id }
}

export function resolveVolunteerId(
  data: EventData,
  accountId: string,
): string | null {
  const v = data.volunteers.find(
    (x) => x.account_id === accountId && x.active !== false,
  )
  return v?.id ?? null
}

export { CATALOG_SCHEMA_VERSION }
