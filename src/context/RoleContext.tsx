import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserRole } from '../types'

const ROLE_KEY = 'eventflow-role'
const VOLUNTEER_KEY = 'eventflow-volunteer-id'

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  volunteerId: string | null
  setVolunteerId: (id: string | null) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem(ROLE_KEY)
    return stored === 'volunteer' ? 'volunteer' : 'organizer'
  })
  const [volunteerId, setVolunteerIdState] = useState<string | null>(() =>
    localStorage.getItem(VOLUNTEER_KEY),
  )

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r)
    localStorage.setItem(ROLE_KEY, r)
  }, [])

  const setVolunteerId = useCallback((id: string | null) => {
    setVolunteerIdState(id)
    if (id) localStorage.setItem(VOLUNTEER_KEY, id)
    else localStorage.removeItem(VOLUNTEER_KEY)
  }, [])

  const value = useMemo(
    () => ({ role, setRole, volunteerId, setVolunteerId }),
    [role, setRole, volunteerId, setVolunteerId],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
