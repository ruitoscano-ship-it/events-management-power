-- Patrocinadores do evento (registo e acompanhamento)
create table if not exists event_sponsors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  sponsorship_kind text not null default 'cash'
    check (sponsorship_kind in ('cash', 'in_kind', 'mixed')),
  amount numeric(12, 2),
  in_kind_description text,
  status text not null default 'promised'
    check (status in ('promised', 'confirmed', 'received', 'cancelled')),
  contact_name text,
  contact_email text,
  notes text,
  promised_at date,
  received_at date,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_sponsors_event on event_sponsors (event_id);

-- Receitas: previsão e valores registados (bar, bilhetes, outros)
create table if not exists revenue_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  source text not null
    check (source in ('bar', 'tickets', 'other')),
  entry_type text not null
    check (entry_type in ('forecast', 'actual')),
  description text,
  amount numeric(12, 2) not null default 0,
  quantity numeric(12, 2),
  unit_price numeric(12, 2),
  recorded_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_revenue_entries_event on revenue_entries (event_id, source, entry_type);

alter table event_sponsors enable row level security;
alter table revenue_entries enable row level security;

create policy "public all event_sponsors" on event_sponsors for all using (true);
create policy "public all revenue_entries" on revenue_entries for all using (true);
