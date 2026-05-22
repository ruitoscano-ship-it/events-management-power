import { appendAuditLog } from './audit'
import { patchData } from './persistence'
import type { EventData } from '../types'

export const MIN_REOPEN_JUSTIFICATION_LEN = 10

export function closeEventData(data: EventData): EventData {
  const archived_at = new Date().toISOString()
  return appendAuditLog(
    patchData(data, {
      event: { ...data.event, archived_at },
    }),
    {
      action: 'event.archived',
      summary: 'Evento encerrado — apenas consulta (edição bloqueada).',
      entity_type: 'event',
      entity_id: data.event.id,
    },
  )
}

export function reopenEventData(data: EventData, justification: string): EventData {
  const text = justification.trim()
  return appendAuditLog(
    patchData(data, {
      event: { ...data.event, archived_at: null },
    }),
    {
      action: 'event.restored',
      summary: `Evento reaberto. Justificação: ${text}`,
      entity_type: 'event',
      entity_id: data.event.id,
    },
  )
}

export function validateReopenJustification(justification: string): string | null {
  const text = justification.trim()
  if (text.length < MIN_REOPEN_JUSTIFICATION_LEN) {
    return `Escreve uma justificação com pelo menos ${MIN_REOPEN_JUSTIFICATION_LEN} caracteres.`
  }
  return null
}
