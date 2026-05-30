import { useCallback, useEffect, useState } from 'react'
import {
  ORGANIZER_TAB_ORDER,
  type OrganizerTab,
} from '../components/organizer/OrganizerNav'

function parseTabFromHash(): OrganizerTab | null {
  if (typeof window === 'undefined') return null
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  if (!raw) return null
  const segment = raw.includes('/') ? raw.split('/').pop()! : raw
  if ((ORGANIZER_TAB_ORDER as readonly string[]).includes(segment)) {
    return segment as OrganizerTab
  }
  return null
}

/** Sincroniza separador do organizador com `#bar`, `#admin`, etc. */
export function useOrganizerTabHash(
  initial: OrganizerTab = 'horario',
): [OrganizerTab, (tab: OrganizerTab) => void] {
  const [tab, setTabState] = useState<OrganizerTab>(() => parseTabFromHash() ?? initial)

  const setTab = useCallback((next: OrganizerTab) => {
    setTabState(next)
    const nextHash = `#${next}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = parseTabFromHash()
      if (fromHash) setTabState(fromHash)
    }
    window.addEventListener('hashchange', onHashChange)
    const fromHash = parseTabFromHash()
    if (fromHash) setTabState(fromHash)
    else if (!window.location.hash) {
      window.history.replaceState(null, '', `#${tab}`)
    }
    return () => window.removeEventListener('hashchange', onHashChange)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- initial hash only

  return [tab, setTab]
}

export function organizerTabUrl(tab: OrganizerTab, baseUrl?: string): string {
  const base =
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '')
  return `${base.replace(/\/$/, '')}#${tab}`
}
