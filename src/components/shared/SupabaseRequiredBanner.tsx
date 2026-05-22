import { isSupabaseConfigured } from '../../lib/supabase'

interface Props {
  syncError?: string | null
}

export function SupabaseRequiredBanner({ syncError }: Props) {
  if (isSupabaseConfigured && !syncError) return null

  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
    >
      {!isSupabaseConfigured ? (
        <>
          <p className="font-semibold">Ligação ao servidor em falta</p>
          <p className="mt-1 text-xs text-amber-200/90">
            Esta instalação precisa de Supabase (<code className="text-[10px]">VITE_SUPABASE_URL</code>{' '}
            e <code className="text-[10px]">VITE_SUPABASE_ANON_KEY</code> no build). Sem isso, cada
            browser mostrava dados de demonstração — já não é o caso.
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold">Não foi possível carregar os eventos</p>
          <p className="mt-1 text-xs text-amber-200/90">{syncError}</p>
        </>
      )}
    </div>
  )
}
