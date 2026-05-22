import { isSupabaseConfigured, supabase } from './supabase'

const LOCAL_ORGANIZER_USER = 'admin'
const LOCAL_ORGANIZER_PASS = 'admin'

export type AuthOrganizerResult =
  | { ok: true; organizerId: string; username: string; displayName: string }
  | { ok: false; error: string }

type RpcPayload = {
  ok: boolean
  error?: string
  organizer_id?: string
  username?: string
  display_name?: string
}

async function loginSupabase(
  username: string,
  password: string,
): Promise<AuthOrganizerResult> {
  if (!supabase) {
    return { ok: false, error: 'Supabase não configurado.' }
  }
  const { data, error } = await supabase.rpc('login_organizer', {
    p_username: username.trim(),
    p_password: password,
  })
  if (error) return { ok: false, error: error.message }
  const payload = data as RpcPayload
  if (!payload.ok || !payload.organizer_id || !payload.username) {
    return { ok: false, error: payload.error ?? 'Entrada falhou.' }
  }
  return {
    ok: true,
    organizerId: payload.organizer_id,
    username: payload.username,
    displayName: payload.display_name ?? payload.username,
  }
}

function loginLocal(username: string, password: string): AuthOrganizerResult {
  if (
    username.trim().toLowerCase() !== LOCAL_ORGANIZER_USER ||
    password !== LOCAL_ORGANIZER_PASS
  ) {
    return { ok: false, error: 'Utilizador ou palavra-passe incorretos.' }
  }
  return {
    ok: true,
    organizerId: 'local-organizer',
    username: LOCAL_ORGANIZER_USER,
    displayName: 'Administrador (local)',
  }
}

export async function loginOrganizerAccount(
  username: string,
  password: string,
): Promise<AuthOrganizerResult> {
  if (isSupabaseConfigured) {
    return loginSupabase(username, password)
  }
  return loginLocal(username, password)
}
