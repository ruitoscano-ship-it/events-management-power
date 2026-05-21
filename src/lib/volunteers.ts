import type { Volunteer } from '../types'

const AVATAR_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f97316',
  '#eab308',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
  '#ef4444',
]

export function isActiveVolunteer(v: Volunteer): boolean {
  return v.active !== false
}

export function activeVolunteers(volunteers: Volunteer[]): Volunteer[] {
  return volunteers.filter(isActiveVolunteer)
}

export function volunteerInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function volunteerById(
  volunteers: Volunteer[],
  id: string,
): Volunteer | undefined {
  return volunteers.find((v) => v.id === id)
}
