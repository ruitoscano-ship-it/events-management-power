import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/60 ${
          open ? 'motion-modal-backdrop-open' : 'motion-modal-backdrop-close'
        }`}
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl ${
          open ? 'motion-modal-panel-open' : 'motion-modal-panel-close'
        }`}
        onAnimationEnd={(e) => {
          if (e.currentTarget !== e.target) return
          if (!open && e.animationName === 'motion-modal-down') setMounted(false)
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={open ? 'motion-fade' : ''}>{children}</div>
      </div>
    </div>
  )
}
