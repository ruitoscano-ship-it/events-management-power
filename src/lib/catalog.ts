import { demoEventData, DEMO_EVENT_ID } from '../data/demoData'
import { normalizeEventData } from './normalize'
import { newId } from './datetime'
import { normalizePhone } from './phone'
import { isSupabaseConfigured, supabase } from './supabase'
import type { EventCatalog, EventData, Volunteer, VolunteerAccount } from '../types'

const CATALOG_KEY = 'eventflow-catalog-v1'
const LEGACY_KEY = 'eventflow-data-v4'

export const PAST_EVENT_ID = 'a0000000-0000-4000-8000-000000000002'

const pastEventData: EventData = normalizeEventData({
  event: {
    id: PAST_EVENT_ID,
    name: 'OPEN DE DANÇA DESPORTIVA — LISBOA 2025',
    description: 'Edição anterior (arquivo).',
    venue: 'Lisboa',
    event_date: '2025-11-08',
    sport_type: 'danca_salao',
    pairs_count: 140,
    day_label: 'Sábado',
    edition_label: 'FPDD 2025',
  },
  schedule: [],
  volunteers: [],
  availability: [],
  contributions: [],
  tasks: [],
  auditLog: [],
})

function seedCatalog(): EventCatalog {
  return {
    accounts: [],
    events: {
      [DEMO_EVENT_ID]: normalizeEventData(structuredClone(demoEventData)),
      [PAST_EVENT_ID]: pastEventData,
    },
  }
}

function migrateLegacy(): EventCatalog | null {
  const raw = localStorage.getItem(LEGACY_KEY)
  if (!raw) return null
  const data = normalizeEventData(JSON.parse(raw) as EventData)
  return {
    accounts: [],
    events: { [data.event.id]: data },
  }
}

export function loadCatalog(): EventCatalog {
  const raw = localStorage.getItem(CATALOG_KEY)
  if (raw) {
    const parsed = JSON.parse(raw) as EventCatalog
    const events: Record<string, EventData> = {}
    for (const [id, data] of Object.entries(parsed.events ?? {})) {
      events[id] = normalizeEventData(data)
    }
    return {
      accounts: parsed.accounts ?? [],
      events,
    }
  }
  const migrated = migrateLegacy()
  const catalog = migrated ?? seedCatalog()
  saveCatalog(catalog)
  return catalog
}

export function saveCatalog(catalog: EventCatalog): void {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog))
}

export function listEventSummaries(catalog: EventCatalog) {
  return Object.values(catalog.events)
    .map((d) => d.event)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
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
