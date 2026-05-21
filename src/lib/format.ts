import { format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import type { BlockType, ContributionStatus, TaskStatus } from '../types'

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm', { locale: pt })
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "EEEE, d 'de' MMMM yyyy", { locale: pt })
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy', { locale: pt })
}

export const blockTypeLabels: Record<BlockType, string> = {
  activity: 'Atividade',
  competition: 'Competição',
  break: 'Pausa',
  ceremony: 'Cerimónia',
  logistics: 'Logística',
}

export const blockTypeColors: Record<BlockType, string> = {
  activity: 'bg-blue-100 text-blue-800 border-blue-200',
  competition: 'bg-violet-100 text-violet-800 border-violet-200',
  break: 'bg-amber-100 text-amber-800 border-amber-200',
  ceremony: 'bg-rose-100 text-rose-800 border-rose-200',
  logistics: 'bg-slate-100 text-slate-700 border-slate-200',
}

export const contributionStatusLabels: Record<ContributionStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  delivered: 'Entregue',
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  assigned: 'Atribuída',
  in_progress: 'Em curso',
  done: 'Concluída',
}
