-- Apaga todos os dados da app (mantém tabelas, funções e políticas RLS)
-- Ordem: filhos primeiro; CASCADE onde aplicável

truncate table revenue_entries restart identity cascade;
truncate table event_sponsors restart identity cascade;
truncate table volunteer_availability restart identity cascade;
truncate table volunteer_tasks restart identity cascade;
truncate table contributions restart identity cascade;
truncate table volunteers restart identity cascade;
truncate table schedule_blocks restart identity cascade;
truncate table events restart identity cascade;
truncate table volunteer_accounts restart identity cascade;
truncate table organizer_accounts restart identity cascade;
