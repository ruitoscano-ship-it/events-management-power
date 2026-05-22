import type { EventSponsor, RevenueEntry, RevenueSource } from '../types'

export const SPONSOR_STATUS_LABELS = {
  promised: 'Prometido',
  confirmed: 'Confirmado',
  received: 'Recebido',
  cancelled: 'Cancelado',
} as const

export const SPONSORSHIP_KIND_LABELS = {
  cash: 'Monetário',
  in_kind: 'Em espécie',
  mixed: 'Misto',
} as const

export const REVENUE_SOURCE_LABELS: Record<RevenueSource, string> = {
  bar: 'Bar',
  tickets: 'Bilhetes',
  other: 'Outro',
}

export function sponsorDisplayValue(s: EventSponsor): string {
  if (s.sponsorship_kind === 'in_kind') {
    return s.in_kind_description ?? 'Em espécie'
  }
  if (s.amount != null) {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(s.amount)
  }
  return '—'
}

export function sumSponsorAmounts(sponsors: EventSponsor[]): {
  committed: number
  received: number
} {
  let committed = 0
  let received = 0
  for (const s of sponsors) {
    if (s.status === 'cancelled') continue
    const amt = s.amount ?? 0
    if (s.status === 'received') received += amt
    if (s.status === 'promised' || s.status === 'confirmed' || s.status === 'received') {
      committed += amt
    }
  }
  return { committed, received }
}

export function sumRevenue(
  entries: RevenueEntry[],
  filter?: { source?: RevenueSource; entry_type?: RevenueEntry['entry_type'] },
): number {
  return entries
    .filter((e) => {
      if (filter?.source && e.source !== filter.source) return false
      if (filter?.entry_type && e.entry_type !== filter.entry_type) return false
      return true
    })
    .reduce((acc, e) => acc + e.amount, 0)
}

export function effectiveRevenueAmount(entry: RevenueEntry): number {
  if (entry.quantity != null && entry.unit_price != null) {
    return entry.quantity * entry.unit_price
  }
  return entry.amount
}
