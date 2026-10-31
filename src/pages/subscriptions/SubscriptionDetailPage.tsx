import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarDays, Pause, Play, RefreshCw, ShieldAlert, XCircle } from 'lucide-react'
import { getCatalogue, getSubscription, updateSubscription } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { AppLayout } from '../../components/AppLayout'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { Timeline } from '../../components/Timeline'
import { Skeleton } from '../../components/Skeleton'
import { formatDate, countdownText } from '../../lib/dates'
import { formatMoney } from '../../lib/money'
import type { Plan, Subscription } from '../../types'

export function SubscriptionDetailPage() {
  const { id } = useParams()
  const user = useAppStore(state => state.user)
  const [subscription, setSubscription] = useState<Subscription>()
  const [plan, setPlan] = useState<Plan>()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [newPlanId, setNewPlanId] = useState('')
  const [reason, setReason] = useState('')

  const load = async () => {
    if (!user || !id) return
    const [item, catalogue] = await Promise.all([getSubscription(user.id, id), getCatalogue()])
    setSubscription(item)
    const currentPlan = catalogue.plans.find(value => value.id === item.planId)
    setPlan(currentPlan)
    setPlans(catalogue.plans.filter(value => value.productId === item.productId && value.id !== item.planId))
    setLoading(false)
  }
  useEffect(() => { void load() }, [user, id])

  const runAction = async (action: 'pause' | 'resume' | 'cancel' | 'renew' | 'upgrade') => {
    if (!user || !id) return
    setActionLoading(true)
    try {
      const updated = await updateSubscription(user.id, id, action, reason, newPlanId || undefined)
      setSubscription(updated)
      if (action === 'cancel') setCancelOpen(false)
      if (action === 'upgrade') setUpgradeOpen(false)
      toast.success(action === 'upgrade' ? 'Plan changed successfully.' : action === 'renew' ? 'Subscription renewed.' : `Subscription ${action}d successfully.`)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update subscription.')
    } finally {
      setActionLoading(false)
    }
  }

  const selectedNewPlan = useMemo(() => plans.find(item => item.id === newPlanId), [plans, newPlanId])
  const preview = useMemo(() => {
    if (!subscription || !selectedNewPlan) return null
    const daysRemaining = Math.max(0, Math.ceil((new Date(subscription.nextBillingDate).getTime() - Date.now()) / 86400000))
    const cycleDays = subscription.billingFrequency === 'Yearly' ? 365 : 30
    const oldAmount = subscription.billingFrequency === 'Yearly' ? subscription.amount : subscription.amount
    const credit = Math.round(oldAmount * daysRemaining / cycleDays)
    const newCost = subscription.billingFrequency === 'Yearly' ? selectedNewPlan.yearlyPrice : selectedNewPlan.monthlyPrice
    return { credit, newCost, due: Math.max(0, newCost - credit), daysRemaining }
  }, [subscription, selectedNewPlan])

  if (loading) return <AppLayout><Skeleton className="h-96" /></AppLayout>
  if (!subscription || !plan) return <AppLayout><Card className="p-10 text-center"><ShieldAlert className="mx-auto text-red-500" size={36}/><h1 className="mt-3 text-xl font-bold">Subscription not found or access denied</h1></Card></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-indigo-600">{subscription.productName}</p><h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{subscription.planName} plan</h1><p className="mt-2 text-sm text-slate-500">Subscription {subscription.id}</p></div><Badge tone={subscription.status === 'Active' ? 'green' : subscription.status === 'Paused' ? 'amber' : subscription.status === 'Closed' ? 'red' : 'slate'}>{subscription.status}</Badge></div>
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800"><div><p className="text-xs text-slate-500">Start date</p><p className="mt-1 font-semibold">{formatDate(subscription.startDate)}</p></div><div><p className="text-xs text-slate-500">Expiry date</p><p className="mt-1 font-semibold">{formatDate(subscription.expiryDate)}</p></div><div><p className="text-xs text-slate-500">Next billing</p><p className="mt-1 font-semibold">{formatDate(subscription.nextBillingDate)}</p></div><div><p className="text-xs text-slate-500">Renewal countdown</p><p className="mt-1 font-semibold text-indigo-700">{countdownText(subscription.nextBillingDate)}</p></div></div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-slate-950 dark:text-white">Subscription actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {subscription.status === 'Active' && <span title={plan.pausable ? '' : 'This plan does not allow pauses'}><button disabled={!plan.pausable || actionLoading} onClick={() => runAction('pause')} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"><Pause size={16}/>Pause</button></span>}
            {subscription.status === 'Paused' && <button disabled={actionLoading} onClick={() => runAction('resume')} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"><Play size={16}/>Resume</button>}
            {subscription.status !== 'Closed' && <span title={plan.closableEarly ? '' : 'This plan closes only at the end of its period'}><button disabled={!plan.closableEarly || actionLoading} onClick={() => setCancelOpen(true)} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"><XCircle size={16}/>Cancel</button></span>}
            <span title={plan.renewable ? '' : 'This plan is not renewable'}><button disabled={!plan.renewable || actionLoading} onClick={() => runAction('renew')} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={16}/>Renew</button></span>
            {plans.length > 0 && subscription.status !== 'Closed' && <button onClick={() => setUpgradeOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><CalendarDays size={16}/>Upgrade / Change plan</button>}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">Activity timeline</h2>
          <Timeline items={subscription.activity} />
        </Card>
      </div>

      <Modal open={cancelOpen} title="Cancel subscription?" onClose={() => setCancelOpen(false)}>
        <p className="text-sm text-slate-600 dark:text-slate-300">Tell us why you are leaving. This is optional.</p>
        <textarea value={reason} onChange={event => setReason(event.target.value)} rows={4} className="mt-4 w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Reason for cancellation" />
        <div className="mt-5 flex justify-end gap-2"><button onClick={() => setCancelOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Keep subscription</button><button disabled={actionLoading} onClick={() => runAction('cancel')} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">Cancel subscription</button></div>
      </Modal>

      <Modal open={upgradeOpen} title="Change plan" onClose={() => setUpgradeOpen(false)}>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Choose a new plan</label>
        <select value={newPlanId} onChange={event => setNewPlanId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Select a plan</option>{plans.map(item => <option key={item.id} value={item.id}>{item.name} - {formatMoney(subscription.billingFrequency === 'Yearly' ? item.yearlyPrice : item.monthlyPrice)}</option>)}</select>
        {preview && <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950"><div className="flex justify-between"><span className="text-slate-500">Credit for {preview.daysRemaining} unused days</span><strong className="text-emerald-700">-{formatMoney(preview.credit)}</strong></div><div className="mt-3 flex justify-between"><span className="text-slate-500">New plan cost</span><strong>{formatMoney(preview.newCost)}</strong></div><div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base dark:border-slate-800"><span className="font-semibold">Amount due today</span><strong className="text-indigo-700">{formatMoney(preview.due)}</strong></div></div>}
        <button disabled={!selectedNewPlan || actionLoading} onClick={() => runAction('upgrade')} className="mt-5 h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white disabled:opacity-50">Confirm change</button>
      </Modal>
    </AppLayout>
  )
}
