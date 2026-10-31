import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PackageSearch } from 'lucide-react'
import { getSubscriptions } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { AppLayout } from '../../components/AppLayout'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { formatDate, countdownText } from '../../lib/dates'
import { formatMoney } from '../../lib/money'
import type { Subscription } from '../../types'

export function SubscriptionsPage() {
  const user = useAppStore(state => state.user)
  const [items, setItems] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getSubscriptions(user.id).then(setItems).finally(() => setLoading(false))
  }, [user])

  const sorted = useMemo(() => [...items].sort((a, b) => b.startDate.localeCompare(a.startDate)), [items])
  return (
    <AppLayout>
      <div>
        <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-950 dark:text-white">My subscriptions</h1><p className="mt-1 text-sm text-slate-500">See plans, billing dates and current status.</p></div><Link to="/plans" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Browse plans</Link></div>
        {loading ? <div className="grid gap-4 md:grid-cols-2">{[0,1].map(i => <Skeleton key={i} className="h-52" />)}</div> : sorted.length === 0 ? (
          <Card className="p-12 text-center"><PackageSearch className="mx-auto text-slate-300" size={44}/><h2 className="mt-4 font-bold">No subscriptions yet</h2><p className="mt-1 text-sm text-slate-500">Browse a plan to start your first subscription.</p><Link to="/plans" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Browse plans</Link></Card>
        ) : <div className="grid gap-4 md:grid-cols-2">{sorted.map(item =>         <Card key={item.id} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.productName}</p><h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{item.planName}</h2></div><Badge tone={item.status === 'Active' ? 'green' : item.status === 'Paused' ? 'amber' : item.status === 'Closed' ? 'red' : 'slate'}>{item.status}</Badge></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800"><div><p className="text-xs text-slate-500">Next billing</p><p className="mt-1 text-sm font-semibold">{formatDate(item.nextBillingDate)}</p></div><div><p className="text-xs text-slate-500">Amount</p><p className="mt-1 text-sm font-semibold">{formatMoney(item.amount)} / {item.billingFrequency.toLowerCase()}</p></div></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-500">{countdownText(item.nextBillingDate)}</span><Link to={`/subscriptions/${item.id}`} className="flex items-center gap-1 text-sm font-semibold text-indigo-700">View details <ArrowRight size={16}/></Link></div></Card>)}</div>}
      </div>
    </AppLayout>
  )
}
