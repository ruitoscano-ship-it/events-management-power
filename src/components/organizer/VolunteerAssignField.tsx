import { useEffect, useRef, useState } from 'react'

interface Props {
  volunteers: { id: string; name: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function teamSummary(
  volunteers: { id: string; name: string }[],
  ids: string[],
): string {
  if (ids.length === 0) return 'Nenhum'
  return volunteers
    .filter((v) => ids.includes(v.id))
    .map((v) => v.name.split(' ')[0])
    .join(', ')
}

export function VolunteerAssignField({ volunteers, selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  function openPicker() {
    setPending([...selectedIds])
    setOpen(true)
  }

  function togglePending(id: string) {
    setPending((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    )
  }

  function confirm() {
    onChange(pending)
    setOpen(false)
  }

  function cancel() {
    setOpen(false)
  }

  const summary = teamSummary(volunteers, selectedIds)

  return (
    <div ref={rootRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-[#2a2a3d] bg-[#0a0a12] px-3 py-2 text-left text-sm text-white hover:border-[#ff2d6a]/40"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>
          <span className="font-medium text-[#ff2d6a]">{selectedIds.length}</span>
          <span className="text-slate-400"> · </span>
          <span className="text-slate-300">{summary}</span>
        </span>
        <span className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-1 flex w-56 flex-col rounded-lg border border-[#2a2a3d] bg-[#12121c] shadow-xl sm:left-0 sm:right-auto sm:w-64"
        >
          <div className="max-h-48 overflow-y-auto p-2">
            {volunteers.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-500">Sem voluntários ativos.</p>
            ) : (
              <ul className="space-y-0.5">
                {volunteers.map((v) => (
                  <li key={v.id}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={pending.includes(v.id)}
                        onChange={() => togglePending(v.id)}
                        className="h-5 w-5 shrink-0 rounded border-[#2a2a3d] accent-[#ff2d6a]"
                      />
                      <span className="text-sm text-white">{v.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2 border-t border-[#2a2a3d] p-2">
            <button
              type="button"
              onClick={cancel}
              className="min-h-10 flex-1 rounded-lg border border-[#2a2a3d] px-3 text-sm text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirm}
              className="min-h-10 flex-1 rounded-lg bg-[#ff2d6a] px-3 text-sm font-semibold text-white hover:bg-[#e0265d]"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
