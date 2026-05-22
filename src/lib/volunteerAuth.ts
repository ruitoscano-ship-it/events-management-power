import { isValidPhone, isValidPin } from './phone'
import { isSupabaseConfigured, supabase } from './supabase'
import type { EventCatalog, VolunteerAccount } from '../types'

export type AuthVolunteerResult =
  | { ok: true; account: VolunteerAccount }
  | { ok: false; error: string }

type RpcPayload = {
  ok: boolean
  error?: string
  account_id?: string
  name?: string
  phone?: string
}

function accountFromRpc(data: RpcPayload): VolunteerAccount | null {
  if (!data.ok || !data.account_id || !data.name || !data.phone) return null
  return {
    id: data.account_id,
    name: data.name,
    phone: data.phone,
    created_at: new Date().toISOString(),
  }
}

async function registerSupabase(
  name: string,
  phone: string,
  pin: string,
): Promise<AuthVolunteerResult> {
  if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
  const { data, error } = await supabase.rpc('register_volunteer', {
    p_name: name.trim(),
    p_phone: phone,
    p_pin: pin,
  })
  if (error) return { ok: false, error: error.message }
  const payload = data as RpcPayload
  const account = accountFromRpc(payload)
  if (!account) return { ok: false, error: payload.error ?? 'Registo falhou.' }
  return { ok: true, account }
}

async function loginSupabase(
  phone: string,
  pin: string,
): Promise<AuthVolunteerResult> {
  if (!supabase) return { ok: false, error: 'Supabase não configurado.' }
  const { data, error } = await supabase.rpc('login_volunteer', {
    p_phone: phone,
    p_pin: pin,
  })
  if (error) return { ok: false, error: error.message }
  const payload = data as RpcPayload
  const account = accountFromRpc(payload)
  if (!account) return { ok: false, error: payload.error ?? 'Entrada falhou.' }
  return { ok: true, account }
}

export async function registerVolunteerAccount(
  catalog: EventCatalog,
  name: string,
  phone: string,
  pin: string,
): Promise<{ catalog: EventCatalog; result: AuthVolunteerResult }> {
  if (!name.trim()) {
    return { catalog, result: { ok: false, error: 'Indica o teu nome.' } }
  }
  if (!isValidPhone(phone)) {
    return { catalog, result: { ok: false, error: 'Telefone inválido (mín. 9 dígitos).' } }
  }
  if (!isValidPin(pin)) {
    return { catalog, result: { ok: false, error: 'O código deve ter 4 dígitos.' } }
  }

  if (!isSupabaseConfigured) {
    return {
      catalog,
      result: {
        ok: false,
        error:
          'Servidor não configurado. Contacta o organizador (Supabase em falta neste site).',
      },
    }
  }

  const result = await registerSupabase(name, phone, pin)
  return { catalog, result }
}

export async function loginVolunteerAccount(
  _catalog: EventCatalog,
  phone: string,
  pin: string,
): Promise<AuthVolunteerResult> {
  if (!isValidPhone(phone)) {
    return { ok: false, error: 'Telefone inválido.' }
  }
  if (!isValidPin(pin)) {
    return { ok: false, error: 'O código deve ter 4 dígitos.' }
  }

  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error:
        'Servidor não configurado. Contacta o organizador (Supabase em falta neste site).',
    }
  }

  return loginSupabase(phone, pin)
}
