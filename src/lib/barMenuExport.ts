import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { formatEventDateLong } from './eventDate'
import { formatEur } from './currency'
import { downloadTextFile } from './logisticsReport'
import type { EventData } from '../types'

export interface BarMenuItem {
  name: string
  price: number
  priceLabel: string
}

export interface BarMenuReport {
  eventName: string
  eventDateLabel: string
  venue: string | null
  generatedAt: string
  items: BarMenuItem[]
}

export function buildBarMenuReport(data: EventData): BarMenuReport {
  const items = data.barProducts
    .filter((p) => p.active && p.quantity_allocated > 0)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'pt'))
    .map((p) => ({
      name: p.name,
      price: p.unit_price,
      priceLabel: formatEur(p.unit_price),
    }))

  return {
    eventName: data.event.name,
    eventDateLabel: formatEventDateLong(data.event.event_date),
    venue: data.event.venue,
    generatedAt: format(new Date(), "d MMM yyyy HH:mm", { locale: pt }),
    items,
  }
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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function menuItemsHtml(items: BarMenuItem[]): string {
  if (items.length === 0) {
    return '<p class="empty">Sem produtos com stock alocado para o bar.</p>'
  }
  return items
    .map(
      (item) => `
    <li class="menu-item">
      <span class="menu-item-name">${esc(item.name)}</span>
      <span class="menu-item-dots" aria-hidden="true"></span>
      <span class="menu-item-price">${esc(item.priceLabel)}</span>
    </li>`,
    )
    .join('')
}

const BASE_STYLES = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    color: #1a1a24;
    background: #fff;
  }
  .empty { color: #666; font-style: italic; text-align: center; padding: 2rem; }
`

/** Menu completo A4 — impressão ou PDF. */
export function barMenuPosterHtml(report: BarMenuReport): string {
  const items = menuItemsHtml(report.items)
  return `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/>
<title>Menu do bar — ${esc(report.eventName)}</title>
<style>
${BASE_STYLES}
body { padding: 2rem 2.5rem; max-width: 800px; margin: 0 auto; }
.header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.25rem; border-bottom: 3px solid #ff2d6a; }
.brand { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.35em; text-transform: uppercase; color: #ff2d6a; margin-bottom: 0.5rem; }
.title { font-size: 1.75rem; font-weight: 800; margin: 0; line-height: 1.2; }
.subtitle { margin: 0.5rem 0 0; font-size: 1rem; color: #555; }
.menu-list { list-style: none; margin: 0; padding: 0; }
.menu-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 0.35rem 0.5rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}
.menu-item-name { font-size: 1.15rem; font-weight: 600; }
.menu-item-dots {
  border-bottom: 2px dotted #ddd;
  min-width: 1rem;
  margin-bottom: 0.2rem;
}
.menu-item-price { font-size: 1.15rem; font-weight: 800; color: #ff2d6a; white-space: nowrap; }
.footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #888; }
@media print {
  body { padding: 1.2cm; }
  .header { margin-bottom: 1.5rem; }
}
</style></head><body>
<header class="header">
  <p class="brand">Bar</p>
  <h1 class="title">${esc(report.eventName)}</h1>
  <p class="subtitle">${esc(report.eventDateLabel)}${report.venue ? ` · ${esc(report.venue)}` : ''}</p>
</header>
<ul class="menu-list">${items}</ul>
<p class="footer">Menu gerado em ${esc(report.generatedAt)}</p>
</body></html>`
}

/** Formato compacto para colocar nas mesas (tipografia maior, área útil centrada). */
export function barMenuTableHtml(report: BarMenuReport): string {
  const items = menuItemsHtml(report.items)
  return `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/>
<title>Menu de mesa — ${esc(report.eventName)}</title>
<style>
${BASE_STYLES}
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.sheet {
  width: 100%;
  max-width: 420px;
  border: 2px solid #ff2d6a;
  border-radius: 12px;
  padding: 1.75rem 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.header { text-align: center; margin-bottom: 1.5rem; }
.brand {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: #fff;
  background: #ff2d6a;
  padding: 0.35rem 1rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}
.event { font-size: 0.85rem; font-weight: 700; color: #333; margin: 0; line-height: 1.3; }
.venue { font-size: 0.75rem; color: #666; margin: 0.35rem 0 0; }
.menu-list { list-style: none; margin: 0; padding: 0; }
.menu-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 0.25rem 0.4rem;
  padding: 0.55rem 0;
}
.menu-item-name { font-size: 1.05rem; font-weight: 700; }
.menu-item-dots { border-bottom: 2px dotted #e0e0e0; margin-bottom: 0.15rem; }
.menu-item-price { font-size: 1.05rem; font-weight: 800; color: #ff2d6a; }
.hint { margin-top: 1.25rem; text-align: center; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 0.08em; }
@media print {
  body { padding: 0.8cm; }
  .sheet { box-shadow: none; max-width: 100%; border-width: 3px; }
}
</style></head><body>
<div class="sheet">
  <header class="header">
    <div class="brand">BAR</div>
    <p class="event">${esc(report.eventName)}</p>
    ${report.venue ? `<p class="venue">${esc(report.venue)}</p>` : ''}
  </header>
  <ul class="menu-list">${items}</ul>
  <p class="hint">Preços por unidade · ${esc(report.eventDateLabel)}</p>
</div>
</body></html>`
}

function tableSheetFragment(report: BarMenuReport): string {
  const items = menuItemsHtml(report.items)
  return `<div class="sheet">
  <header class="header">
    <div class="brand">BAR</div>
    <p class="event">${esc(report.eventName)}</p>
    ${report.venue ? `<p class="venue">${esc(report.venue)}</p>` : ''}
  </header>
  <ul class="menu-list">${items}</ul>
  <p class="hint">Preços por unidade</p>
</div>`
}

/** Várias cópias do menu de mesa numa folha A4 (para recortar). */
export function barMenuTableGridHtml(report: BarMenuReport, copies = 4): string {
  const cells = Array.from({ length: copies }, () => tableSheetFragment(report)).join('')

  return `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/>
<title>Menus de mesa — ${esc(report.eventName)}</title>
<style>
${BASE_STYLES}
body { padding: 0.5cm; }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5cm;
}
.sheet {
  border: 2px solid #ff2d6a;
  border-radius: 10px;
  padding: 1rem 0.85rem;
}
.header { text-align: center; margin-bottom: 0.85rem; }
.brand {
  display: inline-block;
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  color: #fff;
  background: #ff2d6a;
  padding: 0.25rem 0.65rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}
.event { font-size: 0.75rem; font-weight: 700; margin: 0; line-height: 1.25; }
.venue { font-size: 0.65rem; color: #666; margin: 0.25rem 0 0; }
.menu-list { list-style: none; margin: 0; padding: 0; }
.menu-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 0.2rem 0.35rem;
  padding: 0.4rem 0;
}
.menu-item-name { font-size: 0.85rem; font-weight: 700; }
.menu-item-dots { border-bottom: 2px dotted #e0e0e0; margin-bottom: 0.1rem; }
.menu-item-price { font-size: 0.85rem; font-weight: 800; color: #ff2d6a; }
.hint { margin-top: 0.65rem; text-align: center; font-size: 0.55rem; color: #999; text-transform: uppercase; }
@media print {
  body { padding: 0.4cm; }
  .grid { gap: 0.35cm; }
}
</style></head><body>
<div class="grid">${cells}</div>
</body></html>`
}

export function barMenuToCsv(report: BarMenuReport): string {
  const lines = [
    'Produto,Preço (EUR)',
    ...report.items.map((i) => `"${i.name.replace(/"/g, '""')}",${i.price.toFixed(2)}`),
  ]
  return lines.join('\n')
}

export function barMenuToPlainText(report: BarMenuReport): string {
  const lines = [
    'MENU DO BAR',
    report.eventName,
    report.eventDateLabel,
    report.venue ?? '',
    `Gerado: ${report.generatedAt}`,
    '',
    ...report.items.map((i) => `${i.name} — ${i.priceLabel}`),
  ]
  return lines.filter(Boolean).join('\n')
}

export type BarMenuExportFormat =
  | 'print'
  | 'table'
  | 'table-grid'
  | 'pdf-poster'
  | 'pdf-table'
  | 'pdf-table-grid'
  | 'csv'
  | 'txt'

function openPrintHtml(html: string, fallbackName: string): void {
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) {
    downloadTextFile(fallbackName, html, 'text/html;charset=utf-8')
    return
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  w.onload = () => w.print()
}

export function exportBarMenu(data: EventData, format: BarMenuExportFormat): void {
  const report = buildBarMenuReport(data)
  const slug = fileSlug(data.event.name) || 'evento'
  const datePart = data.event.event_date

  if (format === 'pdf-poster' || format === 'pdf-table' || format === 'pdf-table-grid') {
    void exportBarMenuPdf(data, format)
    return
  }

  if (format === 'csv') {
    downloadTextFile(`menu-bar-${slug}-${datePart}.csv`, barMenuToCsv(report), 'text/csv;charset=utf-8')
    return
  }

  if (format === 'txt') {
    downloadTextFile(`menu-bar-${slug}-${datePart}.txt`, barMenuToPlainText(report), 'text/plain;charset=utf-8')
    return
  }

  const html =
    format === 'print'
      ? barMenuPosterHtml(report)
      : format === 'table-grid'
        ? barMenuTableGridHtml(report)
        : barMenuTableHtml(report)

  const suffix =
    format === 'print' ? 'poster' : format === 'table-grid' ? 'mesas-4x' : 'mesa'
  openPrintHtml(html, `menu-bar-${suffix}-${slug}-${datePart}.html`)
}

export async function exportBarMenuPdf(
  data: EventData,
  format: 'pdf-poster' | 'pdf-table' | 'pdf-table-grid',
): Promise<void> {
  const { downloadBarMenuPdf } = await import('./barMenuPdf')
  const report = buildBarMenuReport(data)
  const slug = fileSlug(data.event.name) || 'evento'
  const datePart = data.event.event_date
  const variant =
    format === 'pdf-poster' ? 'poster' : format === 'pdf-table-grid' ? 'table-grid' : 'table'
  const suffix =
    variant === 'poster' ? 'poster' : variant === 'table-grid' ? 'mesas-4x' : 'mesa'
  downloadBarMenuPdf(report, variant, `menu-bar-${suffix}-${slug}-${datePart}.pdf`)
}
