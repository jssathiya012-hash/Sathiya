import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Layers3, Search } from 'lucide-react'
import { getCatalogue } from '../../api/mockApi'
import { formatMoney } from '../../lib/money'
import type { Plan, Product } from '../../types'
import { AppLayout } from '../../components/AppLayout'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { useAppStore } from '../../store/appStore'

export function PlansPage() {
  const user = useAppStore(state => state.user)
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCatalogue().then(data => { setProducts(data.products); setPlans(data.plans) }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => products.filter(product => `${product.name} ${product.type} ${product.description}`.toLowerCase().includes(search.toLowerCase())), [products, search])

  const content = (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-indigo-600">Choose your plan</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Simple plans that grow with you</h1><p className="mt-2 text-slate-600 dark:text-slate-400">Compare every option and choose what fits today.</p></div>
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {(['Monthly', 'Yearly'] as const).map(item => <button key={item} onClick={() => setFrequency(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${frequency === item ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>{item}{item === 'Yearly' && <span className="ml-2 text-xs text-emerald-300">Save 15%</span>}</button>)}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900" />
      </div>

      {loading ? <div className="grid gap-5 md:grid-cols-3">{[0,1,2].map(i => <Skeleton key={i} className="h-72" />)}</div> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(product => {
            const productPlans = plans.filter(plan => plan.productId === product.id)
            const lowest = Math.min(...productPlans.map(plan => frequency === 'Monthly' ? plan.monthlyPrice : plan.yearlyPrice / 12))
            const recommended = productPlans.find(plan => plan.recommended)
            return (
              <Card key={product.id} className="relative flex flex-col p-6">
                {recommended && <Badge tone="indigo">Popular</Badge>}
                <div className="mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950"><Layers3 size={24} /></div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">{product.type}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{product.name}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.description}</p>
                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Starting at</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{formatMoney(Math.round(lowest))}<span className="text-sm font-normal text-slate-500"> / month</span></p>
                </div>
                <Link to={`/plans/${product.id}`} className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">View plans <ArrowRight size={17} /></Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  return user ? <AppLayout>{content}</AppLayout> : <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950"><div className="mx-auto max-w-7xl">{content}</div></div>
}
