/** PostgREST / Supabase quando a tabela ainda não existe (migration por correr). */
export function isMissingRelationError(
  error: { code?: string; message?: string } | null | undefined,
  tableName?: string,
): boolean {
  if (!error) return false
  if (error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  if (msg.includes('schema cache')) return true
  if (tableName && msg.includes(tableName.toLowerCase())) return true
  return false
}
