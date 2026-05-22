import { useState } from 'react'
import { MIN_REOPEN_JUSTIFICATION_LEN } from '../../lib/eventLifecycle'
import { Modal } from '../ui/Modal'
import { cancelButtonClass, submitButtonClass } from '../ui/FormField'

interface Props {
  open: boolean
  eventName: string
  busy?: boolean
  onClose: () => void
  onConfirm: (justification: string) => void | Promise<void>
}

export function ReopenJustificationModal({
  open,
  eventName,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  const [justification, setJustification] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (busy) return
    setJustification('')
    setError(null)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = justification.trim()
    if (text.length < MIN_REOPEN_JUSTIFICATION_LEN) {
      setError(
        `A justificação deve ter pelo menos ${MIN_REOPEN_JUSTIFICATION_LEN} caracteres.`,
      )
      return
    }
    setError(null)
    await onConfirm(text)
    setJustification('')
  }

  return (
    <Modal title="Reabrir evento" open={open} onClose={handleClose}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <p className="text-sm text-slate-600">
          Vais reabrir <strong className="text-slate-900">«{eventName}»</strong> para edição.
          Indica o motivo — fica registado no audit log.
        </p>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Justificação</span>
          <textarea
            value={justification}
            onChange={(e) => {
              setJustification(e.target.value)
              setError(null)
            }}
            rows={4}
            required
            disabled={busy}
            placeholder="Ex.: Correção de horário após feedback da equipa…"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ff2d6a] focus:outline-none focus:ring-2 focus:ring-[#ff2d6a]/25 sm:text-sm"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClose} disabled={busy} className={cancelButtonClass}>
            Cancelar
          </button>
          <button type="submit" disabled={busy} className={submitButtonClass}>
            {busy ? 'A reabrir…' : 'Reabrir evento'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
