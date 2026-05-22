import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  hint?: string
}

export function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

/** Inputs em fundo claro (modais) — texto explícito para não herdar text-white do body */
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ff2d6a] focus:outline-none focus:ring-2 focus:ring-[#ff2d6a]/25 sm:text-sm [color-scheme:light]'

export const selectClass = inputClass

/** Botão de submissão visível em modais (brand-* não está no tema Tailwind) */
export const submitButtonClass =
  'w-full min-h-11 rounded-lg bg-[#ff2d6a] py-2.5 text-sm font-semibold text-white hover:bg-[#e0265d] disabled:opacity-60 transition-colors'

export const cancelButtonClass =
  'w-full min-h-11 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors'
