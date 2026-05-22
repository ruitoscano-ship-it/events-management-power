-- Contas de voluntários (telefone + PIN com hash)
-- Executar no SQL Editor APÓS schema.sql

create extension if not exists pgcrypto with schema extensions;

create table if not exists volunteer_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  constraint volunteer_accounts_phone_key unique (phone)
);

create index if not exists idx_volunteer_accounts_phone on volunteer_accounts (phone);

-- Ligação opcional em volunteers (se a coluna já existir, ignorar erro)
do $$
begin
  alter table volunteers
    add constraint volunteers_account_id_fkey
    foreign key (account_id) references volunteer_accounts(id) on delete set null;
exception
  when duplicate_object then null;
end $$;

alter table volunteer_accounts enable row level security;
-- Sem políticas públicas: acesso só via funções SECURITY DEFINER

create or replace function public.normalize_phone(p_phone text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
$$;

create or replace function public.register_volunteer(
  p_name text,
  p_phone text,
  p_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_phone text;
  v_name text;
  v_existing record;
  v_id uuid;
begin
  v_phone := normalize_phone(p_phone);
  v_name := trim(coalesce(p_name, ''));

  if length(v_name) < 2 then
    return jsonb_build_object('ok', false, 'error', 'Indica o teu nome.');
  end if;
  if length(v_phone) < 9 or length(v_phone) > 15 then
    return jsonb_build_object('ok', false, 'error', 'Telefone inválido (mín. 9 dígitos).');
  end if;
  if p_pin is null or p_pin !~ '^\d{4}$' then
    return jsonb_build_object('ok', false, 'error', 'O código deve ter 4 dígitos.');
  end if;

  select id, pin_hash into v_existing
  from volunteer_accounts
  where phone = v_phone;

  if found then
    if crypt(p_pin, v_existing.pin_hash) = v_existing.pin_hash then
      return jsonb_build_object(
        'ok', false,
        'error', 'Já tens conta com este telefone e código. Usa «Entrar».'
      );
    end if;
    return jsonb_build_object(
      'ok', false,
      'error', 'Este telefone já está registado com outro código.'
    );
  end if;

  insert into volunteer_accounts (name, phone, pin_hash)
  values (v_name, v_phone, crypt(p_pin, gen_salt('bf')))
  returning id into v_id;

  return jsonb_build_object(
    'ok', true,
    'account_id', v_id,
    'name', v_name,
    'phone', v_phone
  );
end;
$$;

create or replace function public.login_volunteer(
  p_phone text,
  p_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_phone text;
  v_row record;
begin
  v_phone := normalize_phone(p_phone);

  if length(v_phone) < 9 then
    return jsonb_build_object('ok', false, 'error', 'Telefone inválido.');
  end if;
  if p_pin is null or p_pin !~ '^\d{4}$' then
    return jsonb_build_object('ok', false, 'error', 'O código deve ter 4 dígitos.');
  end if;

  select id, name, phone, pin_hash into v_row
  from volunteer_accounts
  where phone = v_phone;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Telefone ou código incorretos.');
  end if;

  if crypt(p_pin, v_row.pin_hash) is distinct from v_row.pin_hash then
    return jsonb_build_object('ok', false, 'error', 'Telefone ou código incorretos.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'account_id', v_row.id,
    'name', v_row.name,
    'phone', v_row.phone
  );
end;
$$;

grant execute on function public.register_volunteer(text, text, text) to anon, authenticated;
grant execute on function public.login_volunteer(text, text) to anon, authenticated;
