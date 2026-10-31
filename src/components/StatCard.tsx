import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string
  detail?: string
  icon: LucideIcon
  iconTone?: string
}

export function StatCard({ label, value, detail, icon: Icon, iconTone = 'bg-indigo-50 text-indigo-700' }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconTone}`}><Icon size={20} /></span>
      </div>
    </Card>
  )
}
