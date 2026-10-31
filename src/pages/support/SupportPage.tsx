import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { MessageSquareText, Send } from 'lucide-react'
import { createSupportTicket, getSupportTickets } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatDate } from '../../lib/dates'
import type { SupportTicket } from '../../types'

const schema = z.object({
  subject: z.string().trim().min(3, 'Add a short subject'),
  message: z.string().trim().min(10, 'Please add at least 10 characters'),
})
type SupportForm = z.infer<typeof schema>

export function SupportPage() {
  const user = useAppStore(state => state.user)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupportForm>({ resolver: zodResolver(schema) })

  const load = async () => {
    if (!user) return
    setLoading(true)
    setTickets(await getSupportTickets(user.id))
    setLoading(false)
  }
  useEffect(() => { void load() }, [user])

  const send = async (values: SupportForm) => {
    if (!user) return
    setSending(true)
    try {
      await createSupportTicket(user.id, values.subject, values.message)
      reset()
      toast.success('Support request sent.')
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send your request.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-950 dark:text-white">Support</h1><p className="mt-1 text-sm text-slate-500">Contact the Brightloop team or review past requests.</p></div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-slate-950 dark:text-white">Contact support</h2>
          <form onSubmit={handleSubmit(send)} className="mt-5 space-y-4">
            <div><label htmlFor="subject" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label><input id="subject" {...register('subject')} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="What can we help with?" />{errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}</div>
            <div><label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label><textarea id="message" rows={7} {...register('message')} className="w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Tell us what happened..." />{errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}</div>
            <button disabled={sending} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"><Send size={17}/>{sending ? 'Sending...' : 'Send message'}</button>
          </form>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-bold text-slate-950 dark:text-white">Past tickets</h2></div>
          {loading ? <div className="p-5"><Skeleton className="h-48"/></div> : tickets.length === 0 ? <EmptyState title="No support tickets" description="Your conversations with our team will appear here."/> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{tickets.map(ticket => <div key={ticket.id} className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><MessageSquareText size={17}/></span><div><h3 className="font-semibold text-slate-900 dark:text-white">{ticket.subject}</h3><p className="mt-1 text-xs text-slate-400">{formatDate(ticket.createdAt)}</p></div></div><Badge tone={ticket.status === 'Answered' ? 'green' : ticket.status === 'Open' ? 'amber' : 'slate'}>{ticket.status}</Badge></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{ticket.message}</p>{ticket.reply && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300"><strong className="text-slate-800 dark:text-slate-100">Brightloop reply:</strong> {ticket.reply}</div>}</div>)}</div>}
        </Card>
      </div>
    </div>
  )
}
