import type { SupportStationKind, VenueZoneType } from '../../../types'

export interface ZonePaletteItem {
  type: VenueZoneType
  supportKind?: SupportStationKind
}

export interface ZonePaletteGroup {
  title: string
  items: ZonePaletteItem[]
}

export const ZONE_PALETTE: ZonePaletteGroup[] = [
  {
    title: 'Pista e palco',
    items: [
      { type: 'dance_floor' },
      { type: 'podium' },
    ],
  },
  {
    title: 'Acesso',
    items: [{ type: 'entry' }, { type: 'exit' }],
  },
  {
    title: 'Decoração',
    items: [{ type: 'flowers' }, { type: 'floor_banner' }],
  },
  {
    title: 'Evento',
    items: [{ type: 'jury' }, { type: 'sponsors' }],
  },
  {
    title: 'Apoio',
    items: [
      { type: 'support_station', supportKind: 'makeup' },
      { type: 'support_station', supportKind: 'hairdresser' },
      { type: 'support_station', supportKind: 'other' },
    ],
  },
  {
    title: 'Mesas',
    items: [{ type: 'table' }],
  },
]
