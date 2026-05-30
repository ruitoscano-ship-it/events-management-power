import { jsPDF } from 'jspdf'
import type { BarMenuItem, BarMenuReport } from './barMenuExport'

const BRAND = { r: 255, g: 45, b: 106 }
const INK = { r: 26, g: 26, b: 36 }
const MUTED = { r: 85, g: 85, b: 85 }
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 18
const CONTENT_W = PAGE_W - 2 * MARGIN

export type BarMenuPdfVariant = 'poster' | 'table' | 'table-grid'

function drawMenuRow(doc: jsPDF, item: BarMenuItem, x: number, y: number, width: number): number {
  const rowH = 9
  const priceX = x + width
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(INK.r, INK.g, INK.b)
  const nameLines = doc.splitTextToSize(item.name, width * 0.55) as string[]
  doc.text(nameLines, x, y + 4)

  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b)
  doc.text(item.priceLabel, priceX, y + 4, { align: 'right' })

  const lineY = y + 5.5
  doc.setDrawColor(210, 210, 210)
  doc.setLineWidth(0.15)
  const nameW = Math.min(doc.getTextWidth(nameLines[0] ?? item.name), width * 0.55)
  const priceW = doc.getTextWidth(item.priceLabel)
  const lineStart = x + nameW + 2
  const lineEnd = priceX - priceW - 2
  if (lineEnd > lineStart) {
    doc.line(lineStart, lineY, lineEnd, lineY)
  }

  return y + rowH + (nameLines.length - 1) * 4
}

function drawPosterHeader(doc: jsPDF, report: BarMenuReport, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b)
  doc.text('BAR', PAGE_W / 2, y, { align: 'center' })
  y += 7

  doc.setTextColor(INK.r, INK.g, INK.b)
  doc.setFontSize(17)
  const titleLines = doc.splitTextToSize(report.eventName, CONTENT_W) as string[]
  doc.text(titleLines, PAGE_W / 2, y, { align: 'center' })
  y += titleLines.length * 7 + 2

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
  const sub = [report.eventDateLabel, report.venue].filter(Boolean).join(' · ')
  const subLines = doc.splitTextToSize(sub, CONTENT_W) as string[]
  doc.text(subLines, PAGE_W / 2, y, { align: 'center' })
  y += subLines.length * 5 + 4

  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b)
  doc.setLineWidth(0.9)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  return y + 8
}

function drawPoster(doc: jsPDF, report: BarMenuReport): void {
  let y = MARGIN
  y = drawPosterHeader(doc, report, y)

  if (report.items.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    doc.text('Sem produtos com stock alocado.', PAGE_W / 2, y + 10, { align: 'center' })
    return
  }

  for (const item of report.items) {
    if (y > PAGE_H - 25) {
      doc.addPage()
      y = MARGIN
    }
    y = drawMenuRow(doc, item, MARGIN, y, CONTENT_W)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text(`Menu gerado em ${report.generatedAt}`, PAGE_W / 2, PAGE_H - 12, {
    align: 'center',
  })
}

function drawTableCardInRect(
  doc: jsPDF,
  report: BarMenuReport,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b)
  doc.setLineWidth(0.6)
  doc.roundedRect(x, y, w, h, 3, 3)

  let cy = y + 8
  const cx = x + w / 2

  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
  const badgeW = 28
  const badgeH = 8
  doc.roundedRect(cx - badgeW / 2, cy - 5, badgeW, badgeH, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('BAR', cx, cy, { align: 'center' })
  cy += 10

  doc.setTextColor(INK.r, INK.g, INK.b)
  doc.setFontSize(9)
  const eventLines = doc.splitTextToSize(report.eventName, w - 10) as string[]
  doc.text(eventLines, cx, cy, { align: 'center' })
  cy += eventLines.length * 4 + 1

  if (report.venue) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    doc.text(report.venue, cx, cy, { align: 'center' })
    cy += 5
  }

  cy += 3
  const innerX = x + 6
  const innerW = w - 12
  doc.setFontSize(9)
  for (const item of report.items) {
    if (cy > y + h - 12) break
    cy = drawMenuRow(doc, item, innerX, cy, innerW)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(150, 150, 150)
  doc.text('Preços por unidade', cx, y + h - 5, { align: 'center' })
}

function drawTable(doc: jsPDF, report: BarMenuReport): void {
  const cardW = 100
  const itemH = 9
  const cardH = Math.min(180, 42 + report.items.length * itemH)
  const x = (PAGE_W - cardW) / 2
  const y = (PAGE_H - cardH) / 2
  drawTableCardInRect(doc, report, x, y, cardW, cardH)
}

function drawTableGrid(doc: jsPDF, report: BarMenuReport): void {
  const gap = 6
  const cardW = (PAGE_W - 2 * MARGIN - gap) / 2
  const itemH = 8
  const cardH = Math.min(130, 38 + report.items.length * itemH)
  const positions = [
    { x: MARGIN, y: MARGIN },
    { x: MARGIN + cardW + gap, y: MARGIN },
    { x: MARGIN, y: MARGIN + cardH + gap },
    { x: MARGIN + cardW + gap, y: MARGIN + cardH + gap },
  ]
  for (const pos of positions) {
    drawTableCardInRect(doc, report, pos.x, pos.y, cardW, cardH)
  }
}

export function downloadBarMenuPdf(
  report: BarMenuReport,
  variant: BarMenuPdfVariant,
  filename: string,
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (variant === 'poster') drawPoster(doc, report)
  else if (variant === 'table') drawTable(doc, report)
  else drawTableGrid(doc, report)
  doc.save(filename)
}
