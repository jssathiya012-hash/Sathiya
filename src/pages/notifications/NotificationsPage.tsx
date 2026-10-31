import { useEffect, useState } from 'react'
import { Bell, CheckCheck, CreditCard, FileText, TriangleAlert } from 'lucide-react'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import type { Notification } from '../../types'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { formatDate } from '../../lib/dates'

const icons = {
  renewal_reminder: Bell,
  payment_received: CreditCard,
  invoice_generated: FileText,
  payment_failed: TriangleAlert,
  overdue_invoice: TriangleAlert,
}

export function NotificationsPage() {
  const user = useAppStore(state => state.user)
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setItems(await getNotifications(user.id))
    setLoading(false)
  }

  useEffect(() => { void load() }, [user])

  const markOne = async (id: string) => {
    if (!user) return
    setItems(await markNotificationRead(user.id, id))
  }
  const markAll = async () => {
    if (!user) return
    setItems(await markAllNotificationsRead(user.id))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-950 dark:text-white">Notifications</h1><p className="mt-1 text-sm text-slate-500">Renewals, invoices and payments in one place.</p></div>
        <button onClick={markAll} className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><CheckCheck size={17} />Mark all as read</button>
      </div>
      <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
        {loading ? [0,1,2].map(i => <div key={i} className="p-5"><Skeleton className="h-16 w-full" /></div>) : items.length === 0 ? (
          <div className="p-10 text-center"><Bell className="mx-auto text-slate-300" size={38} /><p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">You are all caught up</p><p className="mt-1 text-sm text-slate-500">New account updates will appear here.</p></div>
        ) : items.map(item => {
          const Icon = icons[item.type] ?? Bell
          return (
            <button key={item.id} onClick={() => markOne(item.id)} className={`flex w-full gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${item.read ? '' : 'bg-indigo-50/40 dark:bg-indigo-950/20'}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.type.includes('failed') || item.type === 'overdue_invoice' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950'}`}><Icon size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>{!item.read && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{item.message}</span>
                <span className="mt-1 block text-xs text-slate-400">{formatDate(item.date)}</span>
              </span>
            </button>
          )
        })}
      </Card>
    </div>
  )
}
