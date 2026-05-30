import {
  Armchair,
  Fence,
  Lamp,
  Megaphone,
  Signpost,
  Square,
  Table2,
  Tent,
  type LucideIcon,
} from 'lucide-react'
import type { ThirdPartyMaterialCategory } from '../../types'
import { THIRD_PARTY_MATERIAL_LABELS } from '../../lib/thirdParties'

const ICONS: Record<ThirdPartyMaterialCategory, LucideIcon> = {
  sound: Megaphone,
  chairs: Armchair,
  tables: Table2,
  barriers: Fence,
  lighting: Lamp,
  tents: Tent,
  signage: Signpost,
  other: Square,
}

interface Props {
  category: ThirdPartyMaterialCategory
  className?: string
}

export function ThirdPartyMaterialIcon({ category, className = '' }: Props) {
  const Icon = ICONS[category]
  return (
    <Icon
      className={`h-5 w-5 shrink-0 text-[#ff2d6a] ${className}`}
      strokeWidth={2}
      aria-label={THIRD_PARTY_MATERIAL_LABELS[category]}
    />
  )
}
