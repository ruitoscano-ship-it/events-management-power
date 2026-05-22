import { newId } from './datetime'
import type {
  SupportStationKind,
  VenueLayout,
  VenueLayoutZone,
  VenueZoneType,
} from '../types'

export const VENUE_CANVAS_WIDTH = 1000
export const VENUE_CANVAS_HEIGHT = 700

export const ZONE_TYPE_LABELS: Record<VenueZoneType, string> = {
  dance_floor: 'Pista de dança',
  jury: 'Júri',
  sponsors: 'Sponsors',
  support_station: 'Posto de apoio',
  table: 'Mesa',
}

export const SUPPORT_KIND_LABELS: Record<SupportStationKind, string> = {
  makeup: 'Maquilhagem',
  hairdresser: 'Cabeleireiro',
  other: 'Outro apoio',
}

export const ZONE_STYLES: Record<
  VenueZoneType,
  { fill: string; border: string; text: string }
> = {
  dance_floor: {
    fill: 'rgba(251, 191, 36, 0.35)',
    border: 'rgba(251, 191, 36, 0.9)',
    text: '#fcd34d',
  },
  jury: {
    fill: 'rgba(168, 85, 247, 0.35)',
    border: 'rgba(168, 85, 247, 0.9)',
    text: '#d8b4fe',
  },
  sponsors: {
    fill: 'rgba(34, 211, 238, 0.3)',
    border: 'rgba(34, 211, 238, 0.9)',
    text: '#67e8f9',
  },
  support_station: {
    fill: 'rgba(255, 45, 106, 0.25)',
    border: 'rgba(255, 45, 106, 0.85)',
    text: '#fda4af',
  },
  table: {
    fill: 'rgba(148, 163, 184, 0.25)',
    border: 'rgba(148, 163, 184, 0.8)',
    text: '#cbd5e1',
  },
}

const DEFAULT_SIZES: Record<VenueZoneType, { width: number; height: number }> = {
  dance_floor: { width: 480, height: 360 },
  jury: { width: 420, height: 72 },
  sponsors: { width: 200, height: 56 },
  support_station: { width: 120, height: 100 },
  table: { width: 72, height: 72 },
}

export function createDefaultVenueLayout(eventId: string): VenueLayout {
  return {
    event_id: eventId,
    canvas_width: VENUE_CANVAS_WIDTH,
    canvas_height: VENUE_CANVAS_HEIGHT,
    hall_label: 'Salão principal',
    zones: [
      {
        id: newId(),
        type: 'dance_floor',
        label: 'Pista de dança',
        x: 260,
        y: 180,
        width: 480,
        height: 360,
      },
      {
        id: newId(),
        type: 'jury',
        label: 'Júri',
        x: 290,
        y: 48,
        width: 420,
        height: 72,
      },
      {
        id: newId(),
        type: 'sponsors',
        label: 'Sponsors',
        x: 40,
        y: 48,
        width: 180,
        height: 56,
      },
      {
        id: newId(),
        type: 'table',
        label: 'Mesa 1',
        x: 80,
        y: 580,
        width: 72,
        height: 72,
        seats: 8,
      },
      {
        id: newId(),
        type: 'table',
        label: 'Mesa 2',
        x: 180,
        y: 580,
        width: 72,
        height: 72,
        seats: 8,
      },
    ],
  }
}

export function createZone(
  type: VenueZoneType,
  options?: {
    supportKind?: SupportStationKind
    label?: string
  },
): VenueLayoutZone {
  const size = DEFAULT_SIZES[type]
  const cx = VENUE_CANVAS_WIDTH / 2 - size.width / 2
  const cy = VENUE_CANVAS_HEIGHT / 2 - size.height / 2
  let label = options?.label ?? ZONE_TYPE_LABELS[type]
  if (type === 'support_station' && options?.supportKind) {
    label = SUPPORT_KIND_LABELS[options.supportKind]
  }
  if (type === 'table') {
    label = options?.label ?? 'Mesa'
  }
  return {
    id: newId(),
    type,
    label,
    x: Math.round(cx),
    y: Math.round(cy),
    width: size.width,
    height: size.height,
    supportKind: options?.supportKind,
    seats: type === 'table' ? 8 : undefined,
  }
}

export function clampZone(zone: VenueLayoutZone, canvasW: number, canvasH: number): VenueLayoutZone {
  const width = Math.max(40, Math.min(zone.width, canvasW))
  const height = Math.max(32, Math.min(zone.height, canvasH))
  const x = Math.max(0, Math.min(zone.x, canvasW - width))
  const y = Math.max(0, Math.min(zone.y, canvasH - height))
  return { ...zone, x, y, width, height }
}

export function mapVenueLayoutRow(
  eventId: string,
  layoutData: unknown,
): VenueLayout | null {
  if (!layoutData || typeof layoutData !== 'object') return null
  const raw = layoutData as Record<string, unknown>
  const zones = Array.isArray(raw.zones)
    ? raw.zones.map((z) => normalizeZone(z as Record<string, unknown>))
    : []
  return {
    event_id: eventId,
    canvas_width: Number(raw.canvas_width) || VENUE_CANVAS_WIDTH,
    canvas_height: Number(raw.canvas_height) || VENUE_CANVAS_HEIGHT,
    hall_label: raw.hall_label != null ? String(raw.hall_label) : 'Salão principal',
    zones,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  }
}

function normalizeZone(raw: Record<string, unknown>): VenueLayoutZone {
  const type = raw.type as VenueZoneType
  return {
    id: String(raw.id ?? newId()),
    type,
    label: String(raw.label ?? ZONE_TYPE_LABELS[type] ?? 'Zona'),
    x: Number(raw.x) || 0,
    y: Number(raw.y) || 0,
    width: Number(raw.width) || 80,
    height: Number(raw.height) || 60,
    rotation: raw.rotation != null ? Number(raw.rotation) : undefined,
    supportKind: raw.supportKind as SupportStationKind | undefined,
    seats: raw.seats != null ? Number(raw.seats) : undefined,
  }
}

export function venueLayoutToDbPayload(layout: VenueLayout) {
  return {
    event_id: layout.event_id,
    layout_data: {
      canvas_width: layout.canvas_width,
      canvas_height: layout.canvas_height,
      hall_label: layout.hall_label,
      zones: layout.zones,
      updated_at: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  }
}
