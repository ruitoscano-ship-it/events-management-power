import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  /** When false, child supplies its own padding/layout (e.g. split form + footer). */
  contentPadding?: boolean
}

export function Modal({
  title,
  open,
  onClose,
  children,
  contentPadding = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!open || !mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, mounted])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/60 ${
          open ? 'motion-modal-backdrop-open' : 'motion-modal-backdrop-close'
        }`}
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`pointer-events-auto flex w-full max-w-lg min-h-0 max-h-[calc(100svh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:max-w-xl ${
            open ? 'motion-modal-panel-open' : 'motion-modal-panel-close'
          }`}
          onAnimationEnd={(e) => {
            if (e.currentTarget !== e.target) return
            if (!open && e.animationName === 'motion-modal-down') setMounted(false)
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className={`modal-form flex min-h-0 flex-1 flex-col overflow-hidden text-slate-900 ${
              contentPadding
                ? 'modal-dialog-scroll overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5'
                : ''
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
