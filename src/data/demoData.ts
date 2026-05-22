import { normalizeEventData } from '../lib/normalize'
import type { EventData, ScheduleBlock } from '../types'

export const DEMO_EVENT_ID = 'a0000000-0000-4000-8000-000000000001'

function block(
  partial: Omit<ScheduleBlock, 'event_id'>,
): ScheduleBlock {
  return { ...partial, event_id: DEMO_EVENT_ID }
}

export const demoEventData: EventData = {
  event: {
    id: DEMO_EVENT_ID,
    name: 'CAMPEONATO NACIONAL DE DANÇA DESPORTIVA',
    description: 'Prova WDSF — Standard, Latin e Ten Dance.',
    venue: 'Cascais',
    event_date: '2026-06-13',
    sport_type: 'danca_salao',
    pairs_count: 192,
    day_label: 'Sábado',
    edition_label: 'FPDD — EDIÇÃO 2026',
  },
  schedule: [
    block({
      id: 's1',
      title: 'Abertura do pavilhão & Setup',
      description: null,
      starts_at: '2026-06-13T07:00:00+01:00',
      ends_at: '2026-06-13T08:00:00+01:00',
      location: 'GERAL',
      block_type: 'logistics',
      category: 'setup',
      sort_order: 1,
    }),
    block({
      id: 's2',
      title: 'Receção & secretariat',
      description: 'Credenciação de atletas e entrega de números',
      starts_at: '2026-06-13T08:00:00+01:00',
      ends_at: '2026-06-13T09:00:00+01:00',
      location: 'FOYER',
      block_type: 'logistics',
      category: 'logistics',
      sort_order: 2,
    }),
    block({
      id: 's-warm',
      title: 'Aquecimento pista — todos atletas',
      description: null,
      starts_at: '2026-06-13T08:30:00+01:00',
      ends_at: '2026-06-13T09:00:00+01:00',
      location: 'PISTA A',
      block_type: 'activity',
      category: 'setup',
      sort_order: 2,
    }),
    block({
      id: 's3',
      title: 'Standard Juvenis II',
      description: '18 pares — VW · T · VV · SF · QS',
      starts_at: '2026-06-13T09:00:00+01:00',
      ends_at: '2026-06-13T09:30:00+01:00',
      location: 'PISTA A',
      block_type: 'competition',
      category: 'standard',
      sort_order: 3,
    }),
    block({
      id: 's4',
      title: 'Standard Juvenil I',
      description: '22 pares — VW · T · VV · SF · QS',
      starts_at: '2026-06-13T09:30:00+01:00',
      ends_at: '2026-06-13T10:30:00+01:00',
      location: 'PISTA A',
      block_type: 'competition',
      category: 'standard',
      sort_order: 4,
    }),
    block({
      id: 's5',
      title: 'Standard Adultos',
      description: '32 pares — VW · T · VV · SF · QS',
      starts_at: '2026-06-13T10:30:00+01:00',
      ends_at: '2026-06-13T12:00:00+01:00',
      location: 'PISTA A',
      block_type: 'competition',
      category: 'standard',
      sort_order: 5,
    }),
    block({
      id: 's6',
      title: 'Almoço staff (rotativo)',
      description: null,
      starts_at: '2026-06-13T12:00:00+01:00',
      ends_at: '2026-06-13T13:30:00+01:00',
      location: 'CAFETARIA',
      block_type: 'break',
      category: 'break',
      sort_order: 6,
    }),
    block({
      id: 's7',
      title: 'Latinas Juvenis II',
      description: '16 pares — CC · SB · RH · PAS · Jive',
      starts_at: '2026-06-13T13:30:00+01:00',
      ends_at: '2026-06-13T14:30:00+01:00',
      location: 'PISTA A',
      block_type: 'competition',
      category: 'latinas',
      sort_order: 7,
    }),
    block({
      id: 's8',
      title: 'Latinas Juvenil I',
      description: '20 pares — CC · SB · RH · PAS · Jive',
      starts_at: '2026-06-13T14:30:00+01:00',
      ends_at: '2026-06-13T16:00:00+01:00',
      location: 'PISTA A',
      block_type: 'competition',
      category: 'latinas',
      sort_order: 8,
    }),
    block({
      id: 's9',
      title: 'Coffee break',
      description: 'Lanche para equipas e público',
      starts_at: '2026-06-13T16:00:00+01:00',
      ends_at: '2026-06-13T16:30:00+01:00',
      location: 'CAFETARIA',
      block_type: 'break',
      category: 'break',
      sort_order: 9,
    }),
    block({
      id: 's10',
      title: 'Finais Ten Dance',
      description: 'Combinação Standard + Latin — 12 pares',
      starts_at: '2026-06-13T16:30:00+01:00',
      ends_at: '2026-06-13T18:30:00+01:00',
      location: 'PISTA A',
      block_type: 'competition',
      category: 'standard',
      sort_order: 10,
    }),
    block({
      id: 's11',
      title: 'Cerimónia de premiação',
      description: 'Medalhas e troféus',
      starts_at: '2026-06-13T18:30:00+01:00',
      ends_at: '2026-06-13T23:30:00+01:00',
      location: 'PISTA A',
      block_type: 'ceremony',
      category: 'ceremony',
      sort_order: 11,
    }),
  ],
  volunteers: [
    { id: 'v-ma', event_id: DEMO_EVENT_ID, name: 'Maria Antunes', email: 'maria.antunes@email.pt', phone: '912000000', role: 'COORD. PISTA', notes: null, active: true },
    { id: 'v-rc', event_id: DEMO_EVENT_ID, name: 'Rui Costa', email: null, phone: null, role: 'Pista', notes: null, active: true },
    { id: 'v-bs', event_id: DEMO_EVENT_ID, name: 'Beatriz Silva', email: null, phone: null, role: 'Pista', notes: null, active: true },
    { id: 'v-ps', event_id: DEMO_EVENT_ID, name: 'Pedro Santos', email: null, phone: null, role: 'Logística', notes: null, active: true },
    { id: 'v-jt', event_id: DEMO_EVENT_ID, name: 'Joana Teixeira', email: null, phone: null, role: 'Catering', notes: null, active: true },
    { id: 'v-ev', event_id: DEMO_EVENT_ID, name: 'Eva Vieira', email: null, phone: null, role: 'Catering', notes: null, active: true },
    { id: 'v-ha', event_id: DEMO_EVENT_ID, name: 'Hugo Almeida', email: null, phone: null, role: 'Pista', notes: null, active: true },
    { id: 'v-an', event_id: DEMO_EVENT_ID, name: 'Ana Nunes', email: null, phone: null, role: 'Secretariat', notes: null, active: true },
    { id: 'v-jl', event_id: DEMO_EVENT_ID, name: 'Joana Lopes', email: null, phone: null, role: 'Secretariat', notes: null, active: true },
    { id: 'v-mg', event_id: DEMO_EVENT_ID, name: 'Maria Garcia', email: null, phone: null, role: 'Secretariat', notes: null, active: true },
    { id: 'v-cd', event_id: DEMO_EVENT_ID, name: 'Carlos Dias', email: null, phone: null, role: 'Setup', notes: null, active: false },
    { id: 'v-ms', event_id: DEMO_EVENT_ID, name: 'Maria Silva', email: 'maria@email.pt', phone: '912000001', role: 'Catering', notes: null, active: true },
    { id: 'v-jc', event_id: DEMO_EVENT_ID, name: 'Joana Costa', email: 'joana@email.pt', phone: '912000002', role: 'Catering', notes: null, active: true },
  ],
  availability: [
    { id: 'a-ma1', volunteer_id: 'v-ma', available_from: '2026-06-13T07:30:00+01:00', available_until: '2026-06-13T13:00:00+01:00', notes: null },
    { id: 'a-ma2', volunteer_id: 'v-ma', available_from: '2026-06-13T14:30:00+01:00', available_until: '2026-06-13T19:00:00+01:00', notes: null },
    { id: 'a1', volunteer_id: 'v-rc', available_from: '2026-06-13T06:30:00+01:00', available_until: '2026-06-13T20:00:00+01:00', notes: 'Dia inteiro' },
    { id: 'a2', volunteer_id: 'v-bs', available_from: '2026-06-13T07:00:00+01:00', available_until: '2026-06-13T19:00:00+01:00', notes: null },
    { id: 'a3', volunteer_id: 'v-ps', available_from: '2026-06-13T06:30:00+01:00', available_until: '2026-06-13T23:00:00+01:00', notes: null },
    { id: 'a4', volunteer_id: 'v-jt', available_from: '2026-06-13T11:00:00+01:00', available_until: '2026-06-13T19:00:00+01:00', notes: null },
    { id: 'a5', volunteer_id: 'v-an', available_from: '2026-06-13T07:00:00+01:00', available_until: '2026-06-13T14:00:00+01:00', notes: 'Manhã' },
    { id: 'a6', volunteer_id: 'v-ms', available_from: '2026-06-13T07:00:00+01:00', available_until: '2026-06-13T14:00:00+01:00', notes: null },
  ],
  contributions: [
    { id: 'c-ma1', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', item_name: 'Bolo de chocolate (8 pessoas)', quantity: 'x1', needed_by: '2026-06-13T12:00:00+01:00', status: 'confirmed', notes: null, destination: 'MESA JURADOS' },
    { id: 'c-ma2', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', item_name: 'Bolos da casa (tabuleiro)', quantity: 'x1', needed_by: '2026-06-13T14:00:00+01:00', status: 'confirmed', notes: null, destination: 'BAR' },
    { id: 'c-ma3', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', item_name: 'Spray de gelo', quantity: 'x2', needed_by: '2026-06-13T08:00:00+01:00', status: 'confirmed', notes: null, destination: 'KIT PRIMEIROS SOCORROS' },
    { id: 'c-open1', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Quiche de legumes', quantity: '2 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 2 },
    { id: 'c-open2', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Pão com chouriço', quantity: '2 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 2 },
    { id: 'c-open3', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Sanduíches mistas', quantity: '1 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 1 },
    { id: 'c-open4', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Garrafão de água 5L', quantity: '2 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 2 },
    { id: 'c-open5', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Cabos XLR longos (10m)', quantity: '1 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 1 },
    { id: 'c-open6', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Extensão 25m', quantity: '1 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 1 },
    { id: 'c-open7', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Fitas de marcação', quantity: '3 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 3 },
    { id: 'c-open8', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Guardanapos (pack)', quantity: '2 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 2 },
    { id: 'c-open9', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Copos descartáveis', quantity: '2 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 2 },
    { id: 'c-open10', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Toalhas de mesa', quantity: '4 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 4 },
    { id: 'c-open11', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Termómetro infravermelhos', quantity: '1 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 1 },
    { id: 'c-open12', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Alicates e fita cola', quantity: '1 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 1 },
    { id: 'c-open13', event_id: DEMO_EVENT_ID, volunteer_id: null, item_name: 'Caixa de primeiros socorros (refill)', quantity: '1 faltam', needed_by: null, status: 'pending', notes: null, needed_count: 1 },
    { id: 'c1', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ms', item_name: 'Bolo de chocolate', quantity: 'x1', needed_by: '2026-06-13T16:00:00+01:00', status: 'confirmed', notes: null, destination: 'CAFETARIA' },
    { id: 'c2', event_id: DEMO_EVENT_ID, volunteer_id: 'v-jc', item_name: 'Quiche Lorraine', quantity: 'x3', needed_by: '2026-06-13T12:00:00+01:00', status: 'confirmed', notes: null, destination: 'STAFF' },
    { id: 'c-done', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ps', item_name: 'Garrafas de água 1.5L', quantity: 'x24', needed_by: '2026-06-13T07:30:00+01:00', status: 'delivered', notes: null, destination: 'GERAL' },
    { id: 'c4', event_id: DEMO_EVENT_ID, volunteer_id: 'v-jt', item_name: 'Sumo natural (laranja)', quantity: 'x1', needed_by: '2026-06-13T12:00:00+01:00', status: 'pending', notes: null, destination: 'BAR' },
  ],
  tasks: [
    { id: 't-ma1', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's-warm', title: 'Aquecimento pista', starts_at: '2026-06-13T08:30:00+01:00', ends_at: '2026-06-13T09:00:00+01:00', status: 'assigned', notes: null },
    { id: 't-ma2', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's3', title: 'Standard Juvenis II', starts_at: '2026-06-13T09:00:00+01:00', ends_at: '2026-06-13T10:00:00+01:00', status: 'assigned', notes: null },
    { id: 't-ma3', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's4', title: 'Standard Juvenil I', starts_at: '2026-06-13T10:00:00+01:00', ends_at: '2026-06-13T11:00:00+01:00', status: 'assigned', notes: null },
    { id: 't-ma4', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's5', title: 'Standard Adultos', starts_at: '2026-06-13T11:00:00+01:00', ends_at: '2026-06-13T12:00:00+01:00', status: 'in_progress', notes: null },
    { id: 't-ma5', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's7', title: 'Latinas Juvenis II', starts_at: '2026-06-13T13:30:00+01:00', ends_at: '2026-06-13T14:30:00+01:00', status: 'assigned', notes: null },
    { id: 't-ma6', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's8', title: 'Latinas Juvenil I', starts_at: '2026-06-13T14:30:00+01:00', ends_at: '2026-06-13T16:00:00+01:00', status: 'assigned', notes: null },
    { id: 't-ma7', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ma', schedule_block_id: 's10', title: 'Finais Ten Dance', starts_at: '2026-06-13T16:30:00+01:00', ends_at: '2026-06-13T18:30:00+01:00', status: 'assigned', notes: null },
    { id: 't1', event_id: DEMO_EVENT_ID, volunteer_id: 'v-rc', schedule_block_id: 's1', title: 'Setup pavilhão', starts_at: '2026-06-13T07:00:00+01:00', ends_at: '2026-06-13T08:00:00+01:00', status: 'assigned', notes: null },
    { id: 't2', event_id: DEMO_EVENT_ID, volunteer_id: 'v-bs', schedule_block_id: 's1', title: 'Setup pavilhão', starts_at: '2026-06-13T07:00:00+01:00', ends_at: '2026-06-13T08:00:00+01:00', status: 'assigned', notes: null },
    { id: 't3', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ps', schedule_block_id: 's1', title: 'Setup pavilhão', starts_at: '2026-06-13T07:00:00+01:00', ends_at: '2026-06-13T08:00:00+01:00', status: 'assigned', notes: null },
    { id: 't4', event_id: DEMO_EVENT_ID, volunteer_id: 'v-an', schedule_block_id: 's2', title: 'Secretariat', starts_at: '2026-06-13T08:00:00+01:00', ends_at: '2026-06-13T09:00:00+01:00', status: 'assigned', notes: null },
    { id: 't5', event_id: DEMO_EVENT_ID, volunteer_id: 'v-mg', schedule_block_id: 's2', title: 'Secretariat', starts_at: '2026-06-13T08:00:00+01:00', ends_at: '2026-06-13T09:00:00+01:00', status: 'assigned', notes: null },
    { id: 't6', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ps', schedule_block_id: 's2', title: 'Receção', starts_at: '2026-06-13T08:00:00+01:00', ends_at: '2026-06-13T09:00:00+01:00', status: 'assigned', notes: null },
    { id: 't7', event_id: DEMO_EVENT_ID, volunteer_id: 'v-rc', schedule_block_id: 's3', title: 'Pista Standard', starts_at: '2026-06-13T09:00:00+01:00', ends_at: '2026-06-13T10:00:00+01:00', status: 'assigned', notes: null },
    { id: 't8', event_id: DEMO_EVENT_ID, volunteer_id: 'v-bs', schedule_block_id: 's3', title: 'Pista Standard', starts_at: '2026-06-13T09:00:00+01:00', ends_at: '2026-06-13T10:00:00+01:00', status: 'assigned', notes: null },
    { id: 't-warm1', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ha', schedule_block_id: 's-warm', title: 'Aquecimento', starts_at: '2026-06-13T08:30:00+01:00', ends_at: '2026-06-13T09:00:00+01:00', status: 'assigned', notes: null },
    { id: 't10', event_id: DEMO_EVENT_ID, volunteer_id: 'v-jt', schedule_block_id: 's6', title: 'Almoço staff', starts_at: '2026-06-13T12:00:00+01:00', ends_at: '2026-06-13T13:30:00+01:00', status: 'assigned', notes: null },
    { id: 't11', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ev', schedule_block_id: 's6', title: 'Almoço staff', starts_at: '2026-06-13T12:00:00+01:00', ends_at: '2026-06-13T13:30:00+01:00', status: 'assigned', notes: null },
    { id: 't12', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ha', schedule_block_id: 's7', title: 'Pista Latinas', starts_at: '2026-06-13T13:30:00+01:00', ends_at: '2026-06-13T14:30:00+01:00', status: 'assigned', notes: null },
    { id: 't13', event_id: DEMO_EVENT_ID, volunteer_id: 'v-ms', schedule_block_id: 's9', title: 'Coffee break', starts_at: '2026-06-13T15:45:00+01:00', ends_at: '2026-06-13T16:30:00+01:00', status: 'assigned', notes: null },
    { id: 't14', event_id: DEMO_EVENT_ID, volunteer_id: 'v-jc', schedule_block_id: 's9', title: 'Coffee break', starts_at: '2026-06-13T15:45:00+01:00', ends_at: '2026-06-13T16:30:00+01:00', status: 'assigned', notes: null },
  ],
  venueLayout: null,
  sponsors: [],
  revenueEntries: [],
  auditLog: [
    { id: 'log-1', at: '2026-05-15T09:00:00+01:00', action: 'event.updated', summary: 'Evento configurado: Cascais, 192 pares', entity_type: 'event', entity_id: DEMO_EVENT_ID },
    { id: 'log-2', at: '2026-05-16T10:30:00+01:00', action: 'volunteer.created', summary: 'Voluntário criado: Maria Antunes', entity_type: 'volunteer', entity_id: 'v-ma' },
    { id: 'log-3', at: '2026-05-18T14:00:00+01:00', action: 'contribution.created', summary: 'Necessidade criada: Quiche de legumes', entity_type: 'contribution', entity_id: 'c-open1' },
    { id: 'log-4', at: '2026-05-19T11:00:00+01:00', action: 'volunteer.deactivated', summary: 'Inativado: Carlos Dias', entity_type: 'volunteer', entity_id: 'v-cd' },
    { id: 'log-5', at: '2026-05-20T08:15:00+01:00', action: 'contribution.completed', summary: 'Concluído: Garrafas de água 1.5L', entity_type: 'contribution', entity_id: 'c-done' },
  ],
}

const STORAGE_KEY = 'eventflow-data-v4'

export function loadLocalData(): EventData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const fresh = normalizeEventData(structuredClone(demoEventData))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  }
  return normalizeEventData(JSON.parse(raw) as EventData)
}

export function saveLocalData(data: EventData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetLocalData(): EventData {
  localStorage.removeItem(STORAGE_KEY)
  return loadLocalData()
}
