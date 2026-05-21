-- Dados de exemplo: Campeonato de Dança de Salão Desportiva
-- Substituir event_id após criar o evento, ou usar o insert completo abaixo

insert into events (id, name, description, venue, event_date, sport_type)
values (
  'a0000000-0000-4000-8000-000000000001',
  'Campeonato Regional de Dança de Salão Desportiva 2026',
  'Prova WDSF — Standard, Latin e Ten Dance. Organização da Associação Regional.',
  'Pavilhão Desportivo Municipal, Porto',
  '2026-06-14',
  'danca_salao'
);

insert into schedule_blocks (event_id, title, description, starts_at, ends_at, location, block_type, sort_order) values
('a0000000-0000-4000-8000-000000000001', 'Abertura de secretariat', 'Credenciação de atletas e entrega de números', '2026-06-14 07:30:00+01', '2026-06-14 09:00:00+01', 'Entrada principal', 'logistics', 1),
('a0000000-0000-4000-8000-000000000001', 'Cerimónia de abertura', 'Apresentação de juízes e regras', '2026-06-14 09:00:00+01', '2026-06-14 09:30:00+01', 'Pista central', 'ceremony', 2),
('a0000000-0000-4000-8000-000000000001', 'Standard — Ronda 1', 'Waltz e Quickstep', '2026-06-14 09:30:00+01', '2026-06-14 11:30:00+01', 'Pista A', 'competition', 3),
('a0000000-0000-4000-8000-000000000001', 'Pausa para almoço', 'Buffet voluntários + atletas', '2026-06-14 12:00:00+01', '2026-06-14 13:30:00+01', 'Zona catering', 'break', 4),
('a0000000-0000-4000-8000-000000000001', 'Latin — Ronda 1', 'Cha-cha e Jive', '2026-06-14 13:30:00+01', '2026-06-14 16:00:00+01', 'Pista A', 'competition', 5),
('a0000000-0000-4000-8000-000000000001', 'Coffee break', 'Lanche para equipas e público', '2026-06-14 16:00:00+01', '2026-06-14 16:30:00+01', 'Zona catering', 'break', 6),
('a0000000-0000-4000-8000-000000000001', 'Finais Ten Dance', 'Combinação Standard + Latin', '2026-06-14 16:30:00+01', '2026-06-14 18:30:00+01', 'Pista A', 'competition', 7),
('a0000000-0000-4000-8000-000000000001', 'Cerimónia de premiação', 'Medalhas e troféus', '2026-06-14 18:30:00+01', '2026-06-14 19:30:00+01', 'Pista central', 'ceremony', 8);

insert into volunteers (id, event_id, name, email, phone, role) values
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Maria Silva', 'maria@email.pt', '912000001', 'Catering'),
('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Joana Costa', 'joana@email.pt', '912000002', 'Catering'),
('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Pedro Alves', 'pedro@email.pt', '912000003', 'Logística'),
('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Ana Ferreira', 'ana@email.pt', '912000004', 'Secretariat');

insert into volunteer_availability (volunteer_id, available_from, available_until, notes) values
('b0000000-0000-4000-8000-000000000001', '2026-06-14 07:00:00+01', '2026-06-14 14:00:00+01', 'Manhã e almoço'),
('b0000000-0000-4000-8000-000000000002', '2026-06-14 11:00:00+01', '2026-06-14 19:00:00+01', 'Tarde completa'),
('b0000000-0000-4000-8000-000000000003', '2026-06-14 06:30:00+01', '2026-06-14 20:00:00+01', 'Dia inteiro'),
('b0000000-0000-4000-8000-000000000004', '2026-06-14 07:00:00+01', '2026-06-14 12:00:00+01', 'Secretariat manhã');

insert into contributions (event_id, volunteer_id, item_name, quantity, needed_by, status, notes) values
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Bolo de chocolate', '2 fatias por mesa', '2026-06-14 16:00:00+01', 'confirmed', 'Para coffee break'),
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Quiche Lorraine', '3 unidades', '2026-06-14 12:00:00+01', 'confirmed', 'Almoço voluntários'),
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'Garrafas de água 1.5L', '24 unidades', '2026-06-14 07:30:00+01', 'confirmed', 'Entrega à secretaria'),
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Sumo natural (laranja)', '5L', '2026-06-14 12:00:00+01', 'pending', null);

insert into volunteer_tasks (event_id, volunteer_id, title, starts_at, ends_at, status, notes) values
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000004', 'Credenciação de atletas', '2026-06-14 07:30:00+01', '2026-06-14 09:30:00+01', 'assigned', 'Secretariat entrada'),
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'Montagem zona catering', '2026-06-14 07:00:00+01', '2026-06-14 08:30:00+01', 'assigned', null),
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Servir almoço', '2026-06-14 12:00:00+01', '2026-06-14 13:30:00+01', 'assigned', null),
('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Coffee break — montagem', '2026-06-14 15:45:00+01', '2026-06-14 16:30:00+01', 'assigned', 'Coordenar com Maria (bolo)');
