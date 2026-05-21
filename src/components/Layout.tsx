import { Calendar, Clock, Grid3x3, Package, Users } from 'lucide-react'
import type { ReactNode } from 'react'

export type TabId = 'timeline' | 'grid' | 'volunteers' | 'contributions' | 'tasks'

const tabs: { id: TabId; label: string; icon: typeof Clock }[] = [
  { id: 'timeline', label: 'Cronograma', icon: Clock },
  { id: 'grid', label: 'Grelha', icon: Grid3x3 },
  { id: 'volunteers', label: 'Voluntários', icon: Users },
  { id: 'contributions', label: 'Quem leva', icon: Package },
  { id: 'tasks', label: 'Atividades', icon: Calendar },
]

interface LayoutProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: ReactNode
  saving?: boolean
}

export function Layout({ activeTab, onTabChange, children, saving }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col">
      <nav className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 py-2 md:justify-center md:gap-2 md:py-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:px-4 ${
                activeTab === id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
        {saving && (
          <p className="text-center text-xs text-brand-600 pb-1 md:pb-2">A guardar…</p>
        )}
      </nav>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
