import { newId } from './datetime'
import type { AuditAction, AuditLogEntry, EventData } from '../types'

const MAX_ENTRIES = 250

export interface AuditInput {
  action: AuditAction
  summary: string
  entity_type?: string
  entity_id?: string
}

export function appendAuditLog(
  data: EventData,
  input: AuditInput,
): EventData {
  const entry: AuditLogEntry = {
    id: newId(),
    at: new Date().toISOString(),
    ...input,
  }
  const auditLog = [entry, ...(data.auditLog ?? [])].slice(0, MAX_ENTRIES)
  return { ...data, auditLog }
}
