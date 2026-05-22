import { Pencil, Plus, Trash2 } from 'lucide-react'

interface ActionBarProps {
  onAdd?: () => void
  onEdit?: () => void
  onDelete?: () => void
  addLabel?: string
}

export function ActionBar({
  onAdd,
  onEdit,
  onDelete,
  addLabel = 'Adicionar',
}: ActionBarProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700 sm:w-auto sm:py-2"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:py-2"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 sm:w-auto sm:py-2"
        >
          <Trash2 className="h-4 w-4" />
          Apagar
        </button>
      )}
    </div>
  )
}
