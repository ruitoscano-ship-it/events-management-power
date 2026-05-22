import { useState } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { darkBtnPrimary, darkBtnSecondary, darkInput, darkLabel } from '../components/ui/darkForm'

export function OrganizerLoginPage() {
  const { loginOrganizer, exitToEntry } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const err = await loginOrganizer(username, password)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a12]">
      <div className="mx-auto max-w-md px-4 py-8">
        <button
          type="button"
          onClick={exitToEntry}
          className="mb-6 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white uppercase tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#a855f7]/20 text-[#a855f7]">
          <Shield className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-black text-white uppercase">
          Admin <span className="text-[#a855f7]">organizador</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Acesso reservado à equipa de organização do evento.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label>
            <span className={darkLabel}>Utilizador</span>
            <input
              className={darkInput}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span className={darkLabel}>Palavra-passe</span>
            <input
              className={darkInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className={darkBtnPrimary} disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-3 py-2 text-xs text-slate-500">
          {isSupabaseConfigured ? (
            <>
              Conta validada no <span className="text-emerald-400/90">Supabase</span>. Acesso
              inicial: <span className="font-mono text-slate-400">admin</span> /{' '}
              <span className="font-mono text-slate-400">admin</span> (altera no painel SQL em
              produção).
            </>
          ) : (
            <>
              Modo local: <span className="font-mono text-slate-400">admin</span> /{' '}
              <span className="font-mono text-slate-400">admin</span>
            </>
          )}
        </p>

        <button type="button" onClick={exitToEntry} className={`mt-4 ${darkBtnSecondary}`}>
          Voltar ao início
        </button>
      </div>
    </div>
  )
}
