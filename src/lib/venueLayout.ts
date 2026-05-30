import type { CSSProperties } from 'react'
import { newId } from './datetime'
import type {
  SupportStationKind,
  VenueLayout,
  VenueLayoutZone,
  VenueZoneType,
} from '../types'

export const VENUE_CANVAS_WIDTH = 1000
export const VENUE_CANVAS_HEIGHT = 700
/** Unidade da grelha (coordenadas lógicas) — arrastar/redimensionar encaixa aqui. */
export const GRID_CELL = 25
export const GRID_MAJOR_EVERY = 4

export const VENUE_ZONE_TYPES: VenueZoneType[] = [
  'dance_floor',
  'podium',
  'entry',
  'exit',
  'flowers',
  'floor_banner',
  'jury',
  'sponsors',
  'support_station',
  'table',
]

export function isVenueZoneType(value: string): value is VenueZoneType {
  return (VENUE_ZONE_TYPES as string[]).includes(value)
}

export const ZONE_TYPE_LABELS: Record<VenueZoneType, string> = {
  dance_floor: 'Pista de dança',
  podium: 'Pódio / palco',
  jury: 'Júri',
  sponsors: 'Sponsors',
  flowers: 'Flores',
  floor_banner: 'Banner chão',
  entry: 'Entrada',
  exit: 'Saída',
  support_station: 'Posto de apoio',
  table: 'Mesa',
}

export const ZONE_TYPE_SHORT: Record<VenueZoneType, string> = {
  dance_floor: 'Pista',
  podium: 'Pódio',
  jury: 'Júri',
  sponsors: 'Sponsors',
  flowers: 'Flores',
  floor_banner: 'Banner',
  entry: 'Entrada',
  exit: 'Saída',
  support_station: 'Apoio',
  table: 'Mesa',
}

export const SUPPORT_KIND_LABELS: Record<SupportStationKind, string> = {
  makeup: 'Maquilhagem',
  hairdresser: 'Cabeleireiro',
  other: 'Outro apoio',
}

export const ZONE_STYLES: Record<
  VenueZoneType,
  { fill: string; border: string; text: string; icon: string }
> = {
  dance_floor: {
    fill: 'rgba(251, 191, 36, 0.32)',
    border: 'rgba(251, 191, 36, 0.95)',
    text: '#fcd34d',
    icon: '#fbbf24',
  },
  podium: {
    fill: 'rgba(244, 63, 94, 0.28)',
    border: 'rgba(244, 63, 94, 0.9)',
    text: '#fda4af',
    icon: '#fb7185',
  },
  jury: {
    fill: 'rgba(168, 85, 247, 0.32)',
    border: 'rgba(168, 85, 247, 0.9)',
    text: '#d8b4fe',
    icon: '#c084fc',
  },
  sponsors: {
    fill: 'rgba(34, 211, 238, 0.28)',
    border: 'rgba(34, 211, 238, 0.9)',
    text: '#67e8f9',
    icon: '#22d3ee',
  },
  flowers: {
    fill: 'rgba(52, 211, 153, 0.28)',
    border: 'rgba(52, 211, 153, 0.9)',
    text: '#6ee7b7',
    icon: '#34d399',
  },
  floor_banner: {
    fill: 'rgba(249, 115, 22, 0.28)',
    border: 'rgba(249, 115, 22, 0.9)',
    text: '#fdba74',
    icon: '#fb923c',
  },
  entry: {
    fill: 'rgba(74, 222, 128, 0.28)',
    border: 'rgba(74, 222, 128, 0.95)',
    text: '#86efac',
    icon: '#4ade80',
  },
  exit: {
    fill: 'rgba(248, 113, 113, 0.28)',
    border: 'rgba(248, 113, 113, 0.9)',
    text: '#fca5a5',
    icon: '#f87171',
  },
  support_station: {
    fill: 'rgba(255, 45, 106, 0.22)',
    border: 'rgba(255, 45, 106, 0.85)',
    text: '#fda4af',
    icon: '#ff2d6a',
  },
  table: {
    fill: 'rgba(148, 163, 184, 0.28)',
    border: 'rgba(148, 163, 184, 0.85)',
    text: '#cbd5e1',
    icon: '#94a3b8',
  },
}

const DEFAULT_STYLES = ZONE_STYLES.table

export function zoneStyle(type: VenueZoneType) {
  return ZONE_STYLES[type] ?? DEFAULT_STYLES
}

const DEFAULT_SIZES: Record<VenueZoneType, { width: number; height: number }> = {
  dance_floor: { width: 500, height: 380 },
  podium: { width: 360, height: 64 },
  jury: { width: 400, height: 72 },
  sponsors: { width: 180, height: 56 },
  flowers: { width: 100, height: 80 },
  floor_banner: { width: 200, height: 40 },
  entry: { width: 160, height: 56 },
  exit: { width: 160, height: 56 },
  support_station: { width: 120, height: 100 },
  table: { width: 72, height: 72 },
}

export function snapValue(n: number, grid = GRID_CELL): number {
  return Math.round(n / grid) * grid
}

export function snapZone(zone: VenueLayoutZone): VenueLayoutZone {
  return {
    ...zone,
    x: snapValue(zone.x),
    y: snapValue(zone.y),
    width: Math.max(GRID_CELL, snapValue(zone.width)),
    height: Math.max(GRID_CELL, snapValue(zone.height)),
  }
}

/** CSS background for planning grid (minor + major lines). */
export function venueGridBackground(cw: number, ch: number): CSSProperties {
  const minorX = (GRID_CELL / cw) * 100
  const minorY = (GRID_CELL / ch) * 100
  const majorX = ((GRID_CELL * GRID_MAJOR_EVERY) / cw) * 100
  const majorY = ((GRID_CELL * GRID_MAJOR_EVERY) / ch) * 100
  return {
    backgroundColor: '#0f0f18',
    backgroundImage: `
      linear-gradient(to right, rgba(255,45,106,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,45,106,0.06) 1px, transparent 1px),
      linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
    `,
    backgroundSize: `
      ${minorX}% ${minorY}%,
      ${minorX}% ${minorY}%,
      ${majorX}% ${majorY}%,
      ${majorX}% ${majorY}%
    `,
  }
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
        type: 'entry',
        label: 'Entrada',
        x: 420,
        y: 16,
        width: 160,
        height: 56,
      },
      {
        id: newId(),
        type: 'exit',
        label: 'Saída',
        x: 420,
        y: 628,
        width: 160,
        height: 56,
      },
      {
        id: newId(),
        type: 'floor_banner',
        label: 'Banner lateral',
        x: 24,
        y: 300,
        width: 48,
        height: 220,
      },
      {
        id: newId(),
        type: 'floor_banner',
        label: 'Banner lateral',
        x: 928,
        y: 300,
        width: 48,
        height: 220,
      },
      {
        id: newId(),
        type: 'podium',
        label: 'Pódio',
        x: 320,
        y: 100,
        width: 360,
        height: 64,
      },
      {
        id: newId(),
        type: 'jury',
        label: 'Júri',
        x: 300,
        y: 176,
        width: 400,
        height: 72,
      },
      {
        id: newId(),
        type: 'dance_floor',
        label: 'Pista de dança',
        x: 250,
        y: 200,
        width: 500,
        height: 380,
      },
      {
        id: newId(),
        type: 'flowers',
        label: 'Flores',
        x: 180,
        y: 120,
        width: 100,
        height: 80,
      },
      {
        id: newId(),
        type: 'flowers',
        label: 'Flores',
        x: 720,
        y: 120,
        width: 100,
        height: 80,
      },
      {
        id: newId(),
        type: 'sponsors',
        label: 'Sponsors',
        x: 80,
        y: 88,
        width: 180,
        height: 56,
      },
      {
        id: newId(),
        type: 'table',
        label: 'Mesa 1',
        x: 100,
        y: 560,
        width: 72,
        height: 72,
        seats: 8,
      },
      {
        id: newId(),
        type: 'table',
        label: 'Mesa 2',
        x: 828,
        y: 560,
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
  const zone: VenueLayoutZone = {
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
  return snapZone(zone)
}

export function clampZone(
  zone: VenueLayoutZone,
  canvasW: number,
  canvasH: number,
): VenueLayoutZone {
  const width = Math.max(GRID_CELL, Math.min(zone.width, canvasW))
  const height = Math.max(GRID_CELL, Math.min(zone.height, canvasH))
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
  const rawType = String(raw.type ?? 'table')
  const type: VenueZoneType = isVenueZoneType(rawType) ? rawType : 'table'
  return snapZone({
    id: String(raw.id ?? newId()),
    type,
    label: String(raw.label ?? ZONE_TYPE_LABELS[type] ?? 'Zona'),
    x: Number(raw.x) || 0,
    y: Number(raw.y) || 0,
    width: Number(raw.width) || DEFAULT_SIZES[type].width,
    height: Number(raw.height) || DEFAULT_SIZES[type].height,
    rotation: raw.rotation != null ? Number(raw.rotation) : undefined,
    supportKind: raw.supportKind as SupportStationKind | undefined,
    seats: raw.seats != null ? Number(raw.seats) : undefined,
  })
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
