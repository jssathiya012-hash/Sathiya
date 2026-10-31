import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCatalogue, subscribe, validateDiscount } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { AppLayout } from '../../components/AppLayout'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { formatMoney } from '../../lib/money'
import type { DiscountRule, Plan, Product } from '../../types'

export function ProductPlansPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const user = useAppStore(state => state.user)
  const [product, setProduct] = useState<Product>()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly')
  const [quantity, setQuantity] = useState(1)
  const [variantExtras, setVariantExtras] = useState<Record<string, number>>({})
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState<DiscountRule>()
  const [discountError, setDiscountError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCatalogue().then(data => {
      const found = data.products.find(item => item.id === productId)
      setProduct(found)
      const foundPlans = data.plans.filter(plan => plan.productId === productId)
      setPlans(foundPlans)
      if (foundPlans[0]) {
        setSelectedPlanId(foundPlans.find(plan => plan.recommended)?.id ?? foundPlans[0].id)
        setQuantity(foundPlans.find(plan => plan.recommended)?.minimumQuantity ?? foundPlans[0].minimumQuantity)
      }
    }).finally(() => setLoading(false))
  }, [productId])

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId) ?? plans[0]
  useEffect(() => {
    if (selectedPlan && quantity < selectedPlan.minimumQuantity) setQuantity(selectedPlan.minimumQuantity)
  }, [selectedPlanId])

  const pricing = useMemo(() => {
    if (!selectedPlan) return { base: 0, extras: 0, subtotal: 0, discount: 0, tax: 0, total: 0 }
    const base = frequency === 'Monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice
    const extras = Object.values(variantExtras).reduce((sum, value) => sum + value, 0)
    const subtotal = (base + extras) * quantity
    const discountAmount = discount ? Math.round(subtotal * discount.percent / 100) : 0
    const taxable = subtotal - discountAmount
    const tax = Math.round(taxable * 0.18)
    return { base, extras, subtotal, discount: discountAmount, tax, total: taxable + tax }
  }, [selectedPlan, frequency, quantity, variantExtras, discount])

  const applyDiscount = async () => {
    if (!selectedPlan) return
    setDiscountError('')
    try {
      const rule = await validateDiscount(discountCode, quantity)
      setDiscount(rule)
      toast.success(`${rule.percent}% discount applied`)
    } catch (error) {
      setDiscount(undefined)
      setDiscountError(error instanceof Error ? error.message : 'Could not apply this code.')
    }
  }

  const subscribeNow = async () => {
    if (!user || !product || !selectedPlan) return navigate('/login', { state: { from: `/plans/${productId}` } })
    setSubmitting(true)
    try {
      await subscribe(user.id, product.id, selectedPlan.id, quantity, frequency, discount?.code)
      toast.success('Subscription created and invoice generated.')
      navigate('/subscriptions')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create subscription.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <AppLayout><Skeleton className="h-96" /></AppLayout>
  if (!product) return <AppLayout><Card className="p-10 text-center"><h1 className="text-xl font-bold">Product not found</h1></Card></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <div><p className="text-sm font-semibold text-indigo-600">{product.type}</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{product.name}</h1><p className="mt-2 text-slate-600 dark:text-slate-400">{product.description}</p></div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {(['Monthly', 'Yearly'] as const).map(item => <button key={item} onClick={() => setFrequency(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${frequency === item ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>{item}{item === 'Yearly' && <span className="ml-2 text-xs text-emerald-300">Save 15%</span>}</button>)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"><th className="p-4 text-sm text-slate-500">Plan</th>{plans.map(plan => <th key={plan.id} className={`p-4 text-sm ${plan.recommended ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''}`}>{plan.name}{plan.recommended && <Badge tone="indigo">Recommended</Badge>}</th>)}</tr></thead>
                  <tbody>
                    {[0,1,2].map(index => <tr key={index} className="border-b border-slate-100 dark:border-slate-800"><td className="p-4 text-sm text-slate-500">{index === 0 ? 'Monthly price' : index === 1 ? 'Yearly price' : 'Users included'}</td>{plans.map(plan => <td key={plan.id} className={`p-4 text-sm text-slate-700 dark:text-slate-300 ${plan.recommended ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''}`}>{index === 0 ? formatMoney(plan.monthlyPrice) : index === 1 ? formatMoney(plan.yearlyPrice) : plan.features.join(', ')}</td>)}</tr>)}
                    <tr><td className="p-4" /><td colSpan={plans.length} className="hidden" /></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map(plan => (
                <button key={plan.id} onClick={() => setSelectedPlanId(plan.id)} className={`relative rounded-2xl border p-5 text-left transition ${selectedPlanId === plan.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'}`}>
                  {plan.recommended && <Badge tone="indigo">Recommended</Badge>}
                  <h2 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{plan.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                  <p className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{formatMoney(frequency === 'Monthly' ? plan.monthlyPrice : plan.yearlyPrice)}<span className="text-xs font-normal text-slate-500">/{frequency === 'Monthly' ? 'month' : 'year'}</span></p>
                  <ul className="mt-4 space-y-2">{plan.features.map(feature => <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Check className="text-emerald-600" size={16} />{feature}</li>)}</ul>
                </button>
              ))}
            </div>

            <Card className="p-5">
              <h2 className="font-bold text-slate-950 dark:text-white">Add options</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {product.variants.map(variant => (
                  <div key={variant.id}><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{variant.name}</label><select className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={event => setVariantExtras(current => ({ ...current, [variant.id]: Number(event.target.value) }))}><option value="0">{variant.options[0].name}</option>{variant.options.slice(1).map(option => <option key={option.id} value={option.priceExtra}>{option.name} (+{formatMoney(option.priceExtra)})</option>)}</select></div>
                ))}
              </div>
              <div className="mt-5"><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label><div className="flex items-center gap-3"><button aria-label="Decrease quantity" onClick={() => setQuantity(value => Math.max(selectedPlan?.minimumQuantity ?? 1, value - 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 dark:border-slate-700"><Minus size={16} /></button><span className="w-12 text-center font-bold">{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(value => value + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 dark:border-slate-700"><Plus size={16} /></button><span className="text-xs text-slate-500">Minimum {selectedPlan?.minimumQuantity}</span></div></div>
            </Card>
          </div>

          <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="p-5">
              <h2 className="font-bold text-slate-950 dark:text-white">Price breakdown</h2>
              <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Base price</span><strong>{formatMoney(pricing.base)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Variant extras</span><strong>{formatMoney(pricing.extras)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Quantity</span><strong>× {quantity}</strong></div><div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{formatMoney(pricing.subtotal)}</strong></div><div className="flex justify-between text-emerald-700"><span>Discount</span><strong>-{formatMoney(pricing.discount)}</strong></div><div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><strong>{formatMoney(pricing.tax)}</strong></div><div className="flex justify-between border-t border-slate-200 pt-4 text-base dark:border-slate-700"><span className="font-semibold">Final total</span><strong className="text-indigo-700 dark:text-indigo-400">{formatMoney(pricing.total)}</strong></div></div>
            </Card>
            <Card className="p-5">
              <label htmlFor="discount" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Discount code</label>
              <div className="flex gap-2"><input id="discount" value={discountCode} onChange={event => setDiscountCode(event.target.value)} placeholder="Try SAVE10" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" /><button onClick={applyDiscount} className="rounded-xl border border-indigo-200 px-3 text-sm font-semibold text-indigo-700 dark:border-indigo-900">Apply</button></div>
              {discountError && <p className="mt-2 text-xs text-red-600">{discountError}</p>}
              {discount && <p className="mt-2 text-xs text-emerald-700">SAVE10 is active: {discount.percent}% off</p>}
              <button disabled={submitting} onClick={subscribeNow} className="mt-4 h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{submitting ? 'Creating...' : 'Subscribe'}</button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
