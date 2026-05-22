import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { darkBtnPrimary, darkInput, darkLabel } from '../components/ui/darkForm'

type Tab = 'login' | 'register'

export function VolunteerAuthPage() {
  const { registerVolunteer, loginVolunteer, exitToEntry } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await registerVolunteer(name, phone, pin)
    setLoading(false)
    if (err) setError(err)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await loginVolunteer(phone, pin)
    setLoading(false)
    if (err) setError(err)
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

        <h1 className="text-2xl font-black text-white uppercase">
          Área do <span className="text-[#ff2d6a]">voluntário</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Regista-te ou entra com o teu telefone e código de 4 dígitos.
        </p>

        <div className="mt-6 flex rounded-lg border border-[#2a2a3d] p-0.5">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null) }}
            className={`flex-1 min-h-10 rounded-md text-xs font-bold tracking-wide ${
              tab === 'login' ? 'bg-[#ff2d6a] text-white' : 'text-slate-400'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null) }}
            className={`flex-1 min-h-10 rounded-md text-xs font-bold tracking-wide ${
              tab === 'register' ? 'bg-[#ff2d6a] text-white' : 'text-slate-400'
            }`}
          >
            Registar
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {tab === 'register' ? (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <label>
              <span className={darkLabel}>Nome completo</span>
              <input
                className={darkInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Antunes"
                required
                autoComplete="name"
              />
            </label>
            <label>
              <span className={darkLabel}>Telefone</span>
              <input
                className={darkInput}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="912 345 678"
                required
                autoComplete="tel"
              />
            </label>
            <label>
              <span className={darkLabel}>Código de acesso (4 dígitos)</span>
              <input
                className={darkInput}
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                autoComplete="new-password"
              />
            </label>
            <button type="submit" disabled={loading} className={darkBtnPrimary}>
              {loading ? 'A registar…' : 'Criar conta'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label>
              <span className={darkLabel}>Telefone</span>
              <input
                className={darkInput}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="912 345 678"
                required
                autoComplete="tel"
              />
            </label>
            <label>
              <span className={darkLabel}>Código de 4 dígitos</span>
              <input
                className={darkInput}
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={loading} className={darkBtnPrimary}>
              {loading ? 'A entrar…' : 'Entrar'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[10px] text-slate-600">
          O código é pessoal. Não o partilhes com outras pessoas.
        </p>
      </div>
    </div>
  )
}
