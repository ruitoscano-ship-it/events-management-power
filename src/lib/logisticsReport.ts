import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { contributionStatusLabels } from './format'
import { formatEventDateLong } from './eventDate'
import { parseDisplayQuantity } from './volunteerDashboard'
import type { Contribution, EventData, Volunteer } from '../types'

export interface LogisticsReportItem {
  item: string
  quantity: string
  status: string
  destination: string
  notes: string
}

export interface LogisticsReportVolunteerGroup {
  volunteerId: string
  volunteerName: string
  role: string | null
  items: LogisticsReportItem[]
}

export interface LogisticsReport {
  eventName: string
  eventDateLabel: string
  venue: string | null
  generatedAt: string
  /** Sem voluntário atribuído (em falta). */
  missing: LogisticsReportItem[]
  /** Agrupado por quem leva (inclui confirmados e entregues). */
  byVolunteer: LogisticsReportVolunteerGroup[]
  totals: {
    missingCount: number
    assignedCount: number
    deliveredCount: number
  }
}

function volunteerName(volunteers: Volunteer[], id: string | null): string {
  if (!id) return '—'
  return volunteers.find((v) => v.id === id)?.name ?? '—'
}

function formatQuantity(c: Contribution): string {
  if (c.needed_count != null && c.needed_count > 0) {
    const extra = c.quantity?.trim()
    return extra ? `${c.needed_count} em falta (${extra})` : `${c.needed_count} em falta`
  }
  return parseDisplayQuantity(c.quantity)
}

function toItem(c: Contribution): LogisticsReportItem {
  return {
    item: c.item_name,
    quantity: formatQuantity(c),
    status: contributionStatusLabels[c.status],
    destination: c.destination?.trim() || '—',
    notes: c.notes?.trim() || '—',
  }
}

export function buildLogisticsReport(data: EventData): LogisticsReport {
  const generatedAt = format(new Date(), "d MMM yyyy HH:mm", { locale: pt })
  const missing = data.contributions
    .filter((c) => !c.volunteer_id && c.status !== 'delivered')
    .map(toItem)
    .sort((a, b) => a.item.localeCompare(b.item, 'pt'))

  const volunteerIds = new Set(
    data.contributions
      .filter((c) => c.volunteer_id)
      .map((c) => c.volunteer_id as string),
  )

  const byVolunteer: LogisticsReportVolunteerGroup[] = [...volunteerIds]
    .map((vid) => {
      const v = data.volunteers.find((x) => x.id === vid)
      const items = data.contributions
        .filter((c) => c.volunteer_id === vid)
        .map(toItem)
        .sort((a, b) => a.item.localeCompare(b.item, 'pt'))
      return {
        volunteerId: vid,
        volunteerName: v?.name ?? volunteerName(data.volunteers, vid),
        role: v?.role ?? null,
        items,
      }
    })
    .sort((a, b) => a.volunteerName.localeCompare(b.volunteerName, 'pt'))

  const assignedCount = data.contributions.filter(
    (c) => c.volunteer_id && c.status !== 'delivered',
  ).length
  const deliveredCount = data.contributions.filter((c) => c.status === 'delivered').length

  return {
    eventName: data.event.name,
    eventDateLabel: formatEventDateLong(data.event.event_date),
    venue: data.event.venue,
    generatedAt,
    missing,
    byVolunteer,
    totals: {
      missingCount: missing.length,
      assignedCount,
      deliveredCount,
    },
  }
}

function csvEscape(value: string): string {
  const v = value.replace(/"/g, '""')
  return /[",\n\r]/.test(v) ? `"${v}"` : v
}

function csvRow(cells: string[]): string {
  return cells.map(csvEscape).join(',')
}

export function logisticsReportToCsv(report: LogisticsReport): string {
  const lines: string[] = [
    csvRow(['Relatório de logística']),
    csvRow(['Evento', report.eventName]),
    csvRow(['Data do evento', report.eventDateLabel]),
    csvRow(['Local', report.venue ?? '']),
    csvRow(['Gerado em', report.generatedAt]),
    csvRow([
      'Resumo',
      `${report.totals.missingCount} em falta`,
      `${report.totals.assignedCount} atribuídos (pendentes)`,
      `${report.totals.deliveredCount} concluídos`,
    ]),
    '',
    csvRow(['Secção', 'Item', 'Quantidade', 'Estado', 'Voluntário', 'Destino', 'Notas']),
  ]

  if (report.missing.length === 0) {
    lines.push(csvRow(['Em falta', '(nenhum)', '', '', '', '', '']))
  } else {
    for (const row of report.missing) {
      lines.push(
        csvRow([
          'Em falta',
          row.item,
          row.quantity,
          row.status,
          '',
          row.destination,
          row.notes,
        ]),
      )
    }
  }

  for (const group of report.byVolunteer) {
    const label = group.role
      ? `${group.volunteerName} (${group.role})`
      : group.volunteerName
    if (group.items.length === 0) {
      lines.push(csvRow(['Por voluntário', label, '(sem itens)', '', '', '', '']))
      continue
    }
    for (const row of group.items) {
      lines.push(
        csvRow([
          'Por voluntário',
          row.item,
          row.quantity,
          row.status,
          label,
          row.destination,
          row.notes,
        ]),
      )
    }
  }

  return lines.join('\r\n')
}

export function logisticsReportToPlainText(report: LogisticsReport): string {
  const lines: string[] = [
    'RELATÓRIO DE LOGÍSTICA',
    '====================',
    `Evento: ${report.eventName}`,
    `Data: ${report.eventDateLabel}`,
    report.venue ? `Local: ${report.venue}` : '',
    `Gerado: ${report.generatedAt}`,
    '',
    `Em falta: ${report.totals.missingCount} · Atribuídos (pendentes): ${report.totals.assignedCount} · Concluídos: ${report.totals.deliveredCount}`,
    '',
    '— EM FALTA (sem voluntário) —',
  ]

  if (report.missing.length === 0) {
    lines.push('  (nenhum)')
  } else {
    for (const row of report.missing) {
      lines.push(
        `  • ${row.item} — ${row.quantity}${row.destination !== '—' ? ` → ${row.destination}` : ''}`,
      )
    }
  }

  lines.push('', '— O QUE CADA VOLUNTÁRIO LEVA —')

  if (report.byVolunteer.length === 0) {
    lines.push('  (nenhuma atribuição)')
  } else {
    for (const group of report.byVolunteer) {
      const header = group.role
        ? `${group.volunteerName} (${group.role})`
        : group.volunteerName
      lines.push('', `  ${header}`)
      for (const row of group.items) {
        lines.push(
          `    - ${row.item} — ${row.quantity} [${row.status}]${row.destination !== '—' ? ` → ${row.destination}` : ''}`,
        )
      }
    }
  }

  return lines.filter(Boolean).join('\n')
}

export function logisticsReportToHtml(report: LogisticsReport): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const missingRows =
    report.missing.length === 0
      ? '<tr><td colspan="4"><em>Nada em falta</em></td></tr>'
      : report.missing
          .map(
            (r) =>
              `<tr><td>${esc(r.item)}</td><td>${esc(r.quantity)}</td><td>${esc(r.destination)}</td><td>${esc(r.notes)}</td></tr>`,
          )
          .join('')

  const volunteerBlocks = report.byVolunteer
    .map((g) => {
      const title = g.role
        ? `${esc(g.volunteerName)} <span class="muted">(${esc(g.role)})</span>`
        : esc(g.volunteerName)
      const rows =
        g.items.length === 0
          ? '<tr><td colspan="3"><em>Sem itens</em></td></tr>'
          : g.items
              .map(
                (r) =>
                  `<tr><td>${esc(r.item)}</td><td>${esc(r.quantity)}</td><td>${esc(r.status)}</td></tr>`,
              )
              .join('')
      return `<section><h2>${title}</h2><table><thead><tr><th>Item</th><th>Qtd.</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></section>`
    })
    .join('')

  return `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><title>Logística — ${esc(report.eventName)}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#111}
h1{font-size:1.25rem;margin:0 0 .5rem}
.meta{color:#555;font-size:.9rem;margin-bottom:1.5rem}
h2{font-size:1rem;margin:1.25rem 0 .5rem;border-bottom:1px solid #ddd;padding-bottom:.25rem}
.muted{color:#666;font-weight:normal}
table{width:100%;border-collapse:collapse;font-size:.9rem;margin-bottom:1rem}
th,td{border:1px solid #ddd;padding:.4rem .5rem;text-align:left}
th{background:#f5f5f5}
@media print{body{margin:1cm}}
</style></head><body>
<h1>Relatório de logística</h1>
<p class="meta"><strong>${esc(report.eventName)}</strong><br/>${esc(report.eventDateLabel)}${report.venue ? `<br/>${esc(report.venue)}` : ''}<br/>Gerado: ${esc(report.generatedAt)}<br/>
Em falta: ${report.totals.missingCount} · Pendentes: ${report.totals.assignedCount} · Concluídos: ${report.totals.deliveredCount}</p>
<h2>Em falta</h2>
<table><thead><tr><th>Item</th><th>Quantidade</th><th>Destino</th><th>Notas</th></tr></thead><tbody>${missingRows}</tbody></table>
<h2>Por voluntário</h2>
${volunteerBlocks || '<p><em>Sem atribuições</em></p>'}
</body></html>`
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/plain;charset=utf-8',
): void {
  const blob = new Blob(['\ufeff', content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function fileSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
    .toLowerCase()
}

export function exportLogisticsReport(
  data: EventData,
  format: 'csv' | 'txt' | 'print',
): void {
  const report = buildLogisticsReport(data)
  const slug = fileSlug(data.event.name) || 'evento'
  const datePart = data.event.event_date

  if (format === 'csv') {
    downloadTextFile(
      `logistica-${slug}-${datePart}.csv`,
      logisticsReportToCsv(report),
      'text/csv;charset=utf-8',
    )
    return
  }

  if (format === 'txt') {
    downloadTextFile(
      `logistica-${slug}-${datePart}.txt`,
      logisticsReportToPlainText(report),
      'text/plain;charset=utf-8',
    )
    return
  }

  const html = logisticsReportToHtml(report)
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) {
    downloadTextFile(
      `logistica-${slug}-${datePart}.html`,
      html,
      'text/html;charset=utf-8',
    )
    return
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  w.onload = () => w.print()
}
