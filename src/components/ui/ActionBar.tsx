import { Pencil, Plus, Trash2 } from 'lucide-react'

interface ActionBarProps {
  onAdd?: () => void
  onEdit?: () => void
  onDelete?: () => void
  addLabel?: string
  /** Dark organizer shell (default for EventFlow organizer pages). */
  variant?: 'dark' | 'light'
}

export function ActionBar({
  onAdd,
  onEdit,
  onDelete,
  addLabel = 'Adicionar',
  variant = 'light',
}: ActionBarProps) {
  const isDark = variant === 'dark'

  const addClass = isDark
    ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ff2d6a] px-4 py-3 text-sm font-bold text-white hover:bg-[#e0265d] active:scale-[0.99] sm:min-h-11 sm:w-auto sm:py-2.5'
    : 'inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700 sm:w-auto sm:py-2'

  const secondaryClass = isDark
    ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#12121c] px-4 py-3 text-sm font-bold text-slate-200 hover:text-white hover:border-[#ff2d6a]/40 sm:min-h-11 sm:w-auto sm:py-2.5'
    : 'inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:py-2'

  const deleteClass = isDark
    ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 sm:min-h-11 sm:w-auto sm:py-2.5'
    : 'inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 sm:w-auto sm:py-2'

  return (
    <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-2">
      {onAdd && (
        <button type="button" onClick={onAdd} className={addClass}>
          <Plus className="h-4 w-4 shrink-0" />
          {addLabel}
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} className={secondaryClass}>
          <Pencil className="h-4 w-4 shrink-0" />
          Editar
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className={deleteClass}>
          <Trash2 className="h-4 w-4 shrink-0" />
          Apagar
        </button>
      )}
    </div>
  )
}
