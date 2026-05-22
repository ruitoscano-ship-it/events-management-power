-- Contas de organizador (admin do evento)
-- Executar no SQL Editor APÓS volunteer_accounts.sql (usa pgcrypto)

create extension if not exists pgcrypto with schema extensions;

create table if not exists organizer_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  display_name text,
  created_at timestamptz not null default now(),
  constraint organizer_accounts_username_key unique (username)
);

create index if not exists idx_organizer_accounts_username on organizer_accounts (username);

alter table organizer_accounts enable row level security;
-- Sem políticas públicas: acesso só via funções SECURITY DEFINER

create or replace function public.login_organizer(
  p_username text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user text;
  v_row record;
begin
  v_user := lower(trim(coalesce(p_username, '')));

  if length(v_user) < 2 then
    return jsonb_build_object('ok', false, 'error', 'Indica o utilizador.');
  end if;
  if coalesce(p_password, '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Indica a palavra-passe.');
  end if;

  select id, username, display_name, password_hash into v_row
  from organizer_accounts
  where lower(username) = v_user;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Utilizador ou palavra-passe incorretos.');
  end if;

  if crypt(p_password, v_row.password_hash) is distinct from v_row.password_hash then
    return jsonb_build_object('ok', false, 'error', 'Utilizador ou palavra-passe incorretos.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'organizer_id', v_row.id,
    'username', v_row.username,
    'display_name', coalesce(v_row.display_name, v_row.username)
  );
end;
$$;

grant execute on function public.login_organizer(text, text) to anon, authenticated;

-- Conta inicial: admin / admin (alterar no SQL Editor em produção)
insert into organizer_accounts (username, password_hash, display_name)
values (
  'admin',
  crypt('admin', gen_salt('bf')),
  'Administrador'
)
on conflict (username) do nothing;
