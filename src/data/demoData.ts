import type { EventData } from '../types'

export const DEMO_EVENT_ID = 'a0000000-0000-4000-8000-000000000001'

export const demoEventData: EventData = {
  event: {
    id: DEMO_EVENT_ID,
    name: 'Campeonato Regional de Dança de Salão Desportiva 2026',
    description:
      'Prova WDSF — Standard, Latin e Ten Dance. Organização da Associação Regional.',
    venue: 'Pavilhão Desportivo Municipal, Porto',
    event_date: '2026-06-14',
    sport_type: 'danca_salao',
  },
  schedule: [
    {
      id: 's1',
      event_id: DEMO_EVENT_ID,
      title: 'Abertura de secretariat',
      description: 'Credenciação de atletas e entrega de números',
      starts_at: '2026-06-14T07:30:00+01:00',
      ends_at: '2026-06-14T09:00:00+01:00',
      location: 'Entrada principal',
      block_type: 'logistics',
      sort_order: 1,
    },
    {
      id: 's2',
      event_id: DEMO_EVENT_ID,
      title: 'Cerimónia de abertura',
      description: 'Apresentação de juízes e regras',
      starts_at: '2026-06-14T09:00:00+01:00',
      ends_at: '2026-06-14T09:30:00+01:00',
      location: 'Pista central',
      block_type: 'ceremony',
      sort_order: 2,
    },
    {
      id: 's3',
      event_id: DEMO_EVENT_ID,
      title: 'Standard — Ronda 1',
      description: 'Waltz e Quickstep',
      starts_at: '2026-06-14T09:30:00+01:00',
      ends_at: '2026-06-14T11:30:00+01:00',
      location: 'Pista A',
      block_type: 'competition',
      sort_order: 3,
    },
    {
      id: 's4',
      event_id: DEMO_EVENT_ID,
      title: 'Pausa para almoço',
      description: 'Buffet voluntários + atletas',
      starts_at: '2026-06-14T12:00:00+01:00',
      ends_at: '2026-06-14T13:30:00+01:00',
      location: 'Zona catering',
      block_type: 'break',
      sort_order: 4,
    },
    {
      id: 's5',
      event_id: DEMO_EVENT_ID,
      title: 'Latin — Ronda 1',
      description: 'Cha-cha e Jive',
      starts_at: '2026-06-14T13:30:00+01:00',
      ends_at: '2026-06-14T16:00:00+01:00',
      location: 'Pista A',
      block_type: 'competition',
      sort_order: 5,
    },
    {
      id: 's6',
      event_id: DEMO_EVENT_ID,
      title: 'Coffee break',
      description: 'Lanche para equipas e público',
      starts_at: '2026-06-14T16:00:00+01:00',
      ends_at: '2026-06-14T16:30:00+01:00',
      location: 'Zona catering',
      block_type: 'break',
      sort_order: 6,
    },
    {
      id: 's7',
      event_id: DEMO_EVENT_ID,
      title: 'Finais Ten Dance',
      description: 'Combinação Standard + Latin',
      starts_at: '2026-06-14T16:30:00+01:00',
      ends_at: '2026-06-14T18:30:00+01:00',
      location: 'Pista A',
      block_type: 'competition',
      sort_order: 7,
    },
    {
      id: 's8',
      event_id: DEMO_EVENT_ID,
      title: 'Cerimónia de premiação',
      description: 'Medalhas e troféus',
      starts_at: '2026-06-14T18:30:00+01:00',
      ends_at: '2026-06-14T19:30:00+01:00',
      location: 'Pista central',
      block_type: 'ceremony',
      sort_order: 8,
    },
  ],
  volunteers: [
    {
      id: 'v1',
      event_id: DEMO_EVENT_ID,
      name: 'Maria Silva',
      email: 'maria@email.pt',
      phone: '912000001',
      role: 'Catering',
      notes: null,
    },
    {
      id: 'v2',
      event_id: DEMO_EVENT_ID,
      name: 'Joana Costa',
      email: 'joana@email.pt',
      phone: '912000002',
      role: 'Catering',
      notes: null,
    },
    {
      id: 'v3',
      event_id: DEMO_EVENT_ID,
      name: 'Pedro Alves',
      email: 'pedro@email.pt',
      phone: '912000003',
      role: 'Logística',
      notes: null,
    },
    {
      id: 'v4',
      event_id: DEMO_EVENT_ID,
      name: 'Ana Ferreira',
      email: 'ana@email.pt',
      phone: '912000004',
      role: 'Secretariat',
      notes: null,
    },
  ],
  availability: [
    {
      id: 'a1',
      volunteer_id: 'v1',
      available_from: '2026-06-14T07:00:00+01:00',
      available_until: '2026-06-14T14:00:00+01:00',
      notes: 'Manhã e almoço',
    },
    {
      id: 'a2',
      volunteer_id: 'v2',
      available_from: '2026-06-14T11:00:00+01:00',
      available_until: '2026-06-14T19:00:00+01:00',
      notes: 'Tarde completa',
    },
    {
      id: 'a3',
      volunteer_id: 'v3',
      available_from: '2026-06-14T06:30:00+01:00',
      available_until: '2026-06-14T20:00:00+01:00',
      notes: 'Dia inteiro',
    },
    {
      id: 'a4',
      volunteer_id: 'v4',
      available_from: '2026-06-14T07:00:00+01:00',
      available_until: '2026-06-14T12:00:00+01:00',
      notes: 'Secretariat manhã',
    },
  ],
  contributions: [
    {
      id: 'c1',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v1',
      item_name: 'Bolo de chocolate',
      quantity: '2 fatias por mesa',
      needed_by: '2026-06-14T16:00:00+01:00',
      status: 'confirmed',
      notes: 'Para coffee break',
    },
    {
      id: 'c2',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v2',
      item_name: 'Quiche Lorraine',
      quantity: '3 unidades',
      needed_by: '2026-06-14T12:00:00+01:00',
      status: 'confirmed',
      notes: 'Almoço voluntários',
    },
    {
      id: 'c3',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v3',
      item_name: 'Garrafas de água 1.5L',
      quantity: '24 unidades',
      needed_by: '2026-06-14T07:30:00+01:00',
      status: 'confirmed',
      notes: 'Entrega à secretaria',
    },
    {
      id: 'c4',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v2',
      item_name: 'Sumo natural (laranja)',
      quantity: '5L',
      needed_by: '2026-06-14T12:00:00+01:00',
      status: 'pending',
      notes: null,
    },
  ],
  tasks: [
    {
      id: 't1',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v4',
      schedule_block_id: 's1',
      title: 'Credenciação de atletas',
      starts_at: '2026-06-14T07:30:00+01:00',
      ends_at: '2026-06-14T09:30:00+01:00',
      status: 'assigned',
      notes: 'Secretariat entrada',
    },
    {
      id: 't2',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v3',
      schedule_block_id: null,
      title: 'Montagem zona catering',
      starts_at: '2026-06-14T07:00:00+01:00',
      ends_at: '2026-06-14T08:30:00+01:00',
      status: 'assigned',
      notes: null,
    },
    {
      id: 't3',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v1',
      schedule_block_id: 's4',
      title: 'Servir almoço',
      starts_at: '2026-06-14T12:00:00+01:00',
      ends_at: '2026-06-14T13:30:00+01:00',
      status: 'assigned',
      notes: null,
    },
    {
      id: 't4',
      event_id: DEMO_EVENT_ID,
      volunteer_id: 'v2',
      schedule_block_id: 's6',
      title: 'Coffee break — montagem',
      starts_at: '2026-06-14T15:45:00+01:00',
      ends_at: '2026-06-14T16:30:00+01:00',
      status: 'assigned',
      notes: 'Coordenar com Maria (bolo)',
    },
  ],
}

const STORAGE_KEY = 'eventflow-data'

export function loadLocalData(): EventData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoEventData))
    return structuredClone(demoEventData)
  }
  return JSON.parse(raw) as EventData
}

export function saveLocalData(data: EventData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetLocalData(): EventData {
  localStorage.removeItem(STORAGE_KEY)
  return loadLocalData()
}
