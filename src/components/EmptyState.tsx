import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="py-12 text-center">
      <Inbox className="mx-auto text-slate-300" size={44} />
      <h2 className="mt-4 font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
