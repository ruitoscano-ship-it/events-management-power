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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/60 ${
          open ? 'motion-modal-backdrop-open' : 'motion-modal-backdrop-close'
        }`}
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[min(90dvh,100%)] w-full flex-col rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:max-w-lg sm:rounded-2xl ${
          open ? 'motion-modal-panel-open' : 'motion-modal-panel-close'
        }`}
        onAnimationEnd={(e) => {
          if (e.currentTarget !== e.target) return
          if (!open && e.animationName === 'motion-modal-down') setMounted(false)
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className={`modal-form min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-slate-900 sm:px-5 ${
            open ? 'motion-fade' : ''
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
