export const CATALOG_SCHEMA_VERSION = 2

export const CATALOG_STORAGE_KEY = 'eventflow-catalog-v2'
export const SYNC_META_KEY = 'eventflow-sync-meta-v2'

/** Chaves antigas / demo — remover para evitar dados diferentes entre dispositivos */
const OBSOLETE_STORAGE_KEYS = [
  'eventflow-catalog-v1',
  'eventflow-data-v4',
  'eventflow-data-v3',
  'eventflow-data-v2',
  'eventflow-data-v1',
] as const

export type DataSourceTag = 'supabase' | 'local'

export interface SyncMeta {
  schemaVersion: number
  dataSource: DataSourceTag
  hydratedAt: string | null
}

const defaultMeta: SyncMeta = {
  schemaVersion: 0,
  dataSource: 'local',
  hydratedAt: null,
}

export function readSyncMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (!raw) return { ...defaultMeta }
    return { ...defaultMeta, ...JSON.parse(raw) }
  } catch {
    return { ...defaultMeta }
  }
}

export function writeSyncMeta(meta: Partial<SyncMeta>): void {
  const next = { ...readSyncMeta(), ...meta }
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(next))
}

/** Remove caches de versões anteriores e dados demo no browser. */
export function purgeObsoleteCaches(): void {
  for (const key of OBSOLETE_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
  localStorage.removeItem('eventflow-catalog-v1')
}

export function isSupabaseCacheValid(): boolean {
  const meta = readSyncMeta()
  return (
    meta.schemaVersion >= CATALOG_SCHEMA_VERSION &&
    meta.dataSource === 'supabase' &&
    meta.hydratedAt != null
  )
}

export function markCatalogSynced(source: DataSourceTag): void {
  writeSyncMeta({
    schemaVersion: CATALOG_SCHEMA_VERSION,
    dataSource: source,
    hydratedAt: new Date().toISOString(),
  })
}

export function clearCatalogCache(): void {
  localStorage.removeItem(CATALOG_STORAGE_KEY)
  writeSyncMeta({ ...defaultMeta })
}
