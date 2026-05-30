import { newId } from './datetime'
import { sumRevenue } from './financials'
import type {
  BarCloseSnapshot,
  BarOperation,
  BarProduct,
  BarSale,
  Event,
  EventData,
  RevenueEntry,
} from '../types'

const BAR_REVENUE_SYNC_DESCRIPTION = 'Bar — vendas registadas (sistema)'

export function soldQuantityForProduct(productId: string, sales: BarSale[]): number {
  return sales
    .filter((s) => s.product_id === productId)
    .reduce((sum, s) => sum + s.quantity, 0)
}

export function availableQuantity(product: BarProduct, sales: BarSale[]): number {
  const sold = soldQuantityForProduct(product.id, sales)
  return Math.max(0, product.quantity_allocated - sold)
}

export function totalSalesRevenue(sales: BarSale[]): number {
  return sales.reduce((sum, s) => sum + s.total_amount, 0)
}

export function totalUnitsSold(sales: BarSale[]): number {
  return sales.reduce((sum, s) => sum + s.quantity, 0)
}

export function barRevenueRecorded(entries: RevenueEntry[]): number {
  return sumRevenue(entries, { source: 'bar', entry_type: 'actual' })
}

export function barRevenueVariance(salesRevenue: number, recorded: number): number {
  return Math.round((recorded - salesRevenue) * 100) / 100
}

export function isBarFrozen(data: EventData): boolean {
  return data.barOperation?.status === 'closed'
}

export function canEditBar(data: EventData, eventClosed: boolean): boolean {
  if (eventClosed) return false
  return !isBarFrozen(data)
}

export function buildBarCloseSnapshot(data: EventData): BarCloseSnapshot {
  const salesRevenue = totalSalesRevenue(data.barSales)
  const recorded = barRevenueRecorded(data.revenueEntries)
  const products = data.barProducts
    .filter((p) => p.active)
    .map((p) => {
      const sold = soldQuantityForProduct(p.id, data.barSales)
      const remaining = Math.max(0, p.quantity_allocated - sold)
      return {
        id: p.id,
        name: p.name,
        unit_price: p.unit_price,
        collected: p.quantity_collected,
        allocated: p.quantity_allocated,
        sold,
        remaining,
        revenue: Math.round(sold * p.unit_price * 100) / 100,
      }
    })

  return {
    closed_at: new Date().toISOString(),
    event_name: data.event.name,
    products,
    total_units_sold: totalUnitsSold(data.barSales),
    sales_revenue: salesRevenue,
    bar_revenue_recorded: recorded,
    variance: barRevenueVariance(salesRevenue, recorded),
  }
}

export function findBarRevenueSyncEntry(entries: RevenueEntry[]): RevenueEntry | undefined {
  return entries.find(
    (e) =>
      e.source === 'bar' &&
      e.entry_type === 'actual' &&
      e.description === BAR_REVENUE_SYNC_DESCRIPTION,
  )
}

export function buildBarRevenueSyncEntry(
  event: Event,
  amount: number,
  existing?: RevenueEntry,
): RevenueEntry {
  return {
    id: existing?.id ?? newId(),
    event_id: event.id,
    source: 'bar',
    entry_type: 'actual',
    description: BAR_REVENUE_SYNC_DESCRIPTION,
    amount: Math.round(amount * 100) / 100,
    quantity: null,
    unit_price: null,
    recorded_at: event.event_date,
    notes: existing?.notes ?? 'Gerado automaticamente a partir das vendas do bar',
  }
}

export function createDefaultBarOperation(eventId: string, id: string): BarOperation {
  return {
    id,
    event_id: eventId,
    status: 'active',
    opened_at: new Date().toISOString(),
    closed_at: null,
    close_snapshot: null,
    revenue_sync_entry_id: null,
  }
}

export interface BarDashboardStats {
  salesRevenue: number
  barRevenueRecorded: number
  variance: number
  totalUnitsSold: number
  productsActive: number
  lowStock: Array<{ product: BarProduct; available: number }>
  topProducts: Array<{ product: BarProduct; sold: number; revenue: number }>
}

export function computeBarDashboard(data: EventData): BarDashboardStats {
  const salesRevenue = totalSalesRevenue(data.barSales)
  const recorded = barRevenueRecorded(data.revenueEntries)
  const activeProducts = data.barProducts.filter((p) => p.active)

  const lowStock = activeProducts
    .map((p) => ({ product: p, available: availableQuantity(p, data.barSales) }))
    .filter((x) => x.available <= 5 && x.product.quantity_allocated > 0)
    .sort((a, b) => a.available - b.available)

  const topProducts = activeProducts
    .map((p) => {
      const sold = soldQuantityForProduct(p.id, data.barSales)
      return { product: p, sold, revenue: sold * p.unit_price }
    })
    .filter((x) => x.sold > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    salesRevenue,
    barRevenueRecorded: recorded,
    variance: barRevenueVariance(salesRevenue, recorded),
    totalUnitsSold: totalUnitsSold(data.barSales),
    productsActive: activeProducts.length,
    lowStock,
    topProducts,
  }
}

export { BAR_REVENUE_SYNC_DESCRIPTION }
