import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getInvoices } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { AppLayout } from '../../components/AppLayout'
import { Card } from '../../components/Card'
import { Table } from '../../components/Table'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatDate, daysBetween } from '../../lib/dates'
import { formatMoney } from '../../lib/money'
import type { Invoice } from '../../types'

export function InvoicesPage() {
  const user = useAppStore(state => state.user)
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue'>('All')
  const [sortNewest, setSortNewest] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user) return
    getInvoices(user.id).then(setItems).finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    const result = items.filter(invoice => {
      const overdue = invoice.status !== 'Paid' && new Date(invoice.dueDate) < new Date()
      const matchesSearch = `${invoice.number} ${invoice.lines[0]?.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'All' || (filter === 'Paid' && invoice.status === 'Paid') || (filter === 'Unpaid' && invoice.status !== 'Paid' && !overdue) || (filter === 'Overdue' && overdue)
      return matchesSearch && matchesFilter
    })
    return result.sort((a, b) => sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
  }, [items, search, filter, sortNewest])

  const pageCount = Math.max(1, Math.ceil(filtered.length / 10))
  const visible = filtered.slice((page - 1) * 10, page * 10)
  useEffect(() => setPage(1), [search, filter, sortNewest])

  const displayStatus = (invoice: Invoice) => {
    if (invoice.status === 'Paid') return { label: 'Paid', tone: 'green' as const }
    if (new Date(invoice.dueDate) < new Date()) return { label: 'Overdue', tone: 'red' as const }
    return { label: 'Unpaid', tone: 'amber' as const }
  }

  return (
    <AppLayout>
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold text-slate-950 dark:text-white">Invoices</h1><p className="mt-1 text-sm text-slate-500">View and pay your Brightloop invoices.</p></div>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row dark:border-slate-800">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search invoices" className="h-10 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"/></div>
            <select value={filter} onChange={event => setFilter(event.target.value as typeof filter)} className="h-10 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option>All</option><option>Paid</option><option>Unpaid</option><option>Overdue</option></select>
            <button onClick={() => setSortNewest(value => !value)} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700"><SlidersHorizontal size={16}/>{sortNewest ? 'Newest first' : 'Oldest first'}</button>
          </div>
          {loading ? <div className="p-5"><Skeleton className="h-64 w-full"/></div> : visible.length === 0 ? <EmptyState title="No invoices found" description="Try another search or change the status filter."/> : (
            <>
              <Table><thead><tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900"><th className="px-5 py-3 font-semibold">Invoice</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Due date</th><th className="px-5 py-3 font-semibold">Amount</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3"/></tr></thead><tbody>{visible.map(invoice => { const status = displayStatus(invoice); const overdueDays = daysBetween(invoice.dueDate, new Date()); return <tr key={invoice.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{invoice.number}</td><td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(invoice.date)}</td><td className="px-5 py-4"><p className="text-sm text-slate-600 dark:text-slate-300">{formatDate(invoice.dueDate)}</p>{status.label === 'Overdue' && <p className="mt-1 text-xs text-red-600">{overdueDays} days overdue</p>}</td><td className="px-5 py-4 text-sm font-semibold">{formatMoney(invoice.total)}</td><td className="px-5 py-4"><Badge tone={status.tone}>{status.label}</Badge></td><td className="px-5 py-4"><Link to={`/invoices/${invoice.id}`} className="text-sm font-semibold text-indigo-700">View</Link></td></tr> })}</tbody></Table>
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-800"><span className="text-slate-500">{filtered.length} invoices</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page === pageCount} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
