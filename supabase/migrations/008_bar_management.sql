-- Gestão de bar: produtos, vendas, operação e snapshot de encerramento
create table if not exists bar_operations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references events(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  close_snapshot jsonb,
  revenue_sync_entry_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists bar_products (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  unit_price numeric(12, 2) not null default 0,
  quantity_collected numeric(12, 2) not null default 0,
  quantity_allocated numeric(12, 2) not null default 0,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bar_sales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  product_id uuid not null references bar_products(id) on delete restrict,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null,
  total_amount numeric(12, 2) not null,
  sold_at timestamptz not null default now(),
  notes text
);

create index if not exists idx_bar_products_event on bar_products (event_id, active);
create index if not exists idx_bar_sales_event on bar_sales (event_id, sold_at desc);
create index if not exists idx_bar_operations_closed on bar_operations (status, closed_at desc);

alter table bar_operations enable row level security;
alter table bar_products enable row level security;
alter table bar_sales enable row level security;

create policy "public all bar_operations" on bar_operations for all using (true);
create policy "public all bar_products" on bar_products for all using (true);
create policy "public all bar_sales" on bar_sales for all using (true);
