import { avatarColor, volunteerInitials } from '../../lib/volunteers'

interface Props {
  volunteers: { id: string; name: string }[]
  max?: number
}

export function VolunteerAvatars({ volunteers, max = 6 }: Props) {
  const shown = volunteers.slice(0, max)
  const extra = volunteers.length - max

  if (shown.length === 0) {
    return <span className="text-xs text-slate-500">—</span>
  }

  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((v) => (
        <span
          key={v.id}
          title={v.name}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0a0a12] text-[10px] font-bold text-white"
          style={{ backgroundColor: avatarColor(v.id) }}
        >
          {volunteerInitials(v.name)}
        </span>
      ))}
      {extra > 0 && (
        <span className="ml-2 text-xs text-slate-500">+{extra}</span>
      )}
    </div>
  )
}
