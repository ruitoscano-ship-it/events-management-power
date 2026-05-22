-- Planta do salão (zonas: pista, júri, sponsors, apoio, mesas)
create table if not exists venue_layouts (
  event_id uuid primary key references events(id) on delete cascade,
  layout_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table venue_layouts enable row level security;

create policy "public all venue_layouts" on venue_layouts for all using (true);
