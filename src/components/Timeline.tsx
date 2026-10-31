import type { SubscriptionActivity } from '../types'
import { formatDate } from '../lib/dates'

export function Timeline({ items }: { items: SubscriptionActivity[] }) {
  return (
    <div className="space-y-0">
      {[...items].sort((a, b) => b.date.localeCompare(a.date)).map((item, index, list) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-2 ring-indigo-100" />
            {index < list.length - 1 && <span className="min-h-14 w-px flex-1 bg-slate-200" />}
          </div>
          <div className="pb-5">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
            <p className="mt-1 text-xs text-slate-400">{formatDate(item.date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
