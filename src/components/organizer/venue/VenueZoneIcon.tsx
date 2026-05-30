import {
  Building2,
  DoorOpen,
  Flower2,
  Gavel,
  LogOut,
  Mic2,
  Music2,
  Palette,
  Scissors,
  Sparkles,
  Square,
  Table2,
  type LucideIcon,
} from 'lucide-react'
import type { SupportStationKind, VenueZoneType } from '../../../types'
import { zoneStyle } from '../../../lib/venueLayout'

const ICONS: Record<VenueZoneType, LucideIcon> = {
  dance_floor: Music2,
  podium: Mic2,
  jury: Gavel,
  sponsors: Building2,
  flowers: Flower2,
  floor_banner: Sparkles,
  entry: DoorOpen,
  exit: LogOut,
  support_station: Palette,
  table: Table2,
}

const SUPPORT_ICONS: Record<SupportStationKind, LucideIcon> = {
  makeup: Palette,
  hairdresser: Scissors,
  other: Square,
}

interface Props {
  type: VenueZoneType
  supportKind?: SupportStationKind
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASS = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
} as const

export function VenueZoneIcon({
  type,
  supportKind,
  size = 'md',
  className = '',
}: Props) {
  const Icon =
    type === 'support_station' && supportKind
      ? SUPPORT_ICONS[supportKind]
      : ICONS[type]
  const color = zoneStyle(type).icon
  return (
    <Icon
      className={`shrink-0 ${SIZE_CLASS[size]} ${className}`}
      style={{ color }}
      strokeWidth={2.25}
      aria-hidden
    />
  )
}
