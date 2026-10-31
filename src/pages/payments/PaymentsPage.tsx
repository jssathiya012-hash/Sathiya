import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, CreditCard, RefreshCw, Landmark, Smartphone } from 'lucide-react'
import { createPayment, getInvoices, getPayments, retryPayment, setPaymentOutcome } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { AppLayout } from '../../components/AppLayout'
import { Card } from '../../components/Card'
import { Table } from '../../components/Table'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatDate } from '../../lib/dates'
import { formatMoney } from '../../lib/money'
import type { Invoice, Payment } from '../../types'

export function PaymentsPage() {
  const user = useAppStore(state => state.user)
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [payOpen, setPayOpen] = useState(false)
  const [method, setMethod] = useState<'Card' | 'UPI' | 'Net Banking'>('Card')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [result, setResult] = useState<Payment>()
  const [paying, setPaying] = useState(false)
  const [demoOutcome, setDemoOutcome] = useState<'random' | 'success' | 'fail'>('random')

  const load = async () => {
    if (!user) return
    setLoading(true)
    const [pays, invs] = await Promise.all([getPayments(user.id), getInvoices(user.id)])
    setPayments(pays.sort((a, b) => b.date.localeCompare(a.date)))
    setInvoices(invs)
    setLoading(false)
  }
  useEffect(() => { void load() }, [user])

  const unpaid = useMemo(() => invoices.filter(invoice => invoice.status !== 'Paid'), [invoices])
  const nextInvoice = unpaid.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  useEffect(() => { if (nextInvoice && !selectedInvoiceId) setSelectedInvoiceId(nextInvoice.id) }, [nextInvoice, selectedInvoiceId])

  const pay = async () => {
    if (!user) return
    if (method === 'Card' && cardNumber.replace(/\s/g, '').length !== 16) { toast.error('Enter a 16-digit card number.'); return }
    setPaying(true)
    try {
      const invoice = invoices.find(item => item.id === selectedInvoiceId)
      const payment = await createPayment(user.id, invoice?.id, invoice?.total ?? nextInvoice?.total ?? 0, method)
      setResult(payment)
      await load()
      if (payment.status === 'Success') toast.success('Payment completed successfully.')
      else if (payment.status === 'Failed') toast.error('Payment failed. Please retry.')
      else toast('Payment is pending confirmation.')
    } finally { setPaying(false) }
  }

  const retry = async (payment: Payment) => {
    if (!user) return
    try {
      const updated = await retryPayment(user.id, payment.id, payment.method)
      toast(updated.status === 'Success' ? 'Retry succeeded!' : updated.status === 'Failed' ? 'Retry failed.' : 'Retry is pending.')
      await load()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Retry failed.') }
  }

  const changeOutcome = async (outcome: 'random' | 'success' | 'fail') => {
    if (!user) return
    setDemoOutcome(outcome)
    await setPaymentOutcome(user.id, outcome)
    toast.success(`Demo outcome set to ${outcome}.`)
  }

  const closePay = () => { setPayOpen(false); setResult(undefined); setCardNumber('') }

  return (
    <AppLayout>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-950 dark:text-white">Payments</h1><p className="mt-1 text-sm text-slate-500">Pay invoices and review payment history.</p></div><button disabled={!nextInvoice} onClick={() => setPayOpen(true)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Pay now</button></div>
        <div className="mb-5 grid gap-4 md:grid-cols-3"><Card className="p-5"><p className="text-sm text-slate-500">Next payment amount</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatMoney(nextInvoice?.total ?? 0)}</p></Card><Card className="p-5"><p className="text-sm text-slate-500">Payment due</p><p className="mt-2 text-lg font-bold">{nextInvoice ? formatDate(nextInvoice.dueDate) : 'No payment due'}</p></Card><Card className="p-5"><p className="mb-3 text-sm text-slate-500">Demo payment outcome</p><select value={demoOutcome} onChange={event => changeOutcome(event.target.value as typeof demoOutcome)} className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="random">Random</option><option value="success">Always success</option><option value="fail">Always fail</option></select></Card></div>
        <Card className="overflow-hidden">
          {loading ? <div className="p-5"><Skeleton className="h-64"/></div> : payments.length === 0 ? <EmptyState title="No payment history" description="Payments you make will appear here."/> : <Table><thead><tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900"><th className="px-5 py-3">Method</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Note</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"/></tr></thead><tbody>{payments.map(payment => <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-4 text-sm font-semibold">{payment.method}</td><td className="px-5 py-4 text-sm font-semibold">{formatMoney(payment.amount)}</td><td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(payment.date)}</td><td className="px-5 py-4 text-sm text-slate-500">{payment.note}</td><td className="px-5 py-4"><Badge tone={payment.status === 'Success' ? 'green' : payment.status === 'Pending' ? 'amber' : 'red'}>{payment.status}</Badge></td><td className="px-5 py-4">{payment.status === 'Failed' && <button onClick={() => retry(payment)} className="flex items-center gap-1 text-sm font-semibold text-indigo-700"><RefreshCw size={15}/>Retry</button>}</td></tr>)}</tbody></Table>}
        </Card>
      </div>

      <Modal open={payOpen} title={result ? 'Payment confirmation' : 'Pay invoice'} onClose={closePay}>
        {result ? <div className="text-center"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${result.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : result.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}><CheckCircle2 size={28}/></span><h2 className="mt-4 text-xl font-bold">{result.status === 'Success' ? 'Payment successful' : result.status === 'Pending' ? 'Payment pending' : 'Payment failed'}</h2><p className="mt-2 text-sm text-slate-500">{formatMoney(result.amount)} · {result.method}</p>{result.status === 'Success' && <button onClick={() => window.print()} className="mt-5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Download receipt</button>}</div> : <><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Invoice</label><select value={selectedInvoiceId} onChange={event => setSelectedInvoiceId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Select invoice</option>{unpaid.map(invoice => <option key={invoice.id} value={invoice.id}>{invoice.number} - {formatMoney(invoice.total)}</option>)}</select><div className="mt-5 grid grid-cols-3 gap-2">{(['Card','UPI','Net Banking'] as const).map(item => { const Icon = item === 'Card' ? CreditCard : item === 'UPI' ? Smartphone : Landmark; return <button key={item} onClick={() => setMethod(item)} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${method === item ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950' : 'border-slate-200 text-slate-600 dark:border-slate-700'}`}><Icon size={20}/>{item}</button> })}</div>{method === 'Card' && <div className="mt-5"><label className="mb-2 block text-sm font-medium text-slate-700">Card number</label><input value={cardNumber} onChange={event => setCardNumber(event.target.value)} inputMode="numeric" placeholder="4242 4242 4242 4242" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"/></div>}{method === 'UPI' && <input placeholder="name@bank" className="mt-5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"/>}{method === 'Net Banking' && <select className="mt-5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option>Demo Bank</option><option>Bright Bank</option></select>}<button disabled={!selectedInvoiceId || paying} onClick={pay} className="mt-5 h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white disabled:opacity-50">{paying ? 'Processing...' : 'Pay now'}</button></>}
      </Modal>
    </AppLayout>
  )
}
