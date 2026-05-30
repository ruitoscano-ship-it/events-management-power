import type {
  ThirdPartyMaterialCategory,
  ThirdPartyOrgKind,
  ThirdPartyRequest,
  ThirdPartyRequestStatus,
} from '../types'

export const THIRD_PARTY_ORG_LABELS: Record<ThirdPartyOrgKind, string> = {
  municipality: 'Câmara municipal',
  parish: 'Junta de freguesia',
  civil_protection: 'Proteção civil',
  venue_owner: 'Dono do espaço',
  police: 'Polícia / segurança',
  other: 'Outra entidade',
}

export const THIRD_PARTY_MATERIAL_LABELS: Record<ThirdPartyMaterialCategory, string> = {
  sound: 'Som / material PA',
  chairs: 'Cadeiras',
  tables: 'Mesas',
  barriers: 'Barreiras / vedações',
  lighting: 'Iluminação',
  tents: 'Tendas / estruturas',
  signage: 'Sinalética',
  other: 'Outro material',
}

export const THIRD_PARTY_STATUS_LABELS: Record<ThirdPartyRequestStatus, string> = {
  draft: 'Rascunho',
  submitted: 'Enviado',
  approved: 'Aprovado',
  denied: 'Recusado',
  fulfilled: 'Entregue',
  cancelled: 'Cancelado',
}

export const THIRD_PARTY_STATUS_COLORS: Record<ThirdPartyRequestStatus, string> = {
  draft: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  submitted: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  approved: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  denied: 'text-red-400 bg-red-500/10 border-red-500/30',
  fulfilled: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  cancelled: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
}

export function thirdPartyRequestSummary(r: ThirdPartyRequest): string {
  const qty = r.quantity?.trim() ? ` · ${r.quantity.trim()}` : ''
  return `${THIRD_PARTY_MATERIAL_LABELS[r.material_category]}${qty}`
}

export function countThirdPartyByStatus(
  requests: ThirdPartyRequest[],
  statuses: ThirdPartyRequestStatus[],
): number {
  return requests.filter((r) => statuses.includes(r.status)).length
}
