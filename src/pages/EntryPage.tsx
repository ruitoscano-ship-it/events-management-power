import { Shield, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function EntryPage() {
  const { startOrganizer, startVolunteer } = useAuth()

  return (
    <div className="min-h-dvh bg-[#0a0a12] flex flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff2d6a]/20 text-[#ff2d6a]">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Event<span className="text-[#ff2d6a]">Flow</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Gestão de eventos desportivos — voluntários e organização.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={startVolunteer}
            className="flex w-full min-h-[4.5rem] items-center gap-4 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-5 py-4 text-left transition-colors hover:border-[#ff2d6a]/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ff2d6a]/20 text-[#ff2d6a]">
              <Users className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold text-white uppercase tracking-wide">
                Sou voluntário
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">
                Registo ou entrada com telefone e código
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={startOrganizer}
            className="flex w-full min-h-[4.5rem] items-center gap-4 rounded-xl border border-[#2a2a3d] bg-[#12121c] px-5 py-4 text-left transition-colors hover:border-[#a855f7]/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#a855f7]/20 text-[#a855f7]">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold text-white uppercase tracking-wide">
                Sou organizador
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">
                Acesso administrativo ao evento
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
