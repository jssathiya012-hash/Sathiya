import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CreditCard, FileText, Layers3 } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getInvoices, getPayments, getSubscriptions } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import type { Invoice, Payment, Subscription } from '../../types'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { StatCard } from '../../components/StatCard'
import { Timeline } from '../../components/Timeline'
import { Skeleton } from '../../components/Skeleton'
import { formatDate, countdownText } from '../../lib/dates'
import { formatMoney } from '../../lib/money'

export function DashboardPage() {
  const user = useAppStore(state => state.user)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getSubscriptions(user.id), getInvoices(user.id), getPayments(user.id)])
      .then(([subs, invs, pays]) => { setSubscriptions(subs); setInvoices(invs); setPayments(pays) })
      .finally(() => setLoading(false))
  }, [user])

  const activeSubscription = subscriptions.find(item => item.status === 'Active') ?? subscriptions[0]
  const unpaidInvoices = useMemo(() => invoices.filter(item => item.status === 'Confirmed'), [invoices])
  const overdueCount = useMemo(() => unpaidInvoices.filter(item => new Date(item.dueDate) < new Date()).length, [unpaidInvoices])
  const spendData = useMemo(() => [
    { month: 'Jun', amount: 18000 },
    { month: 'Jul', amount: 24000 },
    { month: 'Aug', amount: 21000 },
    { month: 'Sep', amount: 28000 },
    { month: 'Oct', amount: 26000 },
    { month: 'Nov', amount: Math.round(payments.filter(p => p.status === 'Success').reduce((sum, p) => sum + p.amount, 0) / 6) },
  ], [payments])

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-16 w-80 max-w-full" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-56" /></div>
  }

  const statusTone = activeSubscription?.status === 'Active' ? 'green' : activeSubscription?.status === 'Paused' ? 'amber' : 'slate'

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">My Subscription Portal</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Welcome back, {user?.name}! Manage your plans and billing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My Subscription" value={activeSubscription?.planName ?? 'No plan'} detail={activeSubscription?.productName} icon={Layers3} />
        <StatCard label="Next Payment" value={activeSubscription ? formatMoney(activeSubscription.amount) : formatMoney(0)} detail={activeSubscription ? formatDate(activeSubscription.nextBillingDate) : 'Nothing due'} icon={CreditCard} iconTone="bg-emerald-50 text-emerald-700" />
        <StatCard label="Unpaid Invoices" value={String(unpaidInvoices.length)} detail={overdueCount ? `${overdueCount} overdue` : 'All up to date'} icon={FileText} iconTone="bg-amber-50 text-amber-700" />
        <StatCard label="Billing History" value={String(payments.length)} detail={`${payments.filter(p => p.status === 'Success').length} successful payments`} icon={CalendarClock} iconTone="bg-violet-50 text-violet-700" />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Upcoming renewal</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{activeSubscription?.productName ?? 'No active plan'}</h2>
              {activeSubscription && <Badge tone={statusTone}>{activeSubscription.status}</Badge>}
            </div>
            <p className="mt-2 text-sm text-slate-500">{activeSubscription ? `${activeSubscription.planName} plan · ${formatDate(activeSubscription.nextBillingDate)} · ${countdownText(activeSubscription.nextBillingDate).replace('remaining', 'left')}` : 'Browse plans to get started.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={activeSubscription ? `/subscriptions/${activeSubscription.id}` : '/plans'} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">View Plan</Link>
            <Link to="/invoices" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">View Invoices</Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">Recent activity</h2>
          {activeSubscription ? <Timeline items={activeSubscription.activity} /> : <p className="text-sm text-slate-500">No subscription activity yet.</p>}
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Spend over time</h2>
            <p className="mt-1 text-sm text-slate-500">Successful payments in INR</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData}>
                <defs><linearGradient id="spend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={value => `₹${value / 1000}k`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fill="url(#spend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
