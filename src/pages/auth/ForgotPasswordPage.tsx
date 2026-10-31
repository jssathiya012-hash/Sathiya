import { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { requestPasswordReset } from '../../api/mockApi'

const schema = z.object({ email: z.string().email('Enter a valid email address') })

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = schema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Enter a valid email')
      return
    }
    setLoading(true)
    setError('')
    try {
      const resetToken = await requestPasswordReset(email)
      setToken(resetToken)
      toast.success('Reset link created for this demo.')
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not create a reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={token ? 'Check your email' : 'Forgot password?'} subtitle={token ? 'A reset link has been prepared for this demo.' : 'Enter your email and we will help you reset it.'}>
      {token ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="shrink-0 text-emerald-600" size={22} />
            <div>
              <h2 className="font-semibold text-emerald-950">Reset link sent</h2>
              <p className="mt-1 text-sm text-emerald-800">This demo will open the reset screen directly.</p>
              <Link to={`/reset-password/${token}`} className="mt-4 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                Open demo reset link
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
            <input id="forgot-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="you@company.com" />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <button disabled={loading} className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Send reset link'}
          </button>
        </form>
      )}
      <Link to="/login" className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"><ArrowLeft size={16} /> Back to sign in</Link>
    </AuthLayout>
  )
}
