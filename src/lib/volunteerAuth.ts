import { findAccountByPhone } from './catalog'
import { isValidPhone, isValidPin, normalizePhone } from './phone'
import { hashPin, verifyPin } from './pinHash'
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

async function registerLocalHashed(
  catalog: EventCatalog,
  name: string,
  phone: string,
  pin: string,
): Promise<{ result: AuthVolunteerResult; catalog: EventCatalog }> {
  const normalized = normalizePhone(phone)
  const existing = findAccountByPhone(catalog, normalized)

  if (existing?.pin_hash) {
    const same = await verifyPin(pin, existing.pin_hash)
    if (same) {
      return {
        catalog,
        result: {
          ok: false,
          error: 'Já tens conta com este telefone e código. Usa «Entrar».',
        },
      }
    }
    return {
      catalog,
      result: {
        ok: false,
        error: 'Este telefone já está registado com outro código.',
      },
    }
  }

  if (existing) {
    return {
      catalog,
      result: { ok: false, error: 'Este número de telefone já está registado.' },
    }
  }

  const pin_hash = await hashPin(pin)
  const account: VolunteerAccount = {
    id: crypto.randomUUID(),
    name: name.trim(),
    phone: normalized,
    pin_hash,
    created_at: new Date().toISOString(),
  }
  const next: EventCatalog = {
    ...catalog,
    accounts: [...catalog.accounts, account],
  }
  return { catalog: next, result: { ok: true, account } }
}

async function loginLocalHashed(
  catalog: EventCatalog,
  phone: string,
  pin: string,
): Promise<AuthVolunteerResult> {
  const account = findAccountByPhone(catalog, phone)
  if (!account) {
    return { ok: false, error: 'Telefone ou código incorretos.' }
  }

  if (account.pin_hash) {
    const valid = await verifyPin(pin, account.pin_hash)
    if (!valid) return { ok: false, error: 'Telefone ou código incorretos.' }
    return { ok: true, account: { ...account, pin_hash: undefined } }
  }

  // Legado: conta antiga com pin em texto plano
  if ((account as VolunteerAccount & { pin?: string }).pin === pin) {
    return { ok: true, account }
  }

  return { ok: false, error: 'Telefone ou código incorretos.' }
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

  if (isSupabaseConfigured) {
    const result = await registerSupabase(name, phone, pin)
    return { catalog, result }
  }

  return registerLocalHashed(catalog, name, phone, pin)
}

export async function loginVolunteerAccount(
  catalog: EventCatalog,
  phone: string,
  pin: string,
): Promise<AuthVolunteerResult> {
  if (!isValidPhone(phone)) {
    return { ok: false, error: 'Telefone inválido.' }
  }
  if (!isValidPin(pin)) {
    return { ok: false, error: 'O código deve ter 4 dígitos.' }
  }

  if (isSupabaseConfigured) {
    return loginSupabase(phone, pin)
  }

  return loginLocalHashed(catalog, phone, pin)
}
