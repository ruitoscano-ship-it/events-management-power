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
    <div className="flex flex-wrap gap-2">
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Apagar
        </button>
      )}
    </div>
  )
}
