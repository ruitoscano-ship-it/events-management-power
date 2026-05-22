import { isSupabaseConfigured, supabase } from './supabase'

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

export async function loginOrganizerAccount(
  username: string,
  password: string,
): Promise<AuthOrganizerResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error:
        'Servidor não configurado. Define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no deploy.',
    }
  }
  return loginSupabase(username, password)
}
