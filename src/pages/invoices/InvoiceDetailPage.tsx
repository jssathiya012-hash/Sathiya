import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import { getInvoice } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { AppLayout } from '../../components/AppLayout'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { formatDate, daysBetween } from '../../lib/dates'
import { formatMoney } from '../../lib/money'
import type { Invoice } from '../../types'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const user = useAppStore(state => state.user)
  const profile = useAppStore(state => state.user)
  const [invoice, setInvoice] = useState<Invoice>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !id) return
    getInvoice(user.id, id).then(setInvoice).catch(error => setError(error instanceof Error ? error.message : 'Invoice unavailable')).finally(() => setLoading(false))
  }, [user, id])

  const downloadPdf = async () => {
    const element = document.getElementById('invoice-print')
    if (!element) return
    try {
      const canvas = await html2canvas(element, { scale: 2 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const height = canvas.height * 190 / canvas.width
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, height)
      pdf.save(`${invoice?.number ?? 'invoice'}.pdf`)
      toast.success('PDF downloaded.')
    } catch {
      toast.error('Could not create the PDF.')
    }
  }

  if (loading) return <AppLayout><Skeleton className="h-[600px]"/></AppLayout>
  if (error || !invoice) return <AppLayout><Card className="p-10 text-center"><h1 className="text-xl font-bold">Not found / Access denied</h1><p className="mt-2 text-sm text-slate-500">This invoice is not available to your account.</p></Card></AppLayout>

  const overdue = invoice.status !== 'Paid' && new Date(invoice.dueDate) < new Date()
  const statusTone = invoice.status === 'Paid' ? 'green' : overdue ? 'red' : 'amber'
  const statusLabel = invoice.status === 'Paid' ? 'Paid' : overdue ? 'Overdue' : 'Unpaid'
  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between print:hidden"><a href="/invoices" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/>Back to invoices</a><div className="flex gap-2"><button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"><Printer size={16}/>Print</button><button onClick={downloadPdf} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"><Download size={16}/>Download PDF</button></div></div>
      <Card id="invoice-print" className="mx-auto max-w-4xl p-6 sm:p-10">
        <div className="flex items-start justify-between"><div><div className="text-xl font-bold text-indigo-700">Brightloop</div><p className="mt-1 text-xs text-slate-500">Software that helps business grow</p></div><Badge tone={statusTone}>{statusLabel}{overdue ? ` · ${daysBetween(invoice.dueDate, new Date())} days overdue` : ''}</Badge></div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase text-slate-400">Billed to</p><p className="mt-2 font-bold text-slate-950 dark:text-white">{profile?.name}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{profile?.companyName}</p><p className="mt-1 text-sm text-slate-500">{profile?.billingAddress.line1}, {profile?.billingAddress.city}</p><p className="text-sm text-slate-500">{profile?.billingAddress.state} {profile?.billingAddress.postalCode}</p><p className="mt-2 text-sm text-slate-500">GST: {profile?.gstNumber ?? 'Not provided'}</p></div><div className="sm:text-right"><p className="text-xs font-semibold uppercase text-slate-400">Invoice</p><p className="mt-2 text-lg font-bold">{invoice.number}</p><div className="mt-4 text-sm text-slate-600 dark:text-slate-300"><p>Invoice date: <strong>{formatDate(invoice.date)}</strong></p><p className="mt-1">Due date: <strong>{formatDate(invoice.dueDate)}</strong></p></div></div></div>
        <div className="mt-10 overflow-x-auto"><table className="w-full min-w-[520px] text-left"><thead><tr className="border-y border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700"><th className="py-3">Description</th><th className="py-3 text-right">Qty</th><th className="py-3 text-right">Rate</th><th className="py-3 text-right">Amount</th></tr></thead><tbody>{invoice.lines.map(line => <tr key={line.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-4 text-sm font-medium">{line.description}</td><td className="py-4 text-right text-sm">{line.quantity}</td><td className="py-4 text-right text-sm">{formatMoney(line.unitPrice)}</td><td className="py-4 text-right text-sm font-semibold">{formatMoney(line.total)}</td></tr>)}</tbody></table></div>
        <div className="ml-auto mt-6 w-full max-w-xs space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{formatMoney(invoice.lines.reduce((sum, line) => sum + line.total, 0))}</strong></div><div className="flex justify-between"><span className="text-slate-500">Discount</span><strong>-{formatMoney(invoice.discount)}</strong></div><div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><strong>{formatMoney(invoice.tax)}</strong></div><div className="flex justify-between border-t border-slate-200 pt-4 text-lg dark:border-slate-700"><span className="font-bold">Total</span><strong className="text-indigo-700">{formatMoney(invoice.total)}</strong></div></div>
      </Card>
      <style>{`@media print { body { background: white !important; } aside, header, .print\\:hidden { display:none !important; } main { padding:0 !important; } .lg\\:pl-64 { padding-left:0 !important; } }`}</style>
    </AppLayout>
  )
}
