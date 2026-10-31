import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const submit = async (values: FormData) => {
    const result = await authApi.forgotPassword(values.email)
    setSent(true)
    toast.success(result.message)
  }
  if (sent) return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-lg items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <MailCheck className="mx-auto text-indigo-600" size={44} /><h1 className="mt-4 text-2xl font-bold">Check your email</h1><p className="mt-2 text-sm leading-6 text-slate-600">If an account exists for {getValues('email')}, we sent password reset instructions.</p><Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft size={16} />Back to login</Link>
      </section>
    </main>
  )
  return (
    <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-lg items-center px-6 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-slate-500"><ArrowLeft size={16} />Back</Link><h1 className="mt-5 text-2xl font-bold">Forgot your password?</h1><p className="mt-2 text-sm text-slate-600">Enter your email and we’ll send reset instructions.</p>
        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4"><div><label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label><input id="email" type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" {...register('email')} />{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}</div><button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white">{isSubmitting ? 'Sending...' : 'Send reset link'}</button></form>
      </section>
    </main>
  )
}
