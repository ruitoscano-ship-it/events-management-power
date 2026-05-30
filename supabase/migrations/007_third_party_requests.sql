-- Pedidos a entidades de apoio (câmara municipal, freguesia, etc.)
create table if not exists third_party_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  organization_name text not null,
  organization_kind text not null default 'municipality'
    check (organization_kind in (
      'municipality', 'parish', 'civil_protection', 'venue_owner', 'police', 'other'
    )),
  material_category text not null default 'other'
    check (material_category in (
      'sound', 'chairs', 'tables', 'barriers', 'lighting', 'tents', 'signage', 'other'
    )),
  item_description text not null,
  quantity text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'denied', 'fulfilled', 'cancelled')),
  reference_number text,
  contact_name text,
  contact_email text,
  contact_phone text,
  requested_at date,
  needed_by date,
  submitted_at date,
  resolved_at date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_third_party_requests_event
  on third_party_requests (event_id, status);

alter table third_party_requests enable row level security;

create policy "public all third_party_requests"
  on third_party_requests for all using (true);
