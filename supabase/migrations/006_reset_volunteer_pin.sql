-- Organizador: redefinir PIN de 4 dígitos de uma conta de voluntário
create or replace function public.reset_volunteer_pin(
  p_pin text,
  p_account_id uuid default null,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_phone text;
  v_id uuid;
begin
  if p_pin is null or p_pin !~ '^\d{4}$' then
    return jsonb_build_object('ok', false, 'error', 'O código deve ter 4 dígitos.');
  end if;

  if p_account_id is not null then
    v_id := p_account_id;
  elsif p_phone is not null then
    v_phone := normalize_phone(p_phone);
    if length(v_phone) < 9 then
      return jsonb_build_object('ok', false, 'error', 'Telefone inválido.');
    end if;
    select id into v_id from volunteer_accounts where phone = v_phone;
    if not found then
      return jsonb_build_object(
        'ok', false,
        'error', 'Não existe conta de acesso com este telefone. O voluntário deve registar-se na app.'
      );
    end if;
  else
    return jsonb_build_object('ok', false, 'error', 'Conta de voluntário não indicada.');
  end if;

  update volunteer_accounts
  set pin_hash = crypt(p_pin, gen_salt('bf'))
  where id = v_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Conta não encontrada.');
  end if;

  return jsonb_build_object('ok', true, 'account_id', v_id);
end;
$$;

grant execute on function public.reset_volunteer_pin(text, uuid, text) to anon, authenticated;
