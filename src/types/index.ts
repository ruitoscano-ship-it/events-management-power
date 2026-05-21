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

export interface Volunteer {
  id: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  notes: string | null
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

export interface EventData {
  event: Event
  schedule: ScheduleBlock[]
  volunteers: Volunteer[]
  availability: VolunteerAvailability[]
  contributions: Contribution[]
  tasks: VolunteerTask[]
}
