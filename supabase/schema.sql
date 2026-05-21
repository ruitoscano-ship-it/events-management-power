-- EventFlow: schema para gestão de eventos desportivos
-- Executar no SQL Editor do Supabase

create extension if not exists "uuid-ossp";

-- Eventos
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  venue text,
  event_date date not null,
  sport_type text default 'danca_salao',
  pairs_count int,
  day_label text,
  created_at timestamptz default now()
);

-- Blocos do cronograma (timeline)
create table schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  block_type text not null default 'activity'
    check (block_type in ('activity', 'competition', 'break', 'ceremony', 'logistics')),
  category text not null default 'activity'
    check (category in ('setup', 'logistics', 'standard', 'latinas', 'break', 'ceremony', 'activity')),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Voluntários
create table volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text,
  notes text,
  created_at timestamptz default now()
);

-- Disponibilidade (janelas horárias)
create table volunteer_availability (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references volunteers(id) on delete cascade,
  available_from timestamptz not null,
  available_until timestamptz not null,
  notes text
);

-- Contribuições materiais ("quem leva o quê")
create table contributions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  volunteer_id uuid references volunteers(id) on delete set null,
  item_name text not null,
  quantity text,
  needed_by timestamptz,
  status text default 'confirmed'
    check (status in ('pending', 'confirmed', 'delivered')),
  notes text
);

-- Tarefas / atividades atribuídas a voluntários
create table volunteer_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  volunteer_id uuid references volunteers(id) on delete set null,
  schedule_block_id uuid references schedule_blocks(id) on delete set null,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text default 'assigned'
    check (status in ('assigned', 'in_progress', 'done')),
  notes text
);

create index idx_schedule_event on schedule_blocks(event_id, starts_at);
create index idx_volunteers_event on volunteers(event_id);
create index idx_contributions_event on contributions(event_id);

-- RLS (ajustar conforme auth)
alter table events enable row level security;
alter table schedule_blocks enable row level security;
alter table volunteers enable row level security;
alter table volunteer_availability enable row level security;
alter table contributions enable row level security;
alter table volunteer_tasks enable row level security;

create policy "public read events" on events for select using (true);
create policy "public insert events" on events for insert with check (true);
create policy "public update events" on events for update using (true);
create policy "public delete events" on events for delete using (true);

create policy "public all schedule" on schedule_blocks for all using (true);
create policy "public all volunteers" on volunteers for all using (true);
create policy "public all availability" on volunteer_availability for all using (true);
create policy "public all contributions" on contributions for all using (true);
create policy "public all tasks" on volunteer_tasks for all using (true);
