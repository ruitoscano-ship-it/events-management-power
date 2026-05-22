export type BlockType =
  | 'activity'
  | 'competition'
  | 'break'
  | 'ceremony'
  | 'logistics'

export type ScheduleCategory =
  | 'setup'
  | 'logistics'
  | 'standard'
  | 'latinas'
  | 'break'
  | 'ceremony'
  | 'activity'

export type ContributionStatus = 'pending' | 'confirmed' | 'delivered'
export type TaskStatus = 'assigned' | 'in_progress' | 'done'
export type UserRole = 'organizer' | 'volunteer'

export type AuditAction =
  | 'event.updated'
  | 'volunteer.created'
  | 'volunteer.updated'
  | 'volunteer.deactivated'
  | 'volunteer.reactivated'
  | 'schedule.created'
  | 'schedule.updated'
  | 'schedule.deleted'
  | 'contribution.created'
  | 'contribution.updated'
  | 'contribution.deleted'
  | 'contribution.completed'
  | 'availability.created'
  | 'availability.deleted'

export interface AuditLogEntry {
  id: string
  at: string
  action: AuditAction
  summary: string
  entity_type?: string
  entity_id?: string
}

export interface Event {
  id: string
  name: string
  description: string | null
  venue: string | null
  event_date: string
  sport_type: string
  pairs_count?: number | null
  day_label?: string | null
  edition_label?: string | null
}

export interface VolunteerAccount {
  id: string
  name: string
  phone: string
  /** Apenas em localStorage (demo); nunca exposto pelo Supabase */
  pin_hash?: string
  created_at: string
}

export interface Volunteer {
  id: string
  event_id: string
  account_id?: string | null
  name: string
  email: string | null
  phone: string | null
  role: string | null
  notes: string | null
  active: boolean
}

export interface EventCatalog {
  accounts: VolunteerAccount[]
  events: Record<string, EventData>
}

export type PortalMode = 'organizer' | 'volunteer'

export interface ScheduleBlock {
  id: string
  event_id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  location: string | null
  block_type: BlockType
  category: ScheduleCategory
  sort_order: number
}

export interface VolunteerAvailability {
  id: string
  volunteer_id: string
  available_from: string
  available_until: string
  notes: string | null
}

export interface Contribution {
  id: string
  event_id: string
  volunteer_id: string | null
  item_name: string
  quantity: string | null
  needed_by: string | null
  status: ContributionStatus
  notes: string | null
  destination?: string | null
  needed_count?: number | null
}

export interface VolunteerTask {
  id: string
  event_id: string
  volunteer_id: string | null
  schedule_block_id: string | null
  title: string
  starts_at: string | null
  ends_at: string | null
  status: TaskStatus
  notes: string | null
}

export type VenueZoneType =
  | 'dance_floor'
  | 'jury'
  | 'sponsors'
  | 'support_station'
  | 'table'

export type SupportStationKind = 'makeup' | 'hairdresser' | 'other'

export interface VenueLayoutZone {
  id: string
  type: VenueZoneType
  label: string
  /** Posição X em coordenadas lógicas do canvas (0–canvas_width) */
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  supportKind?: SupportStationKind
  /** Lugares na mesa (tipo `table`) */
  seats?: number
}

export interface VenueLayout {
  event_id: string
  canvas_width: number
  canvas_height: number
  hall_label?: string
  zones: VenueLayoutZone[]
  updated_at?: string
}

export type SponsorStatus = 'promised' | 'confirmed' | 'received' | 'cancelled'

/** Espécie de patrocínio: monetário, em espécie (bens/serviços), ou misto */
export type SponsorshipKind = 'cash' | 'in_kind' | 'mixed'

export interface EventSponsor {
  id: string
  event_id: string
  name: string
  sponsorship_kind: SponsorshipKind
  /** Valor monetário (EUR), quando aplicável */
  amount: number | null
  /** Descrição do apoio em espécie */
  in_kind_description: string | null
  status: SponsorStatus
  contact_name: string | null
  contact_email: string | null
  notes: string | null
  promised_at: string | null
  received_at: string | null
}

export type RevenueSource = 'bar' | 'tickets' | 'other'

export type RevenueEntryType = 'forecast' | 'actual'

export interface RevenueEntry {
  id: string
  event_id: string
  source: RevenueSource
  entry_type: RevenueEntryType
  description: string | null
  amount: number
  quantity: number | null
  unit_price: number | null
  recorded_at: string
  notes: string | null
}

export interface EventData {
  event: Event
  schedule: ScheduleBlock[]
  volunteers: Volunteer[]
  availability: VolunteerAvailability[]
  contributions: Contribution[]
  tasks: VolunteerTask[]
  venueLayout: VenueLayout | null
  sponsors: EventSponsor[]
  revenueEntries: RevenueEntry[]
  auditLog: AuditLogEntry[]
}
